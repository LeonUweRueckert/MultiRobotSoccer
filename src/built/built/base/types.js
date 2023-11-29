define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parameterizeClass = void 0;
    function parameterizeClass(ctor, ...tail) {
        const castedCtor = ctor;
        const parameterizedCtor = class extends castedCtor {
            constructor(head) {
                super(head, ...tail);
            }
        };
        Object.defineProperty(parameterizedCtor, "name", {
            "configurable": true,
            "enumerable": false,
            "value": ctor.name,
            "writable": false,
        });
        return parameterizedCtor;
    }
    exports.parameterizeClass = parameterizeClass;
});
//# sourceMappingURL=types.js.map