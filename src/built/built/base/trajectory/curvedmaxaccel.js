define(["require", "exports", "base/constants", "base/coordinates", "base/geom", "base/mathutil", "base/plot", "base/referee", "base/trajectory", "base/vector", "base/vis", "base/world", "base/trajectory/directrotation", "base/trajectory/pathhelper"], function (require, exports, Constants, coordinates_1, geom, MathUtil, plot, Referee, trajectory_1, vector_1, vis, World, directrotation_1, PathHelper) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CurvedMaxAccel = void 0;
    function _preprocessPath(waypoints, maxError, robotPos, robotSpeed) {
        let startDir = waypoints[1].sub(waypoints[0]);
        if (startDir.dot(robotSpeed) > 0 && robotSpeed.length() > 0.1 && waypoints.length >= 3) {
            let perpendicular = robotSpeed.perpendicular().normalized();
            let [cornerPos, lambda1, lambda2] = geom.intersectLineLine(robotPos, robotSpeed, waypoints[1], perpendicular);
            let angleDiff = startDir.angleDiff(waypoints[2].sub(waypoints[0]));
            if (cornerPos && lambda1 > 0 && angleDiff * lambda2 < 0) {
                let magicScale = Math.sqrt(2) / 2;
                waypoints[1] = waypoints[1].add(perpendicular.mul((MathUtil.bound(-maxError, lambda2, maxError) * magicScale)));
            }
        }
    }
    function _calculateCurveSpeedLimits(waypoints, accelLimit, maxSpeed, maxError, startSpeed, endSpeed) {
        let lastPathDir = waypoints[1].sub(waypoints[0]);
        let xRemaining = lastPathDir.length();
        let prev = waypoints[1];
        let maxSpeedProfile = [[startSpeed, maxSpeed, 0]];
        for (let i = 2; i < waypoints.length; i++) {
            let newPathDir = waypoints[i].sub(prev);
            let angleDiff = Math.min(lastPathDir.absoluteAngleDiff(newPathDir), Math.PI - 0.001);
            if (angleDiff < 0.001 || lastPathDir.length() < 0.005) {
                if (xRemaining > 0) {
                    maxSpeedProfile.push([maxSpeed, maxSpeed, xRemaining]);
                }
                xRemaining = newPathDir.length();
            }
            else {
                let angleSin = Math.sin((Math.PI - angleDiff) / 2);
                let angleTan = Math.tan((Math.PI - angleDiff) / 2);
                let radius = maxError * angleSin / (1 - angleSin);
                let maxRadius = maxSpeed * maxSpeed / accelLimit;
                radius = Math.min(radius, maxRadius);
                let possibleStartRadius = xRemaining * angleTan;
                let startRadius = Math.min(radius, possibleStartRadius);
                let maxStartSpeed = Math.sqrt(startRadius * accelLimit);
                let xMaxNext = newPathDir.length() * 0.5;
                let possibleEndRadius = xMaxNext * angleTan;
                let endRadius = Math.min(radius, possibleEndRadius);
                let maxEndSpeed = Math.sqrt(endRadius * accelLimit);
                let startDist = startRadius * (1 / angleTan);
                let endDist = endRadius * (1 / angleTan);
                if (i === 2 && startDist < endDist) {
                    maxStartSpeed = maxEndSpeed;
                    startDist = endDist;
                }
                let actualDist = angleDiff * (startRadius + endRadius) * 0.5;
                if (xRemaining > startDist) {
                    maxSpeedProfile.push([maxSpeed, maxSpeed, xRemaining - startDist]);
                }
                maxSpeedProfile.push([maxStartSpeed, maxEndSpeed, actualDist, true]);
                vis.addPathRaw("waypoints", [prev.sub(lastPathDir.withLength(startDist)), prev.add(newPathDir.withLength(endDist))], vis.colors.blue);
                xRemaining = newPathDir.length() - endDist;
            }
            lastPathDir = newPathDir;
            prev = waypoints[i];
        }
        if (xRemaining > 0) {
            maxSpeedProfile.push([maxSpeed, endSpeed, xRemaining]);
        }
        return maxSpeedProfile;
    }
    function _backpropagateSpeedLimit(speedProfile, maxSpeed, brake) {
        if (speedProfile[speedProfile.length - 1][1] <= maxSpeed) {
            return;
        }
        let endTime = speedProfile[speedProfile.length - 1][0];
        if (endTime === 0) {
            speedProfile.splice(0, speedProfile.length);
            speedProfile.push([0, maxSpeed]);
            return;
        }
        let distance = 0;
        for (let i = speedProfile.length - 2; i >= 0; i--) {
            let entry = speedProfile[i];
            let nextEntry = speedProfile[i + 1];
            distance = distance + (nextEntry[1] + entry[1]) / 2 * (nextEntry[0] - entry[0]);
            let fullBrakeTime = (-maxSpeed + Math.sqrt(maxSpeed * maxSpeed - 2 * brake * distance)) / (-brake);
            let maxTimedSpeed = maxSpeed - brake * fullBrakeTime;
            if (entry[1] < maxTimedSpeed) {
                let oldAccel = (nextEntry[1] - entry[1]) / (nextEntry[0] - entry[0]);
                let switchAfter = (maxTimedSpeed - entry[1]) / (oldAccel - brake);
                let switchTime = entry[0] + switchAfter;
                let switchSpeed = entry[1] + switchAfter * oldAccel;
                let brakeTime = (switchSpeed - maxSpeed) / (-brake);
                let missingDistance = distance - (entry[1] + switchSpeed) / 2 * switchAfter
                    - (switchSpeed + maxSpeed) / 2 * brakeTime;
                let injectTime = Math.max(0, missingDistance / switchSpeed);
                if (oldAccel > 0) {
                    let v_0 = switchSpeed, a = oldAccel, b = brake, d = missingDistance;
                    let t1 = MathUtil.solveSq(b - a, 2 * (b - a) * v_0, -2 * b * d)[0];
                    if (t1 != undefined && t1 > 0) {
                        switchTime = switchTime + t1;
                        switchSpeed = switchSpeed + t1 * oldAccel;
                        injectTime = 0;
                        brakeTime = (switchSpeed - maxSpeed) / (-brake);
                    }
                }
                speedProfile.splice(i + 1, speedProfile.length - i - 1);
                if (switchSpeed !== entry[1]) {
                    speedProfile.push([switchTime, switchSpeed]);
                }
                if (injectTime > 0) {
                    speedProfile.push([switchTime + injectTime, switchSpeed]);
                }
                speedProfile.push([switchTime + injectTime + brakeTime, maxSpeed]);
                return;
            }
        }
        let startSpeed = speedProfile[0][1];
        endTime = 2 * distance / (startSpeed + maxSpeed);
        speedProfile.splice(0, speedProfile.length);
        speedProfile.push([0, startSpeed]);
        speedProfile.push([endTime, maxSpeed]);
    }
    function _addLinearSpeedSegment(speedProfile, startSpeed, endSpeed, distance, accelerate, brake) {
        let startEntry = speedProfile[speedProfile.length - 1];
        let startTime = startEntry[0];
        let speed = startEntry[1];
        if (startSpeed < speed) {
            throw new Error("invalid speedProfile");
        }
        let accelTime = 0;
        let accel = accelerate;
        let linearAccel = (endSpeed - speed) / distance * (endSpeed + speed) / 2;
        if (linearAccel > accelerate || linearAccel < brake) {
            accel = MathUtil.bound(brake, linearAccel, accelerate);
            accelTime = (-speed + Math.sqrt(speed * speed + 2 * accel * distance)) / accel;
        }
        else if (startSpeed === endSpeed) {
            accelTime = (-speed + Math.sqrt(speed * speed + 2 * accelerate * distance)) / accelerate;
            accelTime = Math.min(accelTime, (startSpeed - speed) / accelerate);
        }
        else if (speed < startSpeed - 0.001) {
            let a = accelerate, d = distance, v_0 = speed, v_s = startSpeed, v_e = endSpeed;
            accelTime = (Math.sqrt((4 * v_0 * v_0 + 8 * a * d) * v_s * v_s + (-4 * v_0 * v_e * v_e - 4 * v_0 * v_0 * v_0 - 8 * a * d * v_0) * v_s + v_e * v_e * v_e * v_e
                + (2 * v_0 * v_0 - 4 * a * d) * v_e * v_e + v_0 * v_0 * v_0 * v_0 + 4 * a * d * v_0 * v_0 + 4 * a * a * d * d) - 2 * v_0 * v_s + v_e * v_e + v_0 * v_0 - 2 * a * d) / (2 * a * v_s - 2 * a * v_0);
        }
        if (accelTime > 0) {
            let accelSpeed = speed + accelTime * accel;
            speedProfile.push([startTime + accelTime, accelSpeed]);
            startTime = startTime + accelTime;
            distance = distance - accelTime * (speed + accelSpeed) / 2;
            startSpeed = accelSpeed;
        }
        if (distance > 0.00001) {
            let linTime = (2 * distance) / (startSpeed + endSpeed);
            speedProfile.push([startTime + linTime, endSpeed]);
        }
    }
    function _calculate1DSpeedProfile(maxSpeedProfile, accelerate, brake) {
        let speedProfile = [[0, maxSpeedProfile[0][0]]];
        let initialSpeed = speedProfile[0][1];
        if (initialSpeed < 0) {
            let brakeTime = initialSpeed / brake;
            let brakeDist = (-initialSpeed) / 2 * brakeTime;
            speedProfile.push([brakeTime, 0]);
            if (brakeTime < 0) {
                throw new Error("invalid brake time");
            }
            let vrestore = Math.sqrt(2 * accelerate * brakeDist);
            let restoreTime = vrestore / accelerate;
            speedProfile.push([brakeTime + restoreTime, vrestore]);
        }
        for (let i = 1; i < maxSpeedProfile.length; i++) {
            let segment = maxSpeedProfile[i];
            let startSpeed = segment[0];
            let endSpeed = segment[1];
            let distance = segment[2];
            let linearSpeedChange = segment[3];
            _backpropagateSpeedLimit(speedProfile, startSpeed, brake);
            if (linearSpeedChange) {
                _addLinearSpeedSegment(speedProfile, startSpeed, endSpeed, distance, accelerate, brake);
            }
            else {
                _addLinearSpeedSegment(speedProfile, startSpeed, startSpeed, distance, accelerate, brake);
            }
            _backpropagateSpeedLimit(speedProfile, endSpeed, brake);
        }
        return speedProfile;
    }
    function _decreaseDistance(speedProfile, cutoffDistance) {
        let currentDistance = 0;
        let cutoffAfter = 1;
        for (let i = speedProfile.length - 2; i >= 0; i--) {
            let segmentDistance = (speedProfile[i + 1][1] + speedProfile[i][1]) / 2 * (speedProfile[i + 1][0] - speedProfile[i][0]);
            if (currentDistance <= cutoffDistance && cutoffDistance < currentDistance + segmentDistance) {
                let accel = (speedProfile[i + 1][1] - speedProfile[i][1]) / (speedProfile[i + 1][0] - speedProfile[i][0]);
                let endSpeed = speedProfile[i + 1][1];
                let distLeft = cutoffDistance - currentDistance;
                let time;
                if (accel === 0) {
                    time = distLeft / endSpeed;
                }
                else {
                    time = (-endSpeed + Math.sqrt(endSpeed * endSpeed - 2 * accel * distLeft)) / -accel;
                }
                speedProfile[i + 1][0] = speedProfile[i + 1][0] - time;
                speedProfile[i + 1][1] = speedProfile[i][1] + (speedProfile[i + 1][0] - speedProfile[i][0]) * accel;
                currentDistance = cutoffDistance;
                cutoffAfter = i + 2;
                break;
            }
            else {
                currentDistance = currentDistance + segmentDistance;
            }
        }
        speedProfile.splice(cutoffAfter + 1, speedProfile.length - cutoffAfter - 1);
        return currentDistance;
    }
    function _injectExponentialFalloff(speedProfile, exponentialTime, exponentialError, brake, endSpeedLen) {
        if (speedProfile[speedProfile.length - 1][1] >= endSpeedLen
            && speedProfile[speedProfile.length - 2][1] > speedProfile[speedProfile.length - 1][1]) {
            let k = 1 / exponentialTime;
            let timeFactor = -Math.log(exponentialError);
            let expStartSpeed = exponentialTime * -brake;
            let expDistance = expStartSpeed * exponentialTime;
            let distance = expDistance + timeFactor * exponentialTime * endSpeedLen;
            let actualDistance = _decreaseDistance(speedProfile, distance);
            if (actualDistance >= distance) {
                let startSpeed = expStartSpeed + endSpeedLen;
                _backpropagateSpeedLimit(speedProfile, startSpeed, brake);
            }
            else {
                let time = 2 * exponentialTime;
                let expTime = timeFactor * exponentialTime;
                for (let i = 0; i < 10; i++) {
                    let e = Math.exp(-k * time);
                    let err = Math.max(0, time - expTime) * endSpeedLen - e * expDistance + actualDistance;
                    let diff;
                    if (time < expTime) {
                        diff = expStartSpeed * e + endSpeedLen;
                    }
                    else {
                        diff = expStartSpeed * e;
                    }
                    time = MathUtil.bound(0, time - err / diff, 10 * exponentialTime);
                }
                timeFactor = Math.max(0, timeFactor - time / exponentialTime);
                let curSpeedLimit = expStartSpeed * Math.exp(-k * time) + endSpeedLen;
                speedProfile.splice(0, speedProfile.length);
                speedProfile.push([0, curSpeedLimit]);
                let timeQuantum = 0.001;
                if (timeFactor * exponentialTime > timeQuantum) {
                    speedProfile.push([timeQuantum, curSpeedLimit]);
                }
            }
            let endTime = speedProfile[speedProfile.length - 1][0] + timeFactor * exponentialTime;
            speedProfile.push([endTime, speedProfile[speedProfile.length - 1][1]]);
        }
        return speedProfile;
    }
    function _speedAtTime(speedProfile, time) {
        let endIdx = speedProfile.length;
        for (let i = 1; i < speedProfile.length; i++) {
            if (speedProfile[i][0] >= time) {
                endIdx = i;
                break;
            }
        }
        if (endIdx >= speedProfile.length) {
            return speedProfile[speedProfile.length - 1][1];
        }
        else {
            let accel = (speedProfile[endIdx][1] - speedProfile[endIdx - 1][1]) / (speedProfile[endIdx][0] - speedProfile[endIdx - 1][0]);
            if (speedProfile[endIdx][0] - speedProfile[endIdx - 1][0] === 0) {
                accel = 0;
            }
            return speedProfile[endIdx - 1][1] + accel * (time - speedProfile[endIdx - 1][0]);
        }
    }
    function _calculateSpeed(robotId, waypoints, maxSpeedProfile, speedProfile, robotSpeed, accelLimit, sidewardsErrorFactor) {
        let timeOffset = 0.00;
        let timeStep = 0.02;
        let speed = _speedAtTime(speedProfile, timeOffset);
        let speedNextStep = _speedAtTime(speedProfile, timeOffset + timeStep);
        let accel = (speedNextStep - speed) * (1 / timeStep);
        if (speedProfile[1][0] === speedProfile[0][0]) {
            accel = 0;
        }
        if (robotSpeed.length() < speed - 0.001 && accel < 0) {
            accel = 0;
        }
        if (speed < 0) {
            speed = 0;
            accel = 0;
        }
        speed = Math.max(0, speed);
        let moveDir = waypoints[1].sub(waypoints[0]);
        let speedVector = moveDir.withLength(speed);
        let accelVector = moveDir.withLength(accel);
        plot.addPlot(`${robotId}.speed`, speed);
        if (speedVector.length() >= 0.0001) {
            if (maxSpeedProfile.length >= 2 && maxSpeedProfile[1][3]) {
                let forwardDir = moveDir.normalized().dot(robotSpeed);
                let angle = (waypoints[1].sub(waypoints[0])).angleDiff(waypoints[2].sub(waypoints[1]));
                let scale = MathUtil.bound(0.02, Math.min(forwardDir, speed) / Math.max(maxSpeedProfile[1][0], maxSpeedProfile[1][1]), 1);
                accelVector = accelVector.sub(moveDir.perpendicular().withLength(MathUtil.sign(angle) * accelLimit * scale * scale));
            }
            let sidewardSpeed = moveDir.perpendicular().normalized();
            sidewardSpeed.withLength(-sidewardSpeed.dot(robotSpeed) * sidewardsErrorFactor);
            accelVector = accelVector.add(sidewardSpeed);
        }
        return [speedVector, accelVector];
    }
    class CurvedMaxAccel extends trajectory_1.TrajectoryHandler {
        constructor() {
            super(...arguments);
            this.rotationCalculation = new directrotation_1.DirectRotation();
        }
        _getPath(targetPos) {
            this._robot.path.setProbabilities(0.15, 0.65);
            PathHelper.insertObstacles(this._robot, true, targetPos);
            targetPos = coordinates_1.Coordinates.toGlobal(targetPos);
            let robotPos = coordinates_1.Coordinates.toGlobal(this._robot.pos);
            let waypoints = this._robot.path.getPath(robotPos.x, robotPos.y, targetPos.x, targetPos.y);
            let waypointsVector = [];
            for (let i = 0; i < waypoints.length; i++) {
                waypointsVector.push(new vector_1.Vector(waypoints[i].p_x, waypoints[i].p_y));
            }
            let waypointsColor = vis.colors.yellow;
            if (waypointsVector[waypointsVector.length - 1].distanceTo(targetPos) > 0.01) {
                waypointsColor = vis.colors.orange;
            }
            vis.addPathRaw("waypoints", waypointsVector, waypointsColor);
            if (waypointsVector.length <= 1) {
                if (robotPos.distanceTo(targetPos) > 0.01) {
                    vis.addCircleRaw("waypoints", robotPos, 0.05, vis.colors.orangeHalf);
                }
                return [];
            }
            else if (waypointsVector.length === 2 && waypointsVector[0].distanceTo(waypointsVector[1]) < 0.0001) {
                return [];
            }
            return waypointsVector;
        }
        update(targetPos, targetDir = 0, maxSpeed = this._robot.maxSpeed, endSpeed = new vector_1.Vector(0, 0), accelScale = 1.0, dribble = false) {
            let directionVector = vector_1.Vector.fromPolar(targetDir, 0.09);
            vis.addPath("MoveTo", [targetPos, targetPos.add(directionVector)], vis.colors.yellowHalf);
            if (endSpeed != undefined && endSpeed.length() > 0.001) {
                vis.addPath("MoveTo", [targetPos, targetPos.add(endSpeed)], vis.colors.whiteQuarter);
            }
            let maxError = 0.03;
            let accelerationFactor = accelScale;
            let exponentialTime = 0.1;
            let exponentialError = 0.2;
            let sidewardsErrorFactor = 10;
            let rotationExponentialTime = 0.1;
            let rotationAccelerationFactor = dribble ? 0.25 : 1;
            if (Referee.isSlowDriveState()) {
                maxSpeed = Math.min(maxSpeed, (World.IsLargeField ? Constants.stopSpeed : 1) - 0.25);
            }
            endSpeed = endSpeed != undefined ? coordinates_1.Coordinates.toGlobal(endSpeed) : new vector_1.Vector(0, 0);
            let robotPos = coordinates_1.Coordinates.toGlobal(this._robot.pos);
            let robotSpeed = coordinates_1.Coordinates.toGlobal(this._robot.speed);
            let robotDir = coordinates_1.Coordinates.toGlobal(this._robot.dir);
            let rotAccelerate = Math.abs(this._robot.acceleration
                ? this._robot.acceleration.aSpeedupPhiMax : 1.0) * rotationAccelerationFactor;
            let rotBrake = -Math.abs(this._robot.acceleration
                ? this._robot.acceleration.aBrakePhiMax : 1.0) * rotationAccelerationFactor;
            let rotMaxSpeed = dribble ? 1.0 : this._robot.maxAngularSpeed;
            let waypoints = this._getPath(targetPos);
            if (waypoints.length === 0) {
                targetDir = coordinates_1.Coordinates.toGlobal(targetDir);
                let [angularSpeed, angularAccel] = this.rotationCalculation.calculateRotationHysteresis(robotDir, this._robot.angularSpeed, targetDir, rotAccelerate, rotBrake, rotMaxSpeed, rotationExponentialTime);
                let spline = [{ t_start: 0, t_end: Infinity,
                        x: { a0: robotPos.x, a1: endSpeed.x, a2: 0, a3: 0 },
                        y: { a0: robotPos.y, a1: endSpeed.y, a2: 0, a3: 0 },
                        phi: { a0: robotDir, a1: angularSpeed, a2: angularAccel / 2, a3: 0 }
                    }];
                return [{ spline: spline }, targetPos, 0];
            }
            if (waypoints[waypoints.length - 1].distanceTo(coordinates_1.Coordinates.toGlobal(targetPos)) > 0.02) {
                endSpeed = new vector_1.Vector(0, 0);
            }
            let accelLimit = Math.abs(this._robot.acceleration.aSpeedupSMax);
            let accelerate = Math.abs(this._robot.acceleration.aSpeedupFMax) * accelerationFactor;
            let brake = -Math.abs(this._robot.acceleration.aBrakeFMax) * accelerationFactor * (dribble ? 0.8 : 1);
            _preprocessPath(waypoints, maxError, robotPos, robotSpeed);
            for (let w of waypoints) {
                vis.addCircleRaw("waypoints_raw", w, 0.1, vis.colors.green);
            }
            let startSpeed = (waypoints[1].sub(waypoints[0])).normalized().dot(robotSpeed);
            let endSpeedLen = Math.max(0, (waypoints[waypoints.length - 1].sub(waypoints[waypoints.length - 2])).normalized().dot(endSpeed));
            let maxSpeedProfile = _calculateCurveSpeedLimits(waypoints, accelLimit, maxSpeed, maxError, startSpeed, endSpeedLen);
            let speedProfile = _calculate1DSpeedProfile(maxSpeedProfile, accelerate, brake);
            _injectExponentialFalloff(speedProfile, exponentialTime, exponentialError, brake, endSpeedLen);
            let [speedVector, accelVector] = _calculateSpeed(this._robot.id, waypoints, maxSpeedProfile, speedProfile, robotSpeed, accelLimit, sidewardsErrorFactor);
            if (dribble && waypoints.length > 1 && waypoints[0].distanceTo(waypoints[1]) > 0.01) {
                targetDir = (waypoints[1].sub(waypoints[0])).angle();
                let sgn = 1;
                let sin = Math.sin(accelVector.angleDiff(speedVector));
                if (Math.abs(sin) < 0.1 || accelVector.length() < 0.1) {
                    sgn = 0;
                }
                else if (sin < 0) {
                    sgn = -1;
                }
                if (sgn !== 0) {
                    vis.addCircleRaw("circle_fitting", robotPos.add(speedVector.perpendicular().mul(sgn)), speedVector.length(), vis.colors.green);
                    let speed = speedVector.length();
                    let phi = -Math.atan(speed / Math.abs(World.BallModel.FastBallDeceleration));
                    targetDir = targetDir + sgn * phi;
                }
            }
            else {
                targetDir = coordinates_1.Coordinates.toGlobal(targetDir);
            }
            let [angularSpeed, angularAccel] = this.rotationCalculation.calculateRotationHysteresis(robotDir, this._robot.angularSpeed, targetDir, rotAccelerate, rotBrake, rotMaxSpeed, rotationExponentialTime);
            let spline = [{ t_start: 0, t_end: Infinity,
                    x: { a0: robotPos.x, a1: speedVector.x, a2: accelVector.x / 2, a3: 0 },
                    y: { a0: robotPos.y, a1: speedVector.y, a2: accelVector.y / 2, a3: 0 },
                    phi: { a0: robotDir, a1: angularSpeed, a2: angularAccel / 2, a3: 0 }
                }];
            let endTime = speedProfile[speedProfile.length - 1][1];
            return [{ spline: spline }, targetPos, endTime];
        }
        canHandle(...args) {
            return true;
        }
    }
    exports.CurvedMaxAccel = CurvedMaxAccel;
});
//# sourceMappingURL=curvedmaxaccel.js.map