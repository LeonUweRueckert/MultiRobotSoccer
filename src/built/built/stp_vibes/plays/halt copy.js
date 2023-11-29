define(["require", "exports", "base/world"], function (require, exports, World) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Halt = void 0;
    class Halt {
        constructor() {
        }
        run() {
            for (let robot of World.FriendlyRobots) {
                if (robot.moveCommand == undefined) {
                    robot.setStandby(true);
                    robot.halt();
                }
            }
        }
    }
    exports.Halt = Halt;
});
//# sourceMappingURL=halt%20copy.js.map