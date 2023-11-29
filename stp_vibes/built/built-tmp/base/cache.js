define(["require", "exports", "base/vector"], function (require, exports, vector_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resetFrame = exports.forever = exports.forFrame = void 0;
    let cleanup = [];
    let undefinedObj = Object.freeze([]);
    let undefinedVec = Object.freeze(new vector_1.Vector(NaN, NaN));
    function getFromCache(cached, params) {
        let pcount = params.length;
        params.unshift(pcount);
        let entry = cached;
        for (let i = 0; i < pcount + 1; i++) {
            let param = params[i];
            if (param == undefined) {
                param = undefinedObj;
            }
            else if (param instanceof vector_1.Vector) {
                pcount += 2;
                params.splice(i + 1, 0, param.x, param.y);
                param = undefinedVec;
            }
            if (!(entry instanceof Map)) {
                return undefined;
            }
            entry = entry.get(param);
            if (entry == undefined) {
                return undefined;
            }
        }
        return entry;
    }
    function setInCache(cached, params, result) {
        let pcount = params.length;
        params.unshift(pcount);
        let entry = cached;
        for (let i = 0; i < pcount + 1; i++) {
            let param = params[i];
            if (param == undefined) {
                param = undefinedObj;
            }
            else if (param instanceof vector_1.Vector) {
                let v = param;
                entry.set(undefinedVec, new Map());
                entry = entry.get(undefinedVec);
                entry.set(v.x, new Map());
                entry = entry.get(v.x);
                param = v.y;
            }
            if (i === pcount) {
                entry.set(param, result);
                return;
            }
            else if (!entry.has(param)) {
                let newEntry = new Map();
                entry.set(param, newEntry);
            }
            entry = entry.get(param);
        }
    }
    let undefResult = Object.freeze([]);
    function makeCached(f, keepForever) {
        let cached = new Map();
        if (!keepForever) {
            cleanup.push(function () {
                cached = new Map();
            });
        }
        let cachedFunc = (function (...args) {
            let result = getFromCache(cached, args.slice());
            if (result == undefined) {
                result = f(...args);
                if (result === undefined) {
                    result = undefResult;
                }
                setInCache(cached, args, result);
            }
            if (result === undefResult) {
                return undefined;
            }
            return result;
        });
        Object.defineProperty(cachedFunc, "name", { value: f.name, writable: false });
        return cachedFunc;
    }
    function forFrame(f) {
        return makeCached(f, false);
    }
    exports.forFrame = forFrame;
    function forever(f) {
        return makeCached(f, true);
    }
    exports.forever = forever;
    function resetFrame() {
        for (let obj of cleanup) {
            obj();
        }
    }
    exports.resetFrame = resetFrame;
});
//# sourceMappingURL=cache.js.map