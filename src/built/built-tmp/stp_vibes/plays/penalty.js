define(["require", "exports", "built/built/stp_vibes/skills/moveto", "base/world", "base/vector"], function (require, exports, moveto_1, World, vector_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Penalty = void 0;
    class Penalty {
        constructor() {
        }
        run() {
            amun.log(World.Ball.pos);
            if (World.FriendlyRobotsById[2].pos.y < -0.15) {
                new moveto_1.MoveTo(World.FriendlyRobotsById[2]).run(new vector_1.Vector(0.0, 0.0), 1.57);
                World.FriendlyRobotsById[2].shootDisable();
            }
            if (World.FriendlyRobotsById[2].pos.y >= -0.15) {
                World.FriendlyRobotsById[2].setDribblerSpeed(1.57);
            }
        }
    }
    exports.Penalty = Penalty;
});
//# sourceMappingURL=penalty.js.map