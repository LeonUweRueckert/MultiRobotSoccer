define(["require", "exports", "base/geom", "base/mathutil"], function (require, exports, geom, MathUtil) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Vector = void 0;
    class Vector {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
        add(other) {
            return new Vector(this.x + other.x, this.y + other.y);
        }
        sub(other) {
            return new Vector(this.x - other.x, this.y - other.y);
        }
        mul(factor) {
            return new Vector(this.x * factor, this.y * factor);
        }
        div(factor) {
            return new Vector(this.x / factor, this.y / factor);
        }
        unm() {
            return new Vector(-this.x, -this.y);
        }
        withX(newX) {
            return new Vector(newX, this.y);
        }
        withY(newY) {
            return new Vector(this.x, newY);
        }
        isNan() {
            return isNaN(this.x) || isNaN(this.y);
        }
        length() {
            let x = this.x;
            let y = this.y;
            return Math.sqrt(x * x + y * y);
        }
        equals(other) {
            return this.x === other.x && this.y === other.y;
        }
        lengthSq() {
            let x = this.x;
            let y = this.y;
            return x * x + y * y;
        }
        normalized() {
            let x = this.x;
            let y = this.y;
            let l = Math.sqrt(x * x + y * y);
            if (l > 0) {
                let invLen = 1 / l;
                x = x * invLen;
                y = y * invLen;
            }
            return new Vector(x, y);
        }
        withLength(len) {
            if (len === 0) {
                return new Vector(0, 0);
            }
            let x = this.x;
            let y = this.y;
            let l = Math.sqrt(x * x + y * y);
            if (l > 0) {
                l = len / l;
                x *= l;
                y *= l;
            }
            return new Vector(x, y);
        }
        distanceTo(other) {
            let dx = other.x - this.x;
            let dy = other.y - this.y;
            return Math.sqrt(dx * dx + dy * dy);
        }
        distanceToSq(other) {
            let dx = other.x - this.x;
            let dy = other.y - this.y;
            return dx * dx + dy * dy;
        }
        dot(other) {
            return this.x * other.x + this.y * other.y;
        }
        angle() {
            return Math.atan2(this.y, this.x);
        }
        angleDiff(other) {
            if (this.lengthSq() === 0 || other.lengthSq() === 0) {
                return 0;
            }
            return geom.getAngleDiff(this.angle(), other.angle());
        }
        absoluteAngleDiff(other) {
            let thisLength = this.lengthSq();
            let otherLength = other.lengthSq();
            if (thisLength === 0 || otherLength === 0) {
                return 0;
            }
            return Math.acos(MathUtil.bound(-1, this.dot(other) / (Math.sqrt(thisLength) * Math.sqrt(otherLength)), 1));
        }
        perpendicular() {
            return new Vector(this.y, -this.x);
        }
        rotated(angle) {
            let x = this.x;
            let y = this.y;
            let ry = Math.sin(angle) * x + Math.cos(angle) * y;
            let rx = Math.cos(angle) * x - Math.sin(angle) * y;
            return new Vector(rx, ry);
        }
        orthogonalProjection(linePoint1, linePoint2) {
            let rv = linePoint2.sub(linePoint1);
            if (rv.lengthSq() < 0.00001 * 0.00001) {
                return [linePoint1, this.distanceTo(linePoint1)];
            }
            let [is, dist] = geom.intersectLineLine(this, rv.perpendicular(), linePoint1, rv);
            if (is != undefined) {
                return [is, dist * rv.length()];
            }
            else {
                return [this, 0];
            }
        }
        orthogonalDistance(linePoint1, linePoint2) {
            let [_, dist] = this.orthogonalProjection(linePoint1, linePoint2);
            return dist;
        }
        distanceToLineSegment(lineStart, lineEnd) {
            let dir = (lineEnd.sub(lineStart)).normalized();
            let d = this.sub(lineStart);
            if (d.dot(dir) < 0) {
                return d.length();
            }
            d = this.sub(lineEnd);
            if (d.dot(dir) > 0) {
                return d.length();
            }
            return Math.abs(d.x * dir.y - d.y * dir.x);
        }
        nearestPosOnLine(lineStart, lineEnd) {
            let dir = (lineEnd.sub(lineStart));
            if ((this.sub(lineStart)).dot(dir) <= 0) {
                return lineStart;
            }
            else if ((this.sub(lineEnd)).dot(dir) >= 0) {
                return lineEnd;
            }
            let d1 = dir.x, d2 = dir.y;
            let p1 = lineStart.x, p2 = lineStart.y;
            let a1 = this.x, a2 = this.y;
            let x1 = (d1 * d1 * a1 + d1 * d2 * (a2 - p2) + d2 * d2 * p1) / (d1 * d1 + d2 * d2);
            let x2 = (d2 * d2 * a2 + d2 * d1 * (a1 - p1) + d1 * d1 * p2) / (d2 * d2 + d1 * d1);
            return new Vector(x1, x2);
        }
        complexMultiplication(other) {
            return new Vector(this.x * other.x - this.y * other.y, this.x * other.y + this.y * other.x);
        }
        insideSector(startVector, endVector) {
            let v1p = startVector.perpendicular().unm();
            let v2p = endVector.perpendicular();
            let b1 = this.dot(v1p) >= 0;
            let b2 = this.dot(v2p) >= 0;
            if (v1p.dot(endVector) >= 0) {
                return b1 && b2;
            }
            else {
                return b1 || b2;
            }
        }
        _toString() {
            return `Vector(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
        }
        toString() {
            return this._toString();
        }
        static fromAngle(angle) {
            return new Vector(Math.cos(angle), Math.sin(angle));
        }
        static fromPolar(angle, length) {
            return new Vector(Math.cos(angle) * length, Math.sin(angle) * length);
        }
        static random(sigma, mean = new Vector(0, 0)) {
            let u, v, s;
            do {
                u = -1.0 + 2.0 * MathUtil.random();
                v = -1.0 + 2.0 * MathUtil.random();
                s = u * u + v * v;
            } while (s === 0.0 || s >= 1.0);
            let tmp = sigma * Math.sqrt(-2.0 * Math.log(s) / s);
            return new Vector(tmp * u + mean.x, tmp * v + mean.y);
        }
        static isVector(data) {
            return typeof (data) === "object" && data.constructor.name === "Vector";
        }
    }
    exports.Vector = Vector;
});
//# sourceMappingURL=vector.js.map