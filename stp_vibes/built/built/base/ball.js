define(["require", "exports", "base/coordinates", "base/plot", "base/vector"], function (require, exports, coordinates_1, plot, vector_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Ball = void 0;
    const BALL_QUALITY_FILTER_FACTOR = 0.05;
    const MAXSPEED_MIN_ROBOT_DIST = 0.1;
    class Ball {
        constructor() {
            this.radius = 0.0215;
            this.lostSince = 0;
            this.pos = new vector_1.Vector(0, 0);
            this.speed = new vector_1.Vector(0, 0);
            this.posZ = 0;
            this.speedZ = 0;
            this.maxSpeed = 0;
            this.initSpeedZ = 0;
            this.isBouncing = false;
            this.framesDeceleration = Infinity;
            this.detectionQuality = 0.6;
            this.hasRawData = false;
            this.framesDecelerating = 0;
            this._isVisible = false;
            this._hadRawData = false;
            this.ballPosInFrame = [];
            this.counter = 0;
            this.ballIsNearToRobot = false;
        }
        _toString() {
            const x = this.pos.x.toFixed(3).padStart(6);
            const y = this.pos.x.toFixed(3).padStart(6);
            const speed = this.speed.length().toFixed(1).padStart(3);
            return `Ball(pos = (${x}, ${y}), speed = ${speed})`;
        }
        toString() {
            return this._toString();
        }
        _updateLostBall(time) {
            if (this._isVisible) {
                this._isVisible = false;
                this.lostSince = time;
            }
            if (this._hadRawData) {
                this.detectionQuality *= 1 - BALL_QUALITY_FILTER_FACTOR;
            }
        }
        _update(data, time, geom, robots) {
            this.hasRawData = false;
            plot.addPlot("Ball.quality", this.detectionQuality);
            if (data == undefined) {
                this._updateLostBall(time);
                return;
            }
            const nextPos = coordinates_1.Coordinates.toLocal(new vector_1.Vector(data.p_x, data.p_y));
            const nextSpeed = coordinates_1.Coordinates.toLocal(new vector_1.Vector(data.v_x, data.v_y));
            const extraDist = 2;
            const SIZE_LIMIT = 1000;
            if (nextPos.isNan() || nextSpeed.isNan() || Math.abs(nextPos.x) > SIZE_LIMIT ||
                Math.abs(nextPos.y) > SIZE_LIMIT || Math.abs(nextSpeed.x) > SIZE_LIMIT || Math.abs(nextSpeed.y) > SIZE_LIMIT) {
                this._updateLostBall(time);
                return;
            }
            if (geom && ((Math.abs(nextPos.y) > geom.FieldHeightHalf + extraDist) || Math.abs(nextPos.x) > geom.FieldWidthHalf + extraDist)) {
                this._updateLostBall(time);
                return;
            }
            let speedLimit = 10;
            if (nextSpeed.lengthSq() > speedLimit * speedLimit) {
                this._updateLostBall(time);
                return;
            }
            let lastSpeedLength = this.speed.length();
            this._isVisible = true;
            this.pos = nextPos;
            this.speed = nextSpeed;
            this.posZ = data.p_z || 0;
            this.speedZ = data.v_z || 0;
            if (data.touchdown_x != undefined && data.touchdown_y != undefined) {
                this.touchdownPos = coordinates_1.Coordinates.toLocal(new vector_1.Vector(data.touchdown_x, data.touchdown_y));
            }
            this.isBouncing = !!data.is_bouncing;
            this._updateTrackedState(data, lastSpeedLength, robots);
            this._updateRawDetections(data.raw);
        }
        _updateRawDetections(rawData) {
            let count = 0;
            if (rawData !== undefined && rawData.length > 0) {
                this._hadRawData = true;
                this.hasRawData = true;
                count = Math.min(1, rawData.length);
            }
            if (this._hadRawData === true) {
                this.detectionQuality = BALL_QUALITY_FILTER_FACTOR * count + (1 - BALL_QUALITY_FILTER_FACTOR) * this.detectionQuality;
            }
        }
        _updateTrackedState(data, lastSpeedLength, robots) {
            if (data.max_speed != undefined) {
                this.maxSpeed = data.max_speed;
            }
            else {
                if (this.speed.length() - lastSpeedLength > 0.2) {
                    this.framesDecelerating = 0;
                }
                else {
                    this.ballPosInFrame[this.counter] = this.pos;
                    this.counter += 1;
                    this.framesDecelerating = this.framesDecelerating + 1;
                }
                if (robots != undefined) {
                    for (let framepos of this.ballPosInFrame) {
                        for (let r of robots) {
                            if (r.pos.distanceToSq(framepos) < MAXSPEED_MIN_ROBOT_DIST * MAXSPEED_MIN_ROBOT_DIST) {
                                this.ballIsNearToRobot = true;
                                break;
                            }
                        }
                    }
                }
                if (this.framesDecelerating === 3 && this.ballIsNearToRobot) {
                    this.ballIsNearToRobot = false;
                    this.counter = 0;
                    this.maxSpeed = this.speed.length();
                }
                if (this.counter === 3) {
                    this.counter = 0;
                }
                if (this.maxSpeed < this.speed.length()) {
                    this.maxSpeed = this.maxSpeed + 0.3 * (this.speed.length() - this.maxSpeed);
                }
            }
            plot.addPlot("Ball.maxSpeed", this.maxSpeed);
        }
        isPositionValid() {
            if (!this._isVisible) {
                return false;
            }
            return !this.pos.isNan() && !this.speed.isNan();
        }
    }
    exports.Ball = Ball;
});
//# sourceMappingURL=ball.js.map