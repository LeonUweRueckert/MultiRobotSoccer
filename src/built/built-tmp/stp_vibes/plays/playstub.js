define(["require", "exports", "base/world"], function (require, exports, World) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Play = void 0;
    class Play {
        constructor() {
            this.dummyAttribute = 0;
        }
        run() {
            for (let robot of World.FriendlyRobots) {
                if (World.RefereeState == "Halt") {
                    for (let robot of World.FriendlyRobots) {
                        if (robot.moveCommand == undefined) {
                            robot.setStandby(true);
                            robot.halt();
                        }
                    }
                }
            }
        }
    }
    exports.Play = Play;
});
//# sourceMappingURL=playstub.js.map