define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.tryCatchThen = exports.tryCatch = exports.pcall = void 0;
    let amunLocal = amun;
    let log;
    function ignore(e) {
    }
    function notifyCatch(error, e) {
        e[0] = true;
    }
    function pcall(tryF) {
        let ele = [false];
        amunLocal.tryCatch(tryF, ignore, notifyCatch, ele, true);
        return ele[0];
    }
    exports.pcall = pcall;
    function tryCatch(tryF, catchF) {
        amunLocal.tryCatch(tryF, ignore, catchF, [], false);
    }
    exports.tryCatch = tryCatch;
    function tryCatchThen(tryF, catchF, thenF) {
        amunLocal.tryCatch(tryF, thenF, catchF, [], false);
    }
    exports.tryCatchThen = tryCatchThen;
});
//# sourceMappingURL=trycatch.js.map