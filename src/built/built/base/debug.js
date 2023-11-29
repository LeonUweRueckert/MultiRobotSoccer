define(["require", "exports", "base/amun"], function (require, exports, amun_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resetStack = exports.wrap = exports.set = exports.getInitialExtraParams = exports.pop = exports.pushtop = exports.push = void 0;
    let addDebug = amun.addDebug;
    let debugStack = [""];
    let joinCache = {};
    function prefixName(name) {
        let prefix = debugStack[debugStack.length - 1];
        if (name == undefined) {
            return prefix;
        }
        else if (prefix.length === 0) {
            return name;
        }
        if (joinCache[prefix] != undefined && joinCache[prefix][name] != undefined) {
            return joinCache[prefix][name];
        }
        let joined = `${prefix}/${name}`;
        if (joinCache[prefix] == undefined) {
            joinCache[prefix] = {};
        }
        joinCache[prefix][name] = joined;
        return joined;
    }
    function push(name, value) {
        debugStack.push(prefixName(name));
        if (value != undefined) {
            set(undefined, value);
        }
    }
    exports.push = push;
    function pushtop(name) {
        if (!name) {
            debugStack.push("");
        }
        else {
            debugStack.push(name);
        }
    }
    exports.pushtop = pushtop;
    function pop() {
        if (debugStack.length > 0) {
            debugStack.pop();
        }
    }
    exports.pop = pop;
    function getInitialExtraParams() {
        let visited = new Map();
        let tableCounter = [0];
        return [visited, tableCounter];
    }
    exports.getInitialExtraParams = getInitialExtraParams;
    function set(name, value, visited = new Map(), tableCounter) {
        let result;
        if (typeof (value) === "object") {
            if (visited.get(value)) {
                set(name, `${visited.get(value)} (duplicate)`);
                return;
            }
            let suffix = "";
            if (tableCounter) {
                suffix = ` [# ${tableCounter[0]} ]`;
                tableCounter[0] = tableCounter[0] + 1;
            }
            visited.set(value, suffix);
            if (value._toString) {
                let origValue = value;
                result = value._toString() + suffix;
                visited.set(origValue, result);
            }
            else {
                let friendlyName;
                let isMap = false;
                if (value.constructor != undefined && Object.keys(value).length === 0) {
                    if (value instanceof Map) {
                        isMap = true;
                        friendlyName = "Map";
                    }
                    else {
                        friendlyName = `empty object (${value.constructor.name})`;
                    }
                }
                else if (value.constructor != undefined) {
                    friendlyName = value.constructor.name;
                }
                else {
                    friendlyName = "";
                }
                push(String(name));
                friendlyName = friendlyName + suffix;
                set(undefined, friendlyName);
                visited.set(value, friendlyName);
                if (isMap) {
                    let counter = 0;
                    for (let [k, v] of value.entries()) {
                        push(`map entry ${counter++}`);
                        set("key", k, visited, tableCounter);
                        set("value", v, visited, tableCounter);
                        pop();
                    }
                }
                else {
                    for (let k in value) {
                        let v = value[k];
                        set(String(k), v, visited, tableCounter);
                    }
                }
                pop();
                return;
            }
        }
        else if (typeof (value) === "function") {
            result = `function ${value.name}`;
        }
        else {
            result = value;
        }
        addDebug(prefixName(name), result);
    }
    exports.set = set;
    function wrap(key, fn) {
        const newFn = function () {
            push(key);
            const ret = fn.apply(this, arguments);
            pop();
            return ret;
        };
        const fnProto = Object.getPrototypeOf(fn);
        if (Object.getPrototypeOf(newFn) !== fnProto) {
            Object.setPrototypeOf(newFn, fnProto);
        }
        Object.assign(newFn, fn);
        return newFn;
    }
    exports.wrap = wrap;
    function resetStack() {
        if (debugStack.length !== 1 || debugStack[0] !== "") {
            (0, amun_1.log)("Unbalanced push/pop on debug stack");
            for (let v of debugStack) {
                (0, amun_1.log)(v);
            }
        }
        debugStack = [""];
    }
    exports.resetStack = resetStack;
});
//# sourceMappingURL=debug.js.map