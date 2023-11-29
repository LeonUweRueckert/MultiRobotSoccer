define(["require", "exports", "base/base", "base/entrypoints", "base/debug", "base/plot", "base/world", "base/entrypoints", "stp_vibes/trainerstub"], function (require, exports, ___pleasedontusewhydoyoudothis0, ___pleasedontusewhydoyoudothis1, debug, plot, World, EntryPoints, trainerstub_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.scriptInfo = void 0;
    function main() {
        amun.log("Main Loop");
        (0, trainerstub_1.main)();
        return true;
    }
    EntryPoints.add("Demo", main);
    function wrapper(func) {
        function f() {
            World.update();
            func();
            World.setRobotCommands();
            debug.resetStack();
            plot._plotAggregated();
        }
        return f;
    }
    exports.scriptInfo = { name: "Demo Strategy", entrypoints: EntryPoints.get(wrapper) };
});
//# sourceMappingURL=init.js.map