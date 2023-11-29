define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.maxTeamSize = exports.crashingSpeedDifference = exports.stopSpeed = exports.maxTimeBallDefenseArea = exports.maxRobotHeight = exports.maxRobotRadius = exports.maxDribbleDistance = exports.allowedMaxBallSpeed = exports.maxBallSpeed = exports.positionError = exports.systemLatency = exports.stopBallDistance = void 0;
    exports.stopBallDistance = 0.5;
    exports.systemLatency = 0.04;
    exports.positionError = 0.005;
    exports.maxBallSpeed = 6.1;
    exports.allowedMaxBallSpeed = 6.5;
    exports.maxDribbleDistance = 1;
    exports.maxRobotRadius = 0.09;
    exports.maxRobotHeight = 0.15;
    exports.maxTimeBallDefenseArea = {
        "": 5,
        "A": 5,
        "B": 10,
    };
    exports.stopSpeed = 1.5;
    exports.crashingSpeedDifference = 1.5;
    exports.maxTeamSize = {
        "": 11,
        "A": 11,
        "B": 6,
    };
});
//# sourceMappingURL=constants.js.map