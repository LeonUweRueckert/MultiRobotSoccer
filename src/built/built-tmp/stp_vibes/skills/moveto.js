define(["require", "exports", "base/trajectory/curvedmaxaccel", "base/trajectory/pathhelper"], function (require, exports, curvedmaxaccel_1, pathhelper_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MoveTo = void 0;
    class MoveTo {
        constructor(robot) {
            this.robot = robot;
        }
        run(targetPosition, targetRobotOrientation, maxSpeed, endSpeed, obstacles = { ignoreBall: true }) {
            (0, pathhelper_1.setDefaultObstaclesByTable)(this.robot.path, this.robot, obstacles);
            this.robot.trajectory.update(curvedmaxaccel_1.CurvedMaxAccel, targetPosition, targetRobotOrientation, maxSpeed, endSpeed);
        }
    }
    exports.MoveTo = MoveTo;
});
//# sourceMappingURL=moveto.js.map