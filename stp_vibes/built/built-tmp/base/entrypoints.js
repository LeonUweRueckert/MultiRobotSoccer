define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.get = exports.add = void 0;
    let entries = {};
    function add(name, func) {
        if (entries[name]) {
            throw new Error(`An entrypoint with name ${name} already exists`);
        }
        entries[name] = func;
    }
    exports.add = add;
    function get(wrapper) {
        let wrapped = {};
        for (let name in entries) {
            wrapped[name] = wrapper(entries[name]);
        }
        return wrapped;
    }
    exports.get = get;
});
//# sourceMappingURL=entrypoints.js.map