define(["require", "exports", "base/world", "stp_vibes/tactics/allFollowBall"], function (require, exports, World, allFollowBall_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Game = void 0;
    class Game {
        constructor() {
        }
        run() {
            amun.log("Game Play loop");
            new allFollowBall_1.AllFollowBall(World.FriendlyRobots).run();
        }
    }
    exports.Game = Game;
});
//# sourceMappingURL=game.js.map