define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.throwInDebug = exports.log = exports._hideFunctions = exports.fullAmun = void 0;
    amun = {
        ...amun,
        isDebug: amun.isDebug(),
        isPerformanceMode: amun.getPerformanceMode()
    };
    function _hideFunctions() {
        exports.fullAmun = amun;
        let isDebug = amun.isDebug;
        let isPerformanceMode = amun.isPerformanceMode;
        let strategyPath = amun.getStrategyPath();
        let getCurrentTime = amun.getCurrentTime;
        let setRobotExchangeSymbol = amun.setRobotExchangeSymbol;
        let log = amun.log;
        let sendCommand = amun.sendCommand;
        let supportsOptionDefault = amun.SUPPORTS_OPTION_DEFAULT;
        let supportsEfficientPath = amun.SUPPORTS_EFFICIENT_PATHVIS;
        const makeDisabledFunction = function (name) {
            function DISABLED_FUNCTION(..._) {
                throw new Error(`Usage of disabled amun function ${name}`);
            }
            return DISABLED_FUNCTION;
        };
        amun = {
            isDebug: isDebug,
            isPerformanceMode: isPerformanceMode,
            strategyPath: strategyPath,
            getCurrentTime: function () {
                return getCurrentTime() * 1E-9;
            },
            setRobotExchangeSymbol: setRobotExchangeSymbol,
            log: log,
            connectGameController: amun.connectGameController,
            sendGameControllerMessage: amun.sendGameControllerMessage,
            getGameControllerMessage: amun.getGameControllerMessage,
            sendCommand: isDebug ? sendCommand : makeDisabledFunction("sendCommand"),
            getWorldState: makeDisabledFunction("getWorldState"),
            getGeometry: makeDisabledFunction("getGeometry"),
            getTeam: makeDisabledFunction("getTeam"),
            isBlue: makeDisabledFunction("isBlue"),
            addVisualization: makeDisabledFunction("addVisualization"),
            addCircleSimple: makeDisabledFunction("addCircleSimple"),
            addPathSimple: makeDisabledFunction("addPathSimple"),
            addPolygonSimple: makeDisabledFunction("addPolygonSimple"),
            setCommand: makeDisabledFunction("setCommand"),
            setCommands: makeDisabledFunction("setCommands"),
            getGameState: makeDisabledFunction("getGameState"),
            getUserInput: makeDisabledFunction("getUserInput"),
            getStrategyPath: makeDisabledFunction("getStrategyPath"),
            getSelectedOptions: makeDisabledFunction("getSelectedOptions"),
            addDebug: makeDisabledFunction("addDebug"),
            addPlot: makeDisabledFunction("addPlot"),
            sendRefereeCommand: makeDisabledFunction("sendRefereeCommand"),
            sendMixedTeamInfo: makeDisabledFunction("sendMixedTeamInfo"),
            getPerformanceMode: makeDisabledFunction("getPerformanceMode"),
            connectDebugger: makeDisabledFunction("connectDebugger"),
            debuggerSend: makeDisabledFunction("debuggerSend"),
            terminateExecution: makeDisabledFunction("terminateExecution"),
            resolveJsToTs: makeDisabledFunction("resolveJsToTs"),
            luaRandomSetSeed: makeDisabledFunction("luaRandomSetSeed"),
            luaRandom: makeDisabledFunction("luaRandom"),
            tryCatch: makeDisabledFunction("tryCatch"),
            SUPPORTS_OPTION_DEFAULT: supportsOptionDefault,
            SUPPORTS_EFFICIENT_PATHVIS: supportsEfficientPath
        };
    }
    exports._hideFunctions = _hideFunctions;
    exports.log = amun.log;
    function throwInDebug(msg) {
        if (amun.isDebug) {
            throw new Error(msg);
        }
        else {
            (0, exports.log)(msg);
        }
    }
    exports.throwInDebug = throwInDebug;
});
//# sourceMappingURL=amun.js.map