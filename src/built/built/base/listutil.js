define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.flat = exports.partition = exports.some = exports.max = exports.min = void 0;
    function min(list, rate) {
        let currentMin = undefined;
        let minRating = Infinity;
        for (const i of list) {
            const rating = rate(i);
            if (rating < minRating) {
                currentMin = i;
                minRating = rating;
            }
        }
        return [currentMin, minRating];
    }
    exports.min = min;
    function max(list, rate) {
        let currentMax = undefined;
        let maxRating = -Infinity;
        for (const i of list) {
            const rating = rate(i);
            if (rating > maxRating) {
                currentMax = i;
                maxRating = rating;
            }
        }
        return [currentMax, maxRating];
    }
    exports.max = max;
    function some(list, pred) {
        for (const elem of list) {
            if (pred(elem)) {
                return true;
            }
        }
        return false;
    }
    exports.some = some;
    function partition(list, pred) {
        let accepted = [];
        let rejected = [];
        for (const elem of list) {
            if (pred(elem)) {
                accepted.push(elem);
            }
            else {
                rejected.push(elem);
            }
        }
        return [accepted, rejected];
    }
    exports.partition = partition;
    function flat(list) {
        return list.reduce((acc, val) => acc.concat(val), []);
    }
    exports.flat = flat;
});
//# sourceMappingURL=listutil.js.map