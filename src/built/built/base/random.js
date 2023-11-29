define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Random = void 0;
    class Random {
        constructor(seed) {
            this.mt = new Array(Random.N);
            this.mti = Random.N + 1;
            this.init_genrand(seed);
        }
        init_genrand(s) {
            this.mt[0] = s >>> 0;
            for (this.mti = 1; this.mti < Random.N; this.mti++) {
                var s = this.mt[this.mti - 1] ^ (this.mt[this.mti - 1] >>> 30);
                this.mt[this.mti] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253)
                    + this.mti;
                this.mt[this.mti] >>>= 0;
            }
        }
        _nextInt32() {
            var y;
            var mag01 = new Array(0x0, Random.MATRIX_A);
            if (this.mti >= Random.N) {
                var kk;
                if (this.mti == Random.N + 1)
                    this.init_genrand(5489);
                for (kk = 0; kk < Random.N - Random.M; kk++) {
                    y = (this.mt[kk] & Random.UPPER_MASK) | (this.mt[kk + 1] & Random.LOWER_MASK);
                    this.mt[kk] = this.mt[kk + Random.M] ^ (y >>> 1) ^ mag01[y & 0x1];
                }
                for (; kk < Random.N - 1; kk++) {
                    y = (this.mt[kk] & Random.UPPER_MASK) | (this.mt[kk + 1] & Random.LOWER_MASK);
                    this.mt[kk] = this.mt[kk + (Random.M - Random.N)] ^ (y >>> 1) ^ mag01[y & 0x1];
                }
                y = (this.mt[Random.N - 1] & Random.UPPER_MASK) | (this.mt[0] & Random.LOWER_MASK);
                this.mt[Random.N - 1] = this.mt[Random.M - 1] ^ (y >>> 1) ^ mag01[y & 0x1];
                this.mti = 0;
            }
            y = this.mt[this.mti++];
            y ^= (y >>> 11);
            y ^= (y << 7) & 0x9d2c5680;
            y ^= (y << 15) & 0xefc60000;
            y ^= (y >>> 18);
            return y >>> 0;
        }
        nextInt32(range) {
            let result = this._nextInt32();
            if (range == undefined) {
                return result;
            }
            return (result % (range[1] - range[0] + 1)) + range[0];
        }
        nextInt31() {
            return (this._nextInt32() >>> 1);
        }
        nextNumber() {
            return this._nextInt32() * (1.0 / 4294967295.0);
        }
        nextNumber53() {
            var a = this._nextInt32() >>> 5, b = this._nextInt32() >>> 6;
            return (a * 67108864.0 + b) * (1.0 / 9007199254740992.0);
        }
    }
    exports.Random = Random;
    Random.N = 624;
    Random.M = 397;
    Random.MATRIX_A = 0x9908b0df;
    Random.UPPER_MASK = 0x80000000;
    Random.LOWER_MASK = 0x7fffffff;
});
//# sourceMappingURL=random.js.map