define(["require", "exports", "base/accelerations", "base/amun", "base/constants", "base/coordinates", "base/geom", "base/mathutil", "base/path", "base/protobuf", "base/trajectory", "base/vector", "base/vis"], function (require, exports, accelerations_1, amun_1, Constants, coordinates_1, geom, MathUtil, path_1, pb, trajectory_1, vector_1, vis) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FriendlyRobot = exports.Robot = exports.HALT = exports.REUSE_LAST_TRAJECTORY = void 0;
    exports.REUSE_LAST_TRAJECTORY = Symbol("REUSE_LAST_TRAJECTORY");
    exports.HALT = Symbol("HALT");
    class Robot {
        constructor(id) {
            this.ALLY_GENERATION_ID = 9999;
            this.GENERATION_2014_ID = 3;
            this.constants = {
                hasBallDistance: 0.04,
                passSpeed: 3,
                shootDriveSpeed: 0.2,
                minAngleError: geom.degreeToRadian(4)
            };
            this.pos = new vector_1.Vector(0, 0);
            this.speed = new vector_1.Vector(0, 0);
            this.dir = 0;
            this.angularSpeed = 0;
            this.isVisible = false;
            this.maxAngularSpeed = 0;
            this.lastResponseTime = 0;
            this.lostSince = 0;
            this.dribblerPos = new vector_1.Vector(0, 0);
            this._toStringCache = "";
            this._currentTime = 0;
            this._hasBall = {};
            this.radius = 0.09;
            this.dribblerWidth = 0.07;
            this.shootRadius = 0.067;
            this.id = id;
            this.maxSpeed = 3.5;
            this.maxAngularSpeed = 12;
            this.acceleration = {
                aSpeedupFMax: 3.75,
                aSpeedupSMax: 4.5,
                aSpeedupPhiMax: 41.5,
                aBrakeFMax: 5.75,
                aBrakeSMax: 4,
                aBrakePhiMax: 21.5
            };
            this.isFriendly = false;
        }
        _toString() {
            if (this._toStringCache !== "") {
                return this._toStringCache;
            }
            if (this.pos == undefined || this.id == undefined) {
                this._toStringCache = `Robot(${this.id != undefined ? this.id : "?"})`;
            }
            else {
                this._toStringCache = `Robot(${this.id}, pos ${this.pos._toString()})`;
            }
            return this._toStringCache;
        }
        toString() {
            return this._toString();
        }
        copyState() {
            return {
                id: this.id,
                pos: this.pos,
                speed: this.speed,
                dir: this.dir,
                angularSpeed: this.angularSpeed,
            };
        }
        _updateOpponent(state, time) {
            if (state == undefined) {
                if (this.isVisible !== false) {
                    this.isVisible = false;
                    this.lostSince = time;
                }
                return;
            }
            this._toStringCache = "";
            this.isVisible = true;
            this.pos = coordinates_1.Coordinates.toLocal(new vector_1.Vector(state.p_x, state.p_y));
            this.dir = coordinates_1.Coordinates.toLocal(state.phi);
            this.speed = coordinates_1.Coordinates.toLocal(new vector_1.Vector(state.v_x, state.v_y));
            this.angularSpeed = state.omega;
            this.dribblerPos = this.pos.add(vector_1.Vector.fromPolar(this.dir, this.shootRadius));
        }
        hasBall(ball, sideOffset = 0, manualHasBallDistance = this.constants.hasBallDistance) {
            let hasBallDistance = manualHasBallDistance;
            let latencyCompensation = (ball.speed.sub(this.speed)).mul((Constants.systemLatency + 0.03));
            let lclen = latencyCompensation.length();
            let approxMaxDist = lclen + hasBallDistance + this.shootRadius + ball.radius + this.dribblerWidth / 2 + sideOffset;
            if (ball.pos.distanceToSq(this.pos) > approxMaxDist * approxMaxDist) {
                this._hasBall[sideOffset] = false;
                return false;
            }
            const MIN_COMPENSATION = 0.005;
            const BOUND_COMPENSATION_ANGLE = geom.degreeToRadian(70);
            if (lclen < MIN_COMPENSATION) {
                latencyCompensation = new vector_1.Vector(0, 0);
            }
            else if (lclen < 2 * MIN_COMPENSATION) {
                let scale = (lclen - MIN_COMPENSATION) / MIN_COMPENSATION;
                latencyCompensation = latencyCompensation.mul(scale);
            }
            latencyCompensation = latencyCompensation.rotated(-this.dir);
            if (latencyCompensation.x < 0) {
                latencyCompensation = latencyCompensation.unm();
            }
            lclen = latencyCompensation.length();
            if (lclen > 0.001 && Math.abs(latencyCompensation.angle()) > BOUND_COMPENSATION_ANGLE) {
                let boundAngle = MathUtil.bound(-BOUND_COMPENSATION_ANGLE, latencyCompensation.angle(), BOUND_COMPENSATION_ANGLE);
                latencyCompensation = vector_1.Vector.fromPolar(boundAngle, lclen);
            }
            if (lclen <= 0.001) {
                latencyCompensation = new vector_1.Vector(hasBallDistance, 0);
            }
            else {
                latencyCompensation = latencyCompensation.withLength(lclen + hasBallDistance);
            }
            let relpos = (ball.pos.sub(this.pos)).rotated(-this.dir);
            relpos = relpos.withX(relpos.x - this.shootRadius - ball.radius);
            let offset = Math.abs(relpos.y - relpos.x * latencyCompensation.y / latencyCompensation.x);
            const offsetHysteresis = this._hasBall[sideOffset] ? this.dribblerWidth / 4 : 0;
            if (offset > this.dribblerWidth / 2 + sideOffset + offsetHysteresis) {
                this._hasBall[sideOffset] = false;
                return false;
            }
            else if (offset >= this.dribblerWidth / 2 - 2 * Constants.positionError + sideOffset
                && !this._hasBall[sideOffset]) {
                return false;
            }
            const latencyXHysteresis = this._hasBall[sideOffset] ? latencyCompensation.x / 2 : 0;
            this._hasBall[sideOffset] = relpos.x > this.shootRadius * (-1.5)
                && relpos.x < latencyCompensation.x + latencyXHysteresis && ball.posZ < Constants.maxRobotHeight * 1.2;
            return this._hasBall[sideOffset];
        }
        updateSpecs(teamname) {
            let accel = accelerations_1.accelerationsByTeam.get(teamname);
            if (accelerations_1.accelerationsByTeam.get(teamname)) {
                this.maxSpeed = accel.vmax;
                this.maxAngularSpeed = accel.vangular;
                this.acceleration = accel.profile;
                amun.log(`updated specs with team ${teamname}`);
            }
        }
    }
    exports.Robot = Robot;
    class FriendlyRobot extends Robot {
        constructor(specs) {
            super(specs.id);
            this._kickPower = 0;
            this._forceKick = false;
            this._dribblerSpeed = 0;
            this._standbyTimer = -1;
            this._standbyTick = false;
            this._controllerInput = exports.REUSE_LAST_TRAJECTORY;
            this._dribblerSpeedVisualized = false;
            this.generation = specs.generation;
            this.year = specs.year;
            this.id = specs.id;
            this.radius = specs.radius != undefined ? specs.radius : 0.08;
            this.height = specs.height != undefined ? specs.height : 0.14;
            if (specs.shoot_radius != undefined) {
                this.shootRadius = specs.shoot_radius;
            }
            else if (specs.angle != undefined) {
                this.shootRadius = this.radius * Math.cos(specs.angle / 2) - 0.005;
            }
            else {
                this.shootRadius = this.radius;
            }
            if (specs.dribbler_width != undefined) {
                this.dribblerWidth = specs.dribbler_width;
            }
            else {
                this.dribblerWidth = 2 * Math.sqrt(this.radius * this.radius - this.shootRadius * this.shootRadius);
            }
            this.maxSpeed = specs.v_max != undefined ? specs.v_max : 2;
            this.maxAngularSpeed = specs.omega_max != undefined ? specs.omega_max : 5;
            this.maxShotLinear = specs.shot_linear_max != undefined ? specs.shot_linear_max : 8;
            this.maxShotChip = specs.shot_chip_max != undefined ? specs.shot_chip_max : 3;
            if (!specs.strategy) {
                this.acceleration = {
                    aSpeedupFMax: 1.0, aSpeedupSMax: 1.0, aSpeedupPhiMax: 1.0,
                    aBrakeFMax: 1.0, aBrakeSMax: 1.0, aBrakePhiMax: 1.0
                };
            }
            else {
                let acc = specs.strategy;
                this.acceleration.aSpeedupFMax = acc.a_speedup_f_max != undefined ? acc.a_speedup_f_max : 1.0;
                this.acceleration.aSpeedupSMax = acc.a_speedup_s_max != undefined ? acc.a_speedup_s_max : 1.0;
                this.acceleration.aSpeedupPhiMax = acc.a_speedup_phi_max != undefined ? acc.a_speedup_phi_max : 1.0;
                this.acceleration.aBrakeFMax = acc.a_brake_f_max != undefined ? acc.a_brake_f_max : 1.0;
                this.acceleration.aBrakeSMax = acc.a_brake_s_max != undefined ? acc.a_brake_s_max : 1.0;
                this.acceleration.aBrakePhiMax = acc.a_brake_phi_max != undefined ? acc.a_brake_phi_max : 1.0;
            }
            this.isFriendly = true;
            this.trajectory = new trajectory_1.Trajectory(this);
            this.path = new path_1.Path(this.id);
            if (specs.angle != undefined) {
                this.centerToDribbler = this.radius * Math.sin((Math.PI - specs.angle) * 0.5);
            }
        }
        _updatePathBoundaries(geometry, aoi) {
            if (aoi != undefined) {
                this.path.setBoundary(aoi.x1, aoi.y1, aoi.x2, aoi.y2);
            }
            else {
                this.path.setBoundary(-geometry.FieldWidthHalf - geometry.BoundaryWidth - 0.02, -geometry.FieldHeightHalf - geometry.BoundaryWidth - 0.02, geometry.FieldWidthHalf + geometry.BoundaryWidth + 0.02, geometry.FieldHeightHalf + geometry.BoundaryWidth + 0.02);
            }
        }
        _updateUserControl(command) {
            if (command == undefined) {
                this.userControl = undefined;
                return;
            }
            let v = new vector_1.Vector(command.v_s || 0, command.v_f || 0);
            let omega = command.omega || 0;
            if (command.local) {
                let dir = this.isVisible ? this.dir : Math.PI / 2;
                v = v.rotated(dir - Math.PI / 2);
            }
            else {
                v = coordinates_1.Coordinates.toLocal(v);
            }
            this.userControl = { speed: v, omega: omega,
                kickStyle: command.kick_style, kickPower: command.kick_power,
                dribblerSpeed: command.dribbler };
        }
        _command() {
            const STANDBY_DELAY = 30;
            let standby = this._standbyTimer >= 0 && (this._currentTime - this._standbyTimer > STANDBY_DELAY);
            let result = {
                kick_style: this._kickStyle,
                kick_power: this._kickPower > 0 ? this._kickPower : undefined,
                force_kick: this._forceKick,
                dribbler: this._dribblerSpeed,
                standby: standby
            };
            if (this._controllerInput === exports.HALT) {
                result.controller = {};
            }
            else if (this._controllerInput !== exports.REUSE_LAST_TRAJECTORY) {
                result.controller = {
                    spline: this._controllerInput.spline,
                };
                result.v_f = this._controllerInput.v_f;
                result.v_s = this._controllerInput.v_s;
                result.omega = this._controllerInput.omega;
            }
            return result;
        }
        _update(state, time, radioResponses) {
            this._currentTime = time;
            this._controllerInput = exports.HALT;
            this.shootDisable();
            this._dribblerSpeedVisualized = false;
            this.setDribblerSpeed(0);
            this.setStandby(false);
            if (radioResponses && radioResponses.length > 0) {
                this.radioResponse = radioResponses[radioResponses.length - 1];
                this.lastResponseTime = time;
            }
            else {
                this.radioResponse = undefined;
            }
            this._updateOpponent(state, time);
        }
        setControllerInput(input) {
            if (input !== exports.HALT && this._controllerInput !== exports.HALT) {
                throw new Error("Setting controller input twice");
            }
            this._controllerInput = input;
        }
        shootDisable() {
            this._kickStyle = undefined;
            this._kickPower = 0;
            this._forceKick = false;
        }
        shoot(speed, ignoreLimit = false) {
            if (!ignoreLimit) {
                speed = Math.min(Constants.maxBallSpeed, speed);
            }
            speed = MathUtil.bound(0.05, speed, this.maxShotLinear);
            this._kickStyle = pb.robot.Command.KickStyle.Linear;
            this._kickPower = speed;
            vis.addCircle("shoot command", this.pos, this.radius + 0.04, vis.colors.mediumPurple, undefined, undefined, undefined, 0.03);
        }
        chip(distance) {
            distance = MathUtil.bound(0.05, distance, this.maxShotChip);
            this._kickStyle = pb.robot.Command.KickStyle.Chip;
            this._kickPower = distance;
            vis.addCircle("shoot command", this.pos, this.radius + 0.04, vis.colors.darkPurple, undefined, undefined, undefined, 0.03);
        }
        forceShoot() {
            this._forceKick = true;
        }
        setDribblerSpeed(speed) {
            if (speed === 0 && this._dribblerSpeedVisualized) {
                (0, amun_1.throwInDebug)("Trying to reset dribbler speed after already setting it. The visualization will be wrong");
            }
            if (speed > 0 && !this._dribblerSpeedVisualized) {
                this._dribblerSpeedVisualized = true;
                vis.addCircle("b/robot: dribbler speed", this.pos, this.radius + 0.04, vis.colors.magentaHalf, false, false, undefined, 0.03);
            }
            this._dribblerSpeed = speed;
        }
        halt() {
            this.path.setHalted();
            this.setControllerInput(exports.HALT);
        }
        setStandby(standby) {
            if (standby) {
                if (this._standbyTimer < 0) {
                    this._standbyTimer = this._currentTime;
                }
                this._standbyTick = true;
            }
            else {
                if (!this._standbyTick) {
                    this._standbyTimer = -1;
                }
                this._standbyTick = false;
            }
        }
    }
    exports.FriendlyRobot = FriendlyRobot;
});
//# sourceMappingURL=robot.js.map