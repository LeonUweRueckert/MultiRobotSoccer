define(["require", "exports", "stp_vibes/skills/followBall"], function (require, exports, followBall_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AllFollowBall = void 0;
    class AllFollowBall {
        constructor(robots) {
            this.robots = robots;
        }
        run() {
            for (let robot of this.robots) {
                new followBall_1.FollowBall(robot).run();
            }
        }
    }
    exports.AllFollowBall = AllFollowBall;
});
//# sourceMappingURL=allFollowBall.js.map