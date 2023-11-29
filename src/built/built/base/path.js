define(["require", "exports", "base/amun", "base/coordinates", "base/option", "base/vector", "base/vis"], function (require, exports, amun_1, coordinates_1, Option, vector_1, vis) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Path = exports.getOriginalPath = void 0;
    let pathLocal = path;
    path = undefined;
    let teamIsBlue = amun.isBlue();
    let isPerformanceMode = amun.getPerformanceMode();
    const USE_NEW_MOVING_LINE_VIS = Option.addOption("Use new moving line visualization", false);
    function getOriginalPath() {
        return pathLocal;
    }
    exports.getOriginalPath = getOriginalPath;
    class Path {
        constructor(robotId) {
            this.circleObstacles = [];
            this.lineObstacles = [];
            this.rectObstacles = [];
            this.triangleObstacles = [];
            this.lastWasTrajectoryPath = false;
            this._inst = pathLocal.createPath();
            this._trajectoryInst = pathLocal.createTrajectoryPath();
            if (this._trajectoryInst.setRobotId) {
                this._trajectoryInst.setRobotId(robotId);
            }
            this._robotId = robotId;
        }
        robotId() {
            return this._robotId;
        }
        seedRandom(seed) {
            this._inst.seedRandom(seed);
            this._trajectoryInst.seedRandom(seed);
        }
        addObstaclesToPath(path) {
            for (let circle of this.circleObstacles) {
                path.addCircle(circle.x, circle.y, circle.radius, circle.name, circle.prio);
            }
            for (let line of this.lineObstacles) {
                path.addLine(line.start_x, line.start_y, line.stop_x, line.stop_y, line.radius, line.name, line.prio);
            }
            for (let rect of this.rectObstacles) {
                path.addRect(rect.start_x, rect.start_y, rect.stop_x, rect.stop_y, rect.name, rect.prio, rect.radius);
            }
            for (let tri of this.triangleObstacles) {
                path.addTriangle(tri.x1, tri.y1, tri.x2, tri.y2, tri.x3, tri.y3, tri.lineWidth, tri.name, tri.prio);
            }
        }
        getObstacleString() {
            let teamLetter = "y";
            if (teamIsBlue) {
                teamLetter = "b";
            }
            return `obstacles: ${this._robotId}${teamLetter}`;
        }
        setHalted() {
            this.lastWasTrajectoryPath = false;
        }
        getTrajectory(startPos, startSpeed, endPos, endSpeed, maxSpeed, acceleration) {
            this.lastWasTrajectoryPath = true;
            this.addObstaclesToPath(this._trajectoryInst);
            let t = this._trajectoryInst.calculateTrajectory(startPos.x, startPos.y, startSpeed.x, startSpeed.y, endPos.x, endPos.y, endSpeed.x, endSpeed.y, maxSpeed, acceleration);
            let result = [];
            for (let p of t) {
                result.push({ pos: new vector_1.Vector(p.px, p.py), speed: new vector_1.Vector(p.vx, p.vy), time: p.time });
            }
            return result;
        }
        getPath(x1, y1, x2, y2) {
            this.lastWasTrajectoryPath = false;
            this.addObstaclesToPath(this._inst);
            return this._inst.getPath(x1, y1, x2, y2);
        }
        lastFrameWasTrajectoryPath() {
            return this.lastWasTrajectoryPath;
        }
        setProbabilities(a, b) {
            this._inst.setProbabilities(a, b);
        }
        setBoundary(x1, y1, x2, y2) {
            this._inst.setBoundary(x1, y1, x2, y2);
            this._trajectoryInst.setBoundary(x1, y1, x2, y2);
        }
        clearObstacles() {
            this._inst.clearObstacles();
            this._trajectoryInst.clearObstacles();
            this.circleObstacles.length = 0;
            this.lineObstacles.length = 0;
            this.rectObstacles.length = 0;
            this.triangleObstacles.length = 0;
        }
        setRadius(radius) {
            this._inst.setRadius(radius);
            this._trajectoryInst.setRadius(radius);
        }
        addCircle(x, y, radius, name, prio = 0) {
            if (teamIsBlue) {
                x = -x;
                y = -y;
            }
            if (!isPerformanceMode) {
                vis.addCircleRaw(this.getObstacleString(), new vector_1.Vector(x, y), radius, vis.colors.redHalf, true);
            }
            else {
                name = undefined;
            }
            this.circleObstacles.push({ x: x, y: y, radius: radius, name: name, prio: prio });
        }
        addMovingCircle(startTime, endTime, startPos, speed, acc, radius, priority) {
            startPos = coordinates_1.Coordinates.toGlobal(startPos);
            speed = coordinates_1.Coordinates.toGlobal(speed);
            acc = coordinates_1.Coordinates.toGlobal(acc);
            if (endTime < 0 || endTime < startTime) {
                return;
            }
            if (!isPerformanceMode) {
                let positions = [];
                const SAMPLES = (acc.x === 0 && acc.y === 0) ? 2 : 10;
                const timeStep = (endTime - startTime) / (SAMPLES - 1);
                for (let i = 0; i < SAMPLES; i++) {
                    let time = i * timeStep;
                    let pos = (startPos.add(speed.mul(time))).add(acc.mul((0.5 * time * time)));
                    positions.push(pos);
                }
                vis.addCircleRaw(this.getObstacleString(), startPos, radius, vis.colors.orangeHalf, true);
                vis.addCircleRaw(this.getObstacleString(), positions[SAMPLES - 1], radius, vis.colors.orangeHalf, true);
                vis.addPathRaw(this.getObstacleString(), positions, vis.colors.orangeHalf);
            }
            this._trajectoryInst.addMovingCircle(startTime, endTime, startPos.x, startPos.y, speed.x, speed.y, acc.x, acc.y, radius, priority);
        }
        addLine(start_x, start_y, stop_x, stop_y, radius, name, prio = 0) {
            if (start_x === stop_x && start_y === stop_y) {
                (0, amun_1.log)("WARNING: start  &&  end points for a line obstacle are the same!");
                return;
            }
            if (teamIsBlue) {
                start_x = -start_x;
                start_y = -start_y;
                stop_x = -stop_x;
                stop_y = -stop_y;
            }
            if (!isPerformanceMode) {
                vis.addPathRaw(this.getObstacleString(), [new vector_1.Vector(start_x, start_y), new vector_1.Vector(stop_x, stop_y)], vis.colors.redHalf, undefined, undefined, 2 * radius);
            }
            else {
                name = undefined;
            }
            this.lineObstacles.push({ start_x: start_x, start_y: start_y, stop_x: stop_x, stop_y: stop_y,
                radius: radius, name: name, prio: prio });
        }
        addMovingLine(startTime, endTime, startPos1, speed1, acc1, startPos2, speed2, acc2, width, priority) {
            startPos1 = coordinates_1.Coordinates.toGlobal(startPos1);
            speed1 = coordinates_1.Coordinates.toGlobal(speed1);
            acc1 = coordinates_1.Coordinates.toGlobal(acc1);
            startPos2 = coordinates_1.Coordinates.toGlobal(startPos2);
            speed2 = coordinates_1.Coordinates.toGlobal(speed2);
            acc2 = coordinates_1.Coordinates.toGlobal(acc2);
            if (endTime < 0 || endTime < startTime) {
                return;
            }
            if (!isPerformanceMode) {
                if (USE_NEW_MOVING_LINE_VIS) {
                    if (acc1.equals(new vector_1.Vector(0, 0))
                        && acc2.equals(new vector_1.Vector(0, 0))
                        && speed1.equals(new vector_1.Vector(0, 0))
                        && speed2.equals(new vector_1.Vector(0, 0))) {
                        vis.addPathRaw(this.getObstacleString(), [startPos1, startPos2], vis.colors.orange.setAlpha(127), undefined, undefined, width);
                    }
                    else {
                        const SAMPLES = 5;
                        let timeStep = (endTime - startTime) / (SAMPLES - 1);
                        for (let i = 0; i < SAMPLES; i++) {
                            let time = i * timeStep;
                            let pos1 = (startPos1.add(speed1.mul(time))).add(acc1.mul((0.5 * time * time)));
                            let pos2 = (startPos2.add(speed2.mul(time))).add(acc2.mul((0.5 * time * time)));
                            let alpha = 0.5 * 0.5 ** (startTime + time);
                            vis.addPathRaw(this.getObstacleString(), [pos1, pos2], vis.colors.orange.setAlpha(255 * alpha), undefined, undefined, width);
                        }
                    }
                }
                else {
                    let positions1 = [], positions2 = [];
                    const SAMPLES = (acc1.x === 0 && acc1.y === 0 && acc2.x === 0 && acc2.y === 0) ? 2 : 10;
                    const timeStep = (endTime - startTime) / (SAMPLES - 1);
                    for (let i = 0; i < SAMPLES; i++) {
                        let time = i * timeStep;
                        let pos1 = (startPos1.add(speed1.mul(time))).add(acc1.mul((0.5 * time * time)));
                        let pos2 = (startPos2.add(speed2.mul(time))).add(acc2.mul((0.5 * time * time)));
                        positions1.push(pos1);
                        positions2.push(pos2);
                    }
                    vis.addPathRaw(this.getObstacleString(), [startPos1, positions1[SAMPLES - 1]], vis.colors.orangeHalf, undefined, undefined, width);
                    vis.addPathRaw(this.getObstacleString(), [startPos2, positions2[SAMPLES - 1]], vis.colors.orangeHalf, undefined, undefined, width);
                    vis.addPathRaw(this.getObstacleString(), positions1, vis.colors.orangeHalf);
                    vis.addPathRaw(this.getObstacleString(), positions2, vis.colors.orangeHalf);
                }
            }
            this._trajectoryInst.addMovingLine(startTime, endTime, startPos1.x, startPos1.y, speed1.x, speed1.y, acc1.x, acc1.y, startPos2.x, startPos2.y, speed2.x, speed2.y, acc2.x, acc2.y, width, priority);
        }
        addRect(start_x, start_y, stop_x, stop_y, radius, name, prio = 0) {
            if (teamIsBlue) {
                start_x = -start_x;
                start_y = -start_y;
                stop_x = -stop_x;
                stop_y = -stop_y;
            }
            if (!isPerformanceMode) {
                vis.addPolygonRaw(this.getObstacleString(), [new vector_1.Vector(start_x, start_y), new vector_1.Vector(start_x, stop_y), new vector_1.Vector(stop_x, stop_y),
                    new vector_1.Vector(stop_x, start_y)], vis.colors.redHalf, true);
            }
            else {
                name = undefined;
            }
            this.rectObstacles.push({ start_x: start_x, start_y: start_y, stop_x: stop_x, stop_y: stop_y,
                radius: radius, name: name, prio: prio });
        }
        addTriangle(x1, y1, x2, y2, x3, y3, lineWidth, name, prio = 0) {
            if (teamIsBlue) {
                x1 = -x1;
                y1 = -y1;
                x2 = -x2;
                y2 = -y2;
                x3 = -x3;
                y3 = -y3;
            }
            if (!isPerformanceMode) {
                let p1 = new vector_1.Vector(x1, y1);
                let p2 = new vector_1.Vector(x2, y2);
                let p3 = new vector_1.Vector(x3, y3);
                vis.addPolygonRaw(this.getObstacleString(), [p1, p2, p3], vis.colors.redHalf, true);
            }
            else {
                name = undefined;
            }
            this.triangleObstacles.push({ x1: x1, y1: y1, x2: x2, y2: y2, x3: x3, y3: y3,
                lineWidth: lineWidth, name: name, prio: prio });
        }
        addFriendlyRobotObstacle(robot, radius, prio) {
            this._trajectoryInst.addRobotTrajectoryObstacle(robot.path._trajectoryInst.getTrajectoryAsObstacle(), prio, radius);
            if (!isPerformanceMode) {
                vis.addCircle(this.getObstacleString(), robot.pos, 2 * robot.radius, vis.colors.goldHalf, false, undefined, undefined, robot.radius);
            }
        }
        hasOpponentRobotObstacle() {
            return this._trajectoryInst.addOpponentRobotObstacle !== undefined;
        }
        addOpponentRobotObstacle(robot, prio) {
            if (!this._trajectoryInst.addOpponentRobotObstacle) {
                throw new Error("Can not add opponent robot obstacle, update Ra to fix!");
            }
            const start = coordinates_1.Coordinates.toGlobal(robot.pos);
            const speed = coordinates_1.Coordinates.toGlobal(robot.speed);
            this._trajectoryInst.addOpponentRobotObstacle(start.x, start.y, speed.x, speed.y, prio);
            if (!isPerformanceMode) {
                vis.addCircle(this.getObstacleString(), robot.pos, 1.5 * robot.radius, vis.colors.orchidHalf, false, undefined, undefined, robot.radius * 0.5);
                vis.addPath(this.getObstacleString(), [robot.pos, robot.pos.add(robot.speed)], vis.colors.orchidHalf);
            }
        }
        addSeedTarget(x, y) {
            if (teamIsBlue) {
                x = -x;
                y = -y;
            }
            this._inst.addSeedTarget(x, y);
        }
        setOutOfFieldObstaclePriority(prio) {
            this._trajectoryInst.setOutOfFieldPrio(prio);
        }
        maxIntersectingObstaclePrio() {
            return this._trajectoryInst.maxIntersectingObstaclePrio();
        }
    }
    exports.Path = Path;
});
//# sourceMappingURL=path.js.map