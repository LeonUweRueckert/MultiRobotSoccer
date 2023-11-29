define(["require", "exports", "base/option", "base/random"], function (require, exports, Option, random_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.variance = exports.average = exports.sign = exports.solveSq = exports.solveLin = exports.round = exports.roundUpwards = exports.roundTowards = exports.bound = exports.randomInt = exports.random = exports.randomseed = void 0;
    let min = Math.min;
    let max = Math.max;
    let amunCopy = amun;
    class ExtendedRandom {
        constructor(random) {
            this._random = random;
        }
        nextNumber53() {
            return this._random.nextNumber53();
        }
        nextInt32(range) {
            if (range == undefined) {
                throw new Error("nextInt32 without range is not possible for ExtendedRandom");
            }
            return Math.floor(this._random.nextNumber53() * (range[1] - range[0] + 1) + range[0]);
        }
    }
    const USE_LUA_PRNG = Option.addOption("Enable Lua PRNG", false);
    function produceRandom(seed) {
        if (seed == undefined) {
            seed = new Date().getTime();
        }
        if (USE_LUA_PRNG) {
            amunCopy.luaRandomSetSeed(seed);
            return _random == undefined ? new ExtendedRandom({ nextNumber53: amunCopy.luaRandom }) : _random;
        }
        else {
            return new random_1.Random(seed);
        }
    }
    let _random = undefined;
    function randomseed(seed) {
        _random = produceRandom(seed);
    }
    exports.randomseed = randomseed;
    function initRandom() {
        if (_random == undefined) {
            if (amun.isDebug) {
                throw new Error("Unseeded Random was tried");
            }
            _random = produceRandom();
        }
    }
    function random() {
        initRandom();
        return _random.nextNumber53();
    }
    exports.random = random;
    function randomInt(range) {
        if (range != undefined && range[1] - range[0] < 0) {
            throw new Error("randomInt: range size can't be negative or zero");
        }
        initRandom();
        return _random.nextInt32(range);
    }
    exports.randomInt = randomInt;
    function bound(vmin, par, vmax) {
        return min(max(vmin, par), vmax);
    }
    exports.bound = bound;
    function roundTowards(val, dest, spacing) {
        if (val > dest + 0.5 + spacing / 2 || val < dest - 0.5 - spacing / 2) {
            return Math.round(val);
        }
        else {
            return dest;
        }
    }
    exports.roundTowards = roundTowards;
    function roundUpwards(val, spacing) {
        if (val + spacing + 0.5 >= Math.ceil(val)) {
            return Math.ceil(val);
        }
        else {
            return Math.floor(val);
        }
    }
    exports.roundUpwards = roundUpwards;
    function round(val, digits = 0) {
        let fac = 10 ** digits;
        return Math.floor(val * fac + 0.5) / fac;
    }
    exports.round = round;
    function solveLin(a, b) {
        if (a === 0) {
            return;
        }
        return -b / a;
    }
    exports.solveLin = solveLin;
    function sgn(value) {
        if (value >= 0) {
            return 1;
        }
        else {
            return -1;
        }
    }
    function solveSq(a, b, c) {
        if (a === 0) {
            if (b === 0) {
                return [];
            }
            else {
                return [-c / b];
            }
        }
        let det = b * b - 4 * a * c;
        if (det < 0) {
            return [];
        }
        else if (det === 0) {
            return [-b / (2 * a)];
        }
        det = Math.sqrt(det);
        let t2 = (-b - sgn(b) * det) / (2 * a);
        let t1 = c / (a * t2);
        let minTi = Math.min(t1, t2);
        if ((minTi >= 0 && t1 < t2) || (minTi < 0 && t1 >= t2)) {
            return [t1, t2];
        }
        else {
            return [t2, t1];
        }
    }
    exports.solveSq = solveSq;
    function sign(value) {
        if (value > 0) {
            return 1;
        }
        else if (value < 0) {
            return -1;
        }
        else {
            return 0;
        }
    }
    exports.sign = sign;
    function average(array, indexStart = 0, indexEnd = array.length) {
        let sum = 0;
        for (let i = indexStart; i < indexEnd; i++) {
            sum += array[i];
        }
        return sum / (indexEnd - indexStart);
    }
    exports.average = average;
    function variance(array, avg, indexStart = 0, indexEnd = array.length) {
        if (avg == undefined) {
            avg = average(array, indexStart, indexEnd);
        }
        let variance = 0;
        for (let i = indexStart; i < indexEnd; i++) {
            let diff = array[i] - avg;
            variance = variance + diff * diff;
        }
        return variance / (indexEnd - indexStart);
    }
    exports.variance = variance;
});
//# sourceMappingURL=mathutil.js.map