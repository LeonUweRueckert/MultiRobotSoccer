define(["require", "exports", "base/vector", "base/world", "stp_vibes/skills/moveto"], function (require, exports, vector_1, World, moveto_1) {
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
//# sourceMappingURL=moveCenter.js.map