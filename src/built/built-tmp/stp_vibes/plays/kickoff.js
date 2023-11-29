define(["require", "exports", "base/world", "stp_vibes/tactics/fivethreetwo"], function (require, exports, World, fivethreetwo_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KickOff = void 0;
    class KickOff {
        constructor() {
            this.tactic = new fivethreetwo_1.Fivethreetwo(World.FriendlyRobots);
        }
        run() {
            this.tactic.run();
        }
    }
    exports.KickOff = KickOff;
});
//# sourceMappingURL=kickoff.js.map