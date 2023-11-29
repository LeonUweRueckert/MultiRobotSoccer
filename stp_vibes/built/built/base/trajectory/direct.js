define(["require", "exports", "base/coordinates", "base/geom", "base/mathutil", "base/trajectory", "base/vector"], function (require, exports, coordinates_1, geom, MathUtil, trajectory_1, vector_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Direct = void 0;
    class Direct extends trajectory_1.TrajectoryHandler {
        update(speed, targetDir, rotateSpeed, accel = new vector_1.Vector(0, 0)) {
            speed = coordinates_1.Coordinates.toGlobal(speed);
            accel = coordinates_1.Coordinates.toGlobal(accel);
            let robotSpeed = coordinates_1.Coordinates.toGlobal(this._robot.speed);
            let k_v = 0.5;
            speed = speed.add((speed.sub(robotSpeed)).mul(k_v));
            let robotPos = coordinates_1.Coordinates.toGlobal(this._robot.pos);
            let robotDir = coordinates_1.Coordinates.toGlobal(this._robot.dir);
            if (targetDir != undefined && rotateSpeed != undefined) {
                throw new Error("rotating while having a fixed direction makes no sense");
            }
            if (targetDir == undefined && rotateSpeed == undefined) {
                throw new Error("Either rotateSpeed or targetDir have to be set");
            }
            if (rotateSpeed == undefined) {
                let limitRot = 4 * Math.PI;
                let k_omega = 10;
                targetDir = coordinates_1.Coordinates.toGlobal(targetDir);
                let error_phi = geom.getAngleDiff(robotDir, targetDir);
                rotateSpeed = MathUtil.bound(-limitRot, error_phi * k_omega, limitRot);
            }
            let spline = [{ t_start: 0, t_end: Infinity,
                    x: { a0: robotPos.x, a1: speed.x, a2: accel.x / 2, a3: 0 },
                    y: { a0: robotPos.y, a1: speed.y, a2: accel.y / 2, a3: 0 },
                    phi: { a0: robotDir, a1: rotateSpeed, a2: 0, a3: 0 }
                }];
            return [{ spline: spline }, this._robot.pos, 0];
        }
        canHandle(...args) {
            return true;
        }
    }
    exports.Direct = Direct;
});
//# sourceMappingURL=direct.js.map