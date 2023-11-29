define(["require", "exports", "base/world", "stp_vibes/skills/moveto"], function (require, exports, World, moveto_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FollowBall = void 0;
    class FollowBall {
        constructor(robot) {
            this.robot = robot;
        }
        run() {
            new moveto_1.MoveTo(this.robot).run(World.Ball.pos, 0);
        }
    }
    exports.FollowBall = FollowBall;
});
//# sourceMappingURL=followBall.js.map