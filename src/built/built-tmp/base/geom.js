define(["require", "exports", "base/mathutil", "base/vector"], function (require, exports, MathUtil, vector_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.angleBound = exports.isInStadium = exports.insideRect = exports.inscribedAngle = exports.bisectingAngle = exports.getAngleDiff = exports.normalizeAnglePositive = exports.normalizeAngle = exports.radianToDegree = exports.degreeToRadian = exports.isInTriangle = exports.center = exports.calcQuadrangleArea = exports.checkTriangleOrientation = exports.calcTriangleArea = exports.intersectLinesByPoints = exports.intersectLineLine = exports.getInnerTangentsToCircles = exports.getTangentsToCircle = exports.intersectLineCorridor = exports.intersectLineCircle = exports.boundRect = exports.intersectCircleCircle = void 0;
    function intersectCircleCircle_OLD(c1, r1, c2, r2) {
        let dist = c1.distanceTo(c2);
        if (dist > r1 + r2) {
            return [];
        }
        else if (dist === r1 + r2) {
            return [c1.add((c2.sub(c1)).mul(0.5))];
        }
        else if (dist < r1 + r2) {
            let c1x = c1.x, c1y = c1.y, c2x = c2.x, c2y = c2.y;
            let a1 = (r1 * r1 - r2 * r2 - c1x * c1x + c2x * c2x - c1y * c1y + c2y * c2y) / (2 * c2x - 2 * c1x);
            let a2 = (c1y - c2y) / (c2x - c1x);
            let k1 = 1 + (1 / (a2 * a2));
            let k2 = 2 * c1x + (2 * c1y) / a2 + (2 * a1) / (a2 * a2);
            let k3 = c1x * c1x + (a1 * a1) / (a2 * a2) + (2 * c1y * a1) / a2 + (c1y * c1y) - (r1 * r1);
            let finalX1 = ((k2 / k1) / 2) + Math.sqrt(((k2 / k1) * (k2 / k1) / 4) - (k3 / k1));
            let finalX2 = ((k2 / k1) / 2) - Math.sqrt(((k2 / k1) * (k2 / k1) / 4) - (k3 / k1));
            let finalY1 = 1 / a2 * finalX1 - (a1 / a2);
            let finalY2 = 1 / a2 * finalX2 - (a1 / a2);
            return [new vector_1.Vector(finalX1, finalY1), new vector_1.Vector(finalX2, finalY2)];
        }
        return [];
    }
    exports.intersectCircleCircle = intersectCircleCircleCos;
    function intersectCircleCircleCos(c1, r1, c2, r2) {
        const dist = c1.distanceTo(c2);
        if (r1 > r2 + dist || r2 > r1 + dist || dist > r1 + r2) {
            return [];
        }
        const cosR1 = (r1 * r1 + dist * dist - r2 * r2) / (2 * dist);
        const M = (c2.sub(c1)).mul((cosR1 / dist));
        let [res1, res2, l1, l2] = intersectLineCircle(c1.add(M), M.perpendicular(), c1, r1);
        if (res1 == undefined) {
            throw new Error("undefined");
        }
        if (res2 !== undefined && res1.x < res2.x) {
            [res1, res2] = [res2, res1];
        }
        return [res1, res2];
    }
    function boundRect(p1, pos, p2) {
        return new vector_1.Vector(MathUtil.bound(Math.min(p1.x, p2.x), pos.x, Math.max(p1.x, p2.x)), MathUtil.bound(Math.min(p1.y, p2.y), pos.y, Math.max(p1.y, p2.y)));
    }
    exports.boundRect = boundRect;
    function intersectLineCircle(offset, dir, center, radius) {
        dir = dir.normalized();
        let constPart = offset.sub(center);
        let a = dir.dot(dir);
        let b = 2 * dir.dot(constPart);
        let c = constPart.dot(constPart) - radius * radius;
        let det = b * b - 4 * a * c;
        if (det < 0) {
            return [];
        }
        if (det < 0.00001) {
            let lambda1 = (-b) / (2 * a);
            return [offset.add(dir.mul(lambda1)), undefined, lambda1, undefined];
        }
        let lambda1 = (-b + Math.sqrt(det)) / (2 * a);
        let lambda2 = (-b - Math.sqrt(det)) / (2 * a);
        let point1 = offset.add(dir.mul(lambda1));
        let point2 = offset.add(dir.mul(lambda2));
        return [point1, point2, lambda1, lambda2];
    }
    exports.intersectLineCircle = intersectLineCircle;
    function intersectLineCorridor(offset, direction, offsetCorridor, directionCorridor, widthHalf) {
        if (directionCorridor.equals(new vector_1.Vector(0, 0))) {
            throw new Error("intersectLineCorridor: directionCorridor can not be a 0 vector");
        }
        let corridorPerpendicular = directionCorridor.perpendicular().withLength(widthHalf);
        let offsetCorridorLeft = offsetCorridor.add(corridorPerpendicular);
        let offsetCorridorRight = offsetCorridor.sub(corridorPerpendicular);
        let [intersectionLeft, lambdaLeftLine, lambdaLeft] = intersectLineLine(offset, direction, offsetCorridorLeft, directionCorridor);
        if (intersectionLeft == undefined || direction.equals(new vector_1.Vector(0, 0))) {
            let leftDistance = offset.orthogonalDistance(offsetCorridorLeft, offsetCorridorLeft.add(directionCorridor));
            let rightDistance = offset.orthogonalDistance(offsetCorridorRight, offsetCorridorRight.add(directionCorridor));
            if (Math.abs(leftDistance) <= widthHalf * 2 && Math.abs(rightDistance) <= widthHalf * 2) {
                return [undefined, undefined, -Infinity, Infinity, -Infinity, Infinity];
            }
            return [];
        }
        let [intersectionRight, lambdaRightLine, lambdaRight] = intersectLineLine(offset, direction, offsetCorridorRight, directionCorridor);
        if (lambdaRightLine != undefined && lambdaLeftLine != undefined &&
            lambdaRightLine < lambdaLeftLine) {
            return [intersectionRight, intersectionLeft, lambdaRightLine, lambdaLeftLine, lambdaRight, lambdaLeft];
        }
        return [intersectionLeft, intersectionRight, lambdaLeftLine, lambdaRightLine, lambdaRight, lambdaLeft];
    }
    exports.intersectLineCorridor = intersectLineCorridor;
    function getTangentsToCircle(point, centerpoint, radius) {
        return (0, exports.intersectCircleCircle)(centerpoint, radius, centerpoint.add((point.sub(centerpoint)).mul(0.5)), 0.5 * (centerpoint).distanceTo(point));
    }
    exports.getTangentsToCircle = getTangentsToCircle;
    function getInnerTangentsToCircles(centerpoint1, radius1, centerpoint2, radius2) {
        let d = centerpoint2.sub(centerpoint1);
        if (d.length() > radius1 + radius2) {
            let intersection = centerpoint1.add(d.mul((radius1 / (radius1 + radius2))));
            let tangents = getTangentsToCircle(intersection, centerpoint1, radius1);
            return [intersection, tangents[0], tangents[1]];
        }
        return [];
    }
    exports.getInnerTangentsToCircles = getInnerTangentsToCircles;
    function intersectLineLine(pos1, dir1, pos2, dir2) {
        if (Math.abs(dir1.perpendicular().dot(dir2)) / (dir1.length() * dir2.length()) < 0.0001) {
            return [];
        }
        let normal1 = dir1.perpendicular();
        let normal2 = dir2.perpendicular();
        let diff = pos2.sub(pos1);
        let t1 = normal2.dot(diff) / normal2.dot(dir1);
        let t2 = -normal1.dot(diff) / normal1.dot(dir2);
        return [pos1.add((dir1.mul(t1))), t1, t2];
    }
    exports.intersectLineLine = intersectLineLine;
    function intersectLinesByPoints(p1, p2, q1, q2) {
        return intersectLineLine(p1, p2.sub(p1), q1, q2.sub(q1));
    }
    exports.intersectLinesByPoints = intersectLinesByPoints;
    function calcTriangleArea(p1, p2, p3) {
        let p21 = p2.sub(p1);
        let p31 = p3.sub(p1);
        return 0.5 * Math.abs(p21.x * p31.y - p21.y * p31.x);
    }
    exports.calcTriangleArea = calcTriangleArea;
    function checkTriangleOrientation(p1, p2, p3) {
        let v21 = p2.sub(p1);
        let v31 = p3.sub(p1);
        return MathUtil.sign(v21.x * v31.y - v21.y * v31.x);
    }
    exports.checkTriangleOrientation = checkTriangleOrientation;
    function calcQuadrangleArea(p1, p2, p3, p4) {
        return calcTriangleArea(p1, p2, p3) + calcTriangleArea(p1, p3, p4);
    }
    exports.calcQuadrangleArea = calcQuadrangleArea;
    function center(pointArray) {
        let pos = new vector_1.Vector(0, 0);
        for (let p of pointArray) {
            pos = pos.add(p);
        }
        return pos.div(pointArray.length);
    }
    exports.center = center;
    function isInTriangle(a, b, c, p) {
        let v0 = c.sub(a);
        let v1 = b.sub(a);
        let v2 = p.sub(a);
        let dot00 = v0.dot(v0);
        let dot01 = v0.dot(v1);
        let dot02 = v0.dot(v2);
        let dot11 = v1.dot(v1);
        let dot12 = v1.dot(v2);
        let invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
        let u = (dot11 * dot02 - dot01 * dot12) * invDenom;
        if (u < 0) {
            return false;
        }
        let v = (dot00 * dot12 - dot01 * dot02) * invDenom;
        return v >= 0 && u + v <= 1;
    }
    exports.isInTriangle = isInTriangle;
    function degreeToRadian(angleInDegree) {
        return angleInDegree * Math.PI / 180;
    }
    exports.degreeToRadian = degreeToRadian;
    function radianToDegree(angleInRadian) {
        return angleInRadian * 180 / Math.PI;
    }
    exports.radianToDegree = radianToDegree;
    function normalizeAngle(angle) {
        while (angle > Math.PI) {
            angle = angle - 2 * Math.PI;
        }
        while (angle < -Math.PI) {
            angle = angle + 2 * Math.PI;
        }
        return angle;
    }
    exports.normalizeAngle = normalizeAngle;
    function normalizeAnglePositive(angle) {
        while (angle > 2 * Math.PI) {
            angle = angle - 2 * Math.PI;
        }
        while (angle < 0) {
            angle = angle + 2 * Math.PI;
        }
        return angle;
    }
    exports.normalizeAnglePositive = normalizeAnglePositive;
    function getAngleDiff(angle1, angle2) {
        let diff = angle2 - angle1;
        return normalizeAngle(diff);
    }
    exports.getAngleDiff = getAngleDiff;
    function bisectingAngle(angle1, angle2) {
        let bisectrix = (angle1 + angle2) / 2;
        let piHalf = Math.PI / 2;
        if (((angle1 < -piHalf) && (angle2 > piHalf)) || ((angle1 > piHalf) && (angle2 < -piHalf))) {
            bisectrix = normalizeAngle(bisectrix + Math.PI);
        }
        return bisectrix;
    }
    exports.bisectingAngle = bisectingAngle;
    function inscribedAngle(point1, point2, theta) {
        let radius = point1.distanceTo(point2) / (2 * Math.sin(theta));
        let centerOfCircleOne = point1.add(((point2.sub(point1)).rotated(Math.PI / 2 - theta)).withLength(radius));
        let centerOfCircleTwo = point1.add(((point2.sub(point1)).rotated(-(Math.PI / 2 - theta))).withLength(radius));
        return [centerOfCircleOne, centerOfCircleTwo, radius];
    }
    exports.inscribedAngle = inscribedAngle;
    function insideRect(corner1, corner2, x) {
        let minCornerX, maxCornerX, minCornerY, maxCornerY;
        if (corner1.x < corner2.x) {
            minCornerX = corner1.x, maxCornerX = corner2.x;
        }
        else {
            minCornerX = corner2.x, maxCornerX = corner1.x;
        }
        if (corner1.y < corner2.y) {
            minCornerY = corner1.y, maxCornerY = corner2.y;
        }
        else {
            minCornerY = corner2.y, maxCornerY = corner1.y;
        }
        return minCornerX < x.x && x.x < maxCornerX &&
            minCornerY < x.y && x.y < maxCornerY;
    }
    exports.insideRect = insideRect;
    function isInStadium(a, b, radius, p) {
        const radiusSq = radius ** 2;
        if (p.distanceToSq(a) < radiusSq) {
            return true;
        }
        if (p.distanceToSq(b) < radiusSq) {
            return true;
        }
        const offset = (b.sub(a)).perpendicular();
        return insideRect(a.sub(offset), b.add(offset), p);
    }
    exports.isInStadium = isInStadium;
    function angleBound(amin, val, amax) {
        if (val <= amax && val >= amin)
            return val;
        let diffMin = Math.abs(getAngleDiff(amin, val));
        let diffMax = Math.abs(getAngleDiff(amax, val));
        if (diffMax < diffMin)
            return amax;
        return amin;
    }
    exports.angleBound = angleBound;
});
//# sourceMappingURL=geom.js.map