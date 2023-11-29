define(["require", "exports", "base/geom", "base/mathutil", "base/world"], function (require, exports, geom, MathUtil, World) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DirectRotation = void 0;
    class DirectRotation {
        calculateRotationHysteresis(robotDir, currentOmega, targetDir, rotAccel, rotBrake, rotSpeed, rotExpTime) {
            const feedforwardSpeed = this.lastTime == undefined ? 0 : geom.normalizeAngle(targetDir - this.lastTargetDir) / (World.Time - this.lastTime);
            let [angularSpeed, angularAccel] = DirectRotation.calculateRotation(robotDir, currentOmega, targetDir, rotAccel, rotBrake, rotSpeed, rotExpTime, feedforwardSpeed);
            this.lastTargetDir = targetDir;
            this.lastTime = World.Time;
            return [angularSpeed, angularAccel];
        }
        static calculateRotation(currentDir, currentOmegaParam, targetDir, accelerate, brake, maxSpeed, exponentialTime, feedforwardSpeed) {
            let currentOmega = currentOmegaParam - feedforwardSpeed;
            let fullBrakeTime = Math.abs(currentOmega / brake);
            let forcedRotation = MathUtil.sign(currentOmega) * -brake * fullBrakeTime * fullBrakeTime / 2;
            let dirChange = geom.getAngleDiff(currentDir, targetDir);
            if (Math.abs(dirChange - forcedRotation) >= Math.PI) {
                if (dirChange < 0) {
                    dirChange = dirChange + 2 * Math.PI;
                }
                else {
                    dirChange = dirChange - 2 * Math.PI;
                }
            }
            let k = 1 / exponentialTime;
            let expStartSpeed = exponentialTime * -brake;
            let expDistance = expStartSpeed * exponentialTime;
            let outSpeed;
            let outAccel;
            if (Math.abs(dirChange) <= expDistance) {
                outSpeed = MathUtil.bound(-maxSpeed, dirChange * k, maxSpeed);
                outAccel = 0;
            }
            else if (MathUtil.sign(currentOmega) !== MathUtil.sign(dirChange)) {
                outSpeed = currentOmega;
                outAccel = MathUtil.sign(dirChange) * -brake;
            }
            else if (Math.abs(currentOmega) <= expStartSpeed) {
                outSpeed = currentOmega;
                outAccel = MathUtil.sign(dirChange) * accelerate;
                if (Math.abs(outSpeed) > maxSpeed) {
                    outAccel = 0;
                }
            }
            else {
                let brakeTime = (Math.abs(currentOmega) - expStartSpeed) / -brake;
                let brakeDist = expDistance + -brake * brakeTime * brakeTime / 2 + expStartSpeed * brakeTime;
                if (Math.abs(dirChange) <= brakeDist) {
                    let remainingBrakeTime = MathUtil.solveSq(-brake / 2, expStartSpeed, expDistance - brakeDist)[0];
                    if (remainingBrakeTime == undefined || remainingBrakeTime < 0) {
                        throw new Error("");
                    }
                    outSpeed = MathUtil.sign(dirChange) * (expStartSpeed + remainingBrakeTime * -brake);
                    outAccel = MathUtil.sign(dirChange) * brake;
                }
                else {
                    let targetSpeed = Math.abs(currentOmega);
                    outAccel = MathUtil.sign(dirChange) * accelerate;
                    if (targetSpeed >= maxSpeed) {
                        targetSpeed = maxSpeed;
                        outAccel = 0;
                    }
                    outSpeed = targetSpeed * MathUtil.sign(dirChange);
                }
            }
            outSpeed += feedforwardSpeed;
            return [outSpeed, outAccel];
        }
    }
    exports.DirectRotation = DirectRotation;
});
//# sourceMappingURL=directrotation.js.map