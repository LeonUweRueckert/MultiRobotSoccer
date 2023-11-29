define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.aggregate = exports._plotAggregated = exports.addPlot = void 0;
    let amunLocal = amun;
    function addPlot(name, value) {
        amunLocal.addPlot(name, value);
    }
    exports.addPlot = addPlot;
    let aggregated = {};
    let lastAggregated = {};
    function _plotAggregated() {
        for (let k in aggregated) {
            addPlot(k, aggregated[k]);
        }
        for (let k in lastAggregated) {
            if (aggregated[k] == undefined) {
                addPlot(k, 0);
            }
        }
        lastAggregated = aggregated;
        aggregated = {};
    }
    exports._plotAggregated = _plotAggregated;
    function aggregate(key, value) {
        if (aggregated[key] == undefined) {
            aggregated[key] = 0;
        }
        aggregated[key] = aggregated[key] + value;
    }
    exports.aggregate = aggregate;
});
//# sourceMappingURL=plot.js.map