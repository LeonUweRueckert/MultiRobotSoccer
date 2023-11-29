define(["require", "exports", "base/world", "stp_vibes/skills/moveto", "base/vector"], function (require, exports, World, moveto_1, vector_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MoveCenter = void 0;
    class MoveCenter {
        constructor() {
        }
        run() {
            new moveto_1.MoveTo(World.FriendlyRobotsById[2]).run(new vector_1.Vector(0, 0), 0);
        }
    }
    exports.MoveCenter = MoveCenter;
});
//# sourceMappingURL=movecenter.js.map