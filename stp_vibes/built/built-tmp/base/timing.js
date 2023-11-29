define(["require", "exports", "base/debug", "base/plot"], function (require, exports, debug, plot) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.finish = exports.start = void 0;
    let startTimes = {};
    function start(name, robotId) {
        let key = `${name}.${robotId}`;
        if (startTimes[key] != undefined) {
            throw new Error("timing: multiple start calls");
        }
        startTimes[key] = amun.getCurrentTime();
    }
    exports.start = start;
    function finish(name, robotId) {
        let key = `${name}.${robotId}`;
        if (startTimes[key] == undefined) {
            throw new Error("timing: no start call");
        }
        let timeDiffMs = (amun.getCurrentTime() - startTimes[key]) * 1000;
        if (timeDiffMs < 0.001) {
            timeDiffMs = 0;
        }
        debug.push("Timing");
        debug.set(name, `${String(timeDiffMs).slice(0, 5)}  ms`);
        debug.pop();
        plot.addPlot(key, timeDiffMs);
        delete startTimes[key];
    }
    exports.finish = finish;
});
//# sourceMappingURL=timing.js.map