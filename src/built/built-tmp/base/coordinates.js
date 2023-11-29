define(["require", "exports", "base/vector"], function (require, exports, vector_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports._setIsBlue = exports.Coordinates = void 0;
    class Invert {
        toGlobal(data) {
            if (typeof (data) === "number") {
                let num = data;
                if (num > Math.PI) {
                    return num - Math.PI;
                }
                else {
                    return num + Math.PI;
                }
            }
            else {
                let vector = data;
                return new vector_1.Vector(-vector.x, -vector.y);
            }
        }
        toLocal(data) {
            return this.toGlobal(data);
        }
        listToGlobal(data) {
            let inverted = [];
            for (let v of data) {
                inverted.push(this.toGlobal(v));
            }
            return inverted;
        }
        toVision(data) {
            if (typeof (data) === "number") {
                let num = data - Math.PI * 1.5;
                if (num < 0) {
                    num += 2.0 * Math.PI;
                }
                return num;
            }
            else {
                let vector = data.mul(1000);
                return new vector_1.Vector(-vector.y, vector.x);
            }
        }
        fromVision(data) {
            if (typeof (data) === "number") {
                let num = data + Math.PI * 1.5;
                if (num > 2.0 * Math.PI) {
                    num -= 2.0 * Math.PI;
                }
                return num;
            }
            else {
                let vector = data.mul(0.001);
                return new vector_1.Vector(vector.y, -vector.x);
            }
        }
    }
    class Pass {
        toGlobal(value) {
            return value;
        }
        toLocal(value) {
            return value;
        }
        listToGlobal(value) {
            return value;
        }
        toVision(data) {
            if (typeof (data) === "number") {
                let num = data - Math.PI * 0.5;
                if (num < 0) {
                    num += 2.0 * Math.PI;
                }
                return num;
            }
            else {
                let vector = data.mul(1000);
                return new vector_1.Vector(vector.y, -vector.x);
            }
        }
        fromVision(data) {
            if (typeof (data) === "number") {
                let num = data + Math.PI * 0.5;
                if (num > 2.0 * Math.PI) {
                    num -= 2.0 * Math.PI;
                }
                return num;
            }
            else {
                let vector = data.mul(0.001);
                return new vector_1.Vector(-vector.y, vector.x);
            }
        }
    }
    function _setIsBlue(teamIsBlue) {
        if (teamIsBlue) {
            exports.Coordinates = new Invert();
        }
        else {
            exports.Coordinates = new Pass();
        }
    }
    exports._setIsBlue = _setIsBlue;
});
//# sourceMappingURL=coordinates.js.map