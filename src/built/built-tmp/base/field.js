define(["require", "exports", "base/geom", "base/mathutil", "base/referee", "base/vector", "base/world"], function (require, exports, geom, MathUtil, Referee, vector_1, World) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.defenseBaselineIntersectionDistance = exports.isInOpponentGoal = exports.isInFriendlyGoal = exports.nextAllowedFieldLineCut = exports.nextLineCut = exports.isInOwnCorner = exports.distanceToFriendlyGoalLine = exports.intersectCircleDefenseArea = exports.defenseIntersectionByWay = exports.allowedLineSegments = exports.maxWay = exports.cornerPointsBetweenWays = exports.intersectionsRayDefenseArea = exports.intersectRayDefenseArea = exports.distanceToOpponentDefenseArea = exports.distanceToFriendlyDefenseArea = exports.isInOpponentDefenseArea = exports.isInFriendlyDefenseArea = exports.isInAllowedField = exports.limitToAllowedField = exports.isInDefenseArea = exports.distanceToDefenseArea = exports.distanceToDefenseAreaSq = exports.distanceToFieldBorder = exports.isInField = exports.limitToField = void 0;
    const G = World.Geometry;
    function limitToField(pos, boundaryWidth = 0) {
        let allowedHeight = G.FieldHeightHalf + boundaryWidth;
        let y = MathUtil.bound(-allowedHeight, pos.y, allowedHeight);
        let allowedWidth = G.FieldWidthHalf + boundaryWidth;
        let x = MathUtil.bound(-allowedWidth, pos.x, allowedWidth);
        return new vector_1.Vector(x, y);
    }
    exports.limitToField = limitToField;
    function limitToAllowedField_2017(pos, boundaryWidth = 0) {
        const extraLimit = -boundaryWidth;
        let oppExtraLimit = extraLimit;
        if (Referee.isStopState() || Referee.isFriendlyFreeKickState()) {
            oppExtraLimit = oppExtraLimit + G.FreeKickDefenseDist + 0.10;
        }
        pos = limitToField(pos, -extraLimit);
        if (isInFriendlyDefenseArea(pos, extraLimit)) {
            if (Math.abs(pos.x) <= G.DefenseStretchHalf) {
                pos = new vector_1.Vector(pos.x, -G.FieldHeightHalf + G.DefenseRadius + extraLimit);
            }
            else {
                let circleMidpoint = new vector_1.Vector(G.DefenseStretchHalf * MathUtil.sign(pos.x), -G.FieldHeightHalf);
                pos = circleMidpoint.add((pos.sub(circleMidpoint)).withLength(G.DefenseRadius + extraLimit));
            }
            return pos;
        }
        else if (isInOpponentDefenseArea(pos, oppExtraLimit)) {
            if (Math.abs(pos.x) <= G.DefenseStretchHalf) {
                pos = new vector_1.Vector(pos.x, G.FieldHeightHalf - G.DefenseRadius - oppExtraLimit);
            }
            else {
                let circleMidpoint = new vector_1.Vector(G.DefenseStretchHalf * MathUtil.sign(pos.x), G.FieldHeightHalf);
                pos = circleMidpoint.add((pos.sub(circleMidpoint)).withLength(G.DefenseRadius + oppExtraLimit));
            }
            return pos;
        }
        return pos;
    }
    function limitToAllowedField_2018(pos, boundaryWidth = 0) {
        const extraLimit = -boundaryWidth;
        let oppExtraLimit = extraLimit;
        if (Referee.isStopState() || Referee.isFriendlyFreeKickState()) {
            oppExtraLimit = oppExtraLimit + G.FreeKickDefenseDist + 0.10;
        }
        pos = limitToField(pos, -extraLimit);
        if (isInFriendlyDefenseArea(pos, extraLimit)) {
            let targety = -G.FieldHeightHalf + G.DefenseHeight + extraLimit;
            let targetx = G.DefenseWidthHalf + extraLimit;
            let dy = targety - pos.y;
            let dx = targetx - Math.abs(pos.x);
            if (dx > dy) {
                return new vector_1.Vector(pos.x, targety);
            }
            else {
                return new vector_1.Vector(MathUtil.sign(pos.x) * targetx, pos.y);
            }
        }
        else if (isInOpponentDefenseArea(pos, oppExtraLimit)) {
            let targety = G.FieldHeightHalf - G.DefenseHeight - oppExtraLimit;
            let targetx = G.DefenseWidthHalf + oppExtraLimit;
            let dy = pos.y - targety;
            let dx = targetx - Math.abs(pos.x);
            if (dx > dy) {
                return new vector_1.Vector(pos.x, targety);
            }
            else {
                return new vector_1.Vector(MathUtil.sign(pos.x) * targetx, pos.y);
            }
        }
        return pos;
    }
    function isInField(pos, boundaryWidth = 0) {
        let allowedHeight = G.FieldHeightHalf + boundaryWidth;
        if (Math.abs(pos.x) > G.GoalWidth / 2 && Math.abs(pos.y) > allowedHeight
            || Math.abs(pos.y) > allowedHeight + G.GoalDepth) {
            return false;
        }
        let allowedWidth = G.FieldWidthHalf + boundaryWidth;
        if (Math.abs(pos.x) > allowedWidth) {
            return false;
        }
        return true;
    }
    exports.isInField = isInField;
    function distanceToFieldBorder(pos, boundaryWidth = 0) {
        let allowedWidth = G.FieldWidthHalf + boundaryWidth;
        let dx = allowedWidth - Math.abs(pos.x);
        let allowedHeight = G.FieldHeightHalf + boundaryWidth;
        let dy = allowedHeight - Math.abs(pos.y);
        return MathUtil.bound(0, dx, dy);
    }
    exports.distanceToFieldBorder = distanceToFieldBorder;
    function distanceToDefenseAreaSq_2018(pos, friendly) {
        let defenseMin = new vector_1.Vector(-G.DefenseWidthHalf, G.FieldHeightHalf - G.DefenseHeight);
        let defenseMax = new vector_1.Vector(G.DefenseWidthHalf, G.FieldHeightHalf);
        if (friendly) {
            let temp = defenseMin;
            defenseMin = defenseMax.unm();
            defenseMax = temp.unm();
        }
        return pos.distanceToSq(geom.boundRect(defenseMin, pos, defenseMax));
    }
    function isInDefenseArea_2018(pos, radius, friendly) {
        if (radius < 0) {
            let defenseMin = new vector_1.Vector(-G.DefenseWidthHalf - radius, G.FieldHeightHalf - G.DefenseHeight - radius);
            let defenseMax = new vector_1.Vector(G.DefenseWidthHalf + radius, G.FieldHeightHalf + radius);
            if (friendly) {
                let temp = defenseMin;
                defenseMin = defenseMax.unm();
                defenseMax = temp.unm();
            }
            if (defenseMin.x > defenseMax.x || defenseMin.y > defenseMax.y) {
                return false;
            }
            return geom.insideRect(defenseMin, defenseMax, pos);
        }
        return distanceToDefenseAreaSq_2018(pos, friendly) <= radius * radius;
    }
    function distanceToDefenseArea_2018(pos, radius, friendly) {
        let defenseMin = new vector_1.Vector(-G.DefenseWidthHalf, G.FieldHeightHalf - G.DefenseHeight);
        let defenseMax = new vector_1.Vector(G.DefenseWidthHalf, G.FieldHeightHalf);
        let distance;
        if (friendly) {
            pos = pos.unm();
        }
        if (radius < 0 && isInDefenseArea_2018(pos, 0, friendly)) {
            let min = defenseMax.x - pos.x;
            min = Math.min(min, pos.x - defenseMin.x);
            min = Math.min(min, defenseMax.y - pos.y);
            min = Math.min(min, pos.y - defenseMin.y);
            distance = min + radius;
            return Math.max(-distance, 0);
        }
        distance = pos.distanceTo(geom.boundRect(defenseMin, pos, defenseMax)) - radius;
        return Math.max(distance, 0);
    }
    function distanceToDefenseArea_2017(pos, radius, friendly) {
        radius = radius + G.DefenseRadius;
        let defenseY = friendly ? -G.FieldHeightHalf : G.FieldHeightHalf;
        let inside = new vector_1.Vector(MathUtil.bound(-G.DefenseStretchHalf, pos.x, G.DefenseStretchHalf), defenseY);
        let distance = pos.distanceTo(inside) - radius;
        return (distance < 0) ? 0 : distance;
    }
    function distanceToDefenseAreaSq_2017(pos, friendly) {
        let d = distanceToDefenseArea_2017(pos, 0, friendly);
        return d * d;
    }
    function isInDefenseArea_2017(pos, radius, friendly) {
        if (radius < -G.DefenseRadius) {
            return false;
        }
        radius = radius + G.DefenseRadius;
        let defenseY = friendly ? -G.FieldHeightHalf : G.FieldHeightHalf;
        let inside = new vector_1.Vector(MathUtil.bound(-G.DefenseStretchHalf, pos.x, G.DefenseStretchHalf), defenseY);
        return pos.distanceToSq(inside) <= radius * radius;
    }
    if (World.RULEVERSION === "2018") {
        exports.distanceToDefenseAreaSq = distanceToDefenseAreaSq_2018;
        exports.distanceToDefenseArea = distanceToDefenseArea_2018;
        exports.isInDefenseArea = isInDefenseArea_2018;
        exports.limitToAllowedField = limitToAllowedField_2018;
    }
    else {
        exports.distanceToDefenseAreaSq = distanceToDefenseAreaSq_2017;
        exports.distanceToDefenseArea = distanceToDefenseArea_2017;
        exports.isInDefenseArea = isInDefenseArea_2017;
        exports.limitToAllowedField = limitToAllowedField_2017;
    }
    function isInAllowedField(pos, boundaryWidth) {
        return isInField(pos, boundaryWidth) &&
            !(0, exports.isInDefenseArea)(pos, -boundaryWidth, true) &&
            !(0, exports.isInDefenseArea)(pos, -boundaryWidth, false) &&
            !isInFriendlyGoal(pos) &&
            !isInOpponentGoal(pos);
    }
    exports.isInAllowedField = isInAllowedField;
    function isInFriendlyDefenseArea(pos, radius) {
        return (0, exports.isInDefenseArea)(pos, radius, true);
    }
    exports.isInFriendlyDefenseArea = isInFriendlyDefenseArea;
    function isInOpponentDefenseArea(pos, radius) {
        return (0, exports.isInDefenseArea)(pos, radius, false);
    }
    exports.isInOpponentDefenseArea = isInOpponentDefenseArea;
    function distanceToFriendlyDefenseArea(pos, radius) {
        return (0, exports.distanceToDefenseArea)(pos, radius, true);
    }
    exports.distanceToFriendlyDefenseArea = distanceToFriendlyDefenseArea;
    function distanceToOpponentDefenseArea(pos, radius) {
        return (0, exports.distanceToDefenseArea)(pos, radius, false);
    }
    exports.distanceToOpponentDefenseArea = distanceToOpponentDefenseArea;
    function intersectRayArc(pos, dir, m, r, minangle, maxangle) {
        let intersections = [];
        let [i1, i2, l1, l2] = geom.intersectLineCircle(pos, dir, m, r);
        let interval = geom.normalizeAnglePositive(maxangle - minangle);
        if (i1 && l1 >= 0) {
            let a1 = geom.normalizeAnglePositive((i1.sub(m)).angle() - minangle);
            if (a1 < interval) {
                intersections.push([i1, a1, l1]);
            }
        }
        if (i2 && l2 != undefined && l2 >= 0) {
            let a2 = geom.normalizeAnglePositive((i2.sub(m)).angle() - minangle);
            if (a2 < interval) {
                intersections.push([i2, a2, l2]);
            }
        }
        return intersections;
    }
    function intersectionsRayDefenseArea_2018(pos, dir, extraDistance, friendly) {
        let corners = [];
        corners[0] = new vector_1.Vector(G.DefenseWidthHalf + extraDistance, G.FieldHeightHalf);
        corners[1] = new vector_1.Vector(G.DefenseWidthHalf, G.FieldHeightHalf - G.DefenseHeight - extraDistance);
        corners[2] = new vector_1.Vector(-G.DefenseWidthHalf - extraDistance, G.FieldHeightHalf - G.DefenseHeight);
        let directions = [];
        directions[0] = new vector_1.Vector(0, -1);
        directions[1] = new vector_1.Vector(-1, 0);
        directions[2] = new vector_1.Vector(0, 1);
        let f = friendly ? -1 : 1;
        let way = 0;
        let intersections = [];
        for (let i = 0; i < corners.length; i++) {
            let v = corners[i];
            let length = (i % 2 === 1) ? G.DefenseWidth : G.DefenseHeight;
            let [ipos, l1, l2] = geom.intersectLineLine(pos, dir, v.mul(f), directions[i].mul(f));
            if (l1 != undefined && l1 >= 0 && l2 >= 0 && l2 <= length
                && (!(l1 === 0 && l2 === 0) || ipos.distanceToSq(v.mul(f)) < 0.0001)) {
                intersections.push({ pos: ipos, way: way + l2, sec: (i + 1) * 2 - 1 });
            }
            way = way + length;
            if (i < 2 && extraDistance > 0) {
                let corner = new vector_1.Vector((3 - (i + 1) * 2) * G.DefenseWidthHalf, G.FieldHeightHalf - G.DefenseHeight).mul(f);
                let oppRotation = friendly ? 0 : Math.PI;
                let circleIntersections = intersectRayArc(pos, dir, corner, extraDistance, Math.PI - (i + 1) * 0.5 * Math.PI + oppRotation, 1.5 * Math.PI - (i + 1) * 0.5 * Math.PI + oppRotation);
                for (let intersection of circleIntersections) {
                    intersections.push({ pos: intersection[0], way: way + (Math.PI / 2 - intersection[1]) * extraDistance, sec: (i + 1) * 2 });
                }
            }
            way = way + Math.PI * extraDistance / 2;
            if (intersections.length === 2) {
                break;
            }
        }
        return intersections;
    }
    function intersectDefenseArea_2018(pos, dir, extraDistance, friendly, invertedPos = false) {
        let intersections = intersectionsRayDefenseArea_2018(pos, dir, extraDistance, friendly);
        if (intersections[1] && (pos.distanceToSq(intersections[0].pos) > pos.distanceToSq(intersections[1].pos) !== invertedPos)) {
            return [intersections[1].pos, intersections[1].way, intersections[1].sec];
        }
        else if (intersections[0]) {
            return [intersections[0].pos, intersections[0].way, intersections[0].sec];
        }
        return [undefined, G.DefenseHeight + G.DefenseWidthHalf + extraDistance * Math.PI / 4];
    }
    function defenseIntersectionByWay_2018(way, extraDistance, friendly) {
        let corners = [];
        corners[0] = new vector_1.Vector(G.DefenseWidthHalf + extraDistance, G.FieldHeightHalf);
        corners[1] = new vector_1.Vector(G.DefenseWidthHalf, G.FieldHeightHalf - G.DefenseHeight - extraDistance);
        corners[2] = new vector_1.Vector(-G.DefenseWidthHalf - extraDistance, G.FieldHeightHalf - G.DefenseHeight);
        let directions = [];
        directions[0] = new vector_1.Vector(0, -1);
        directions[1] = new vector_1.Vector(-1, 0);
        directions[2] = new vector_1.Vector(0, 1);
        let f = friendly ? -1 : 1;
        for (let i = 0; i < 3; i++) {
            let v = corners[i];
            let length = (i % 2 === 1) ? G.DefenseWidth : G.DefenseHeight;
            if (way <= length || i === 2) {
                return (v.add(directions[i].mul(way))).mul(f);
            }
            way = way - length - Math.PI / 2 * extraDistance;
            if (way < 0) {
                let corner = new vector_1.Vector((3 - (i + 1) * 2) * G.DefenseWidthHalf, G.FieldHeightHalf - G.DefenseHeight).mul(f);
                let dir = vector_1.Vector.fromPolar(-Math.PI / 2 * (i + 1) - way / extraDistance, f);
                return corner.add(dir.mul(extraDistance));
            }
        }
        return undefined;
    }
    function intersectionsRayDefenseArea_2017(pos, dir, extraDistance = 0, friendly = false) {
        let radius = G.DefenseRadius + extraDistance;
        if (radius < 0) {
            throw new Error("extraDistance must not be smaller than -G.DefenseRadius");
        }
        let arcway = radius * Math.PI / 2;
        let lineway = G.DefenseStretch;
        let totalway = 2 * arcway + lineway;
        let oppfac = friendly ? 1 : -1;
        let leftCenter = new vector_1.Vector(-G.DefenseStretchHalf, -G.FieldHeightHalf).mul(oppfac);
        let rightCenter = new vector_1.Vector(G.DefenseStretchHalf, -G.FieldHeightHalf).mul(oppfac);
        let oppadd = friendly ? 0 : Math.PI;
        let to_opponent = geom.normalizeAnglePositive(oppadd + Math.PI / 2);
        let to_friendly = geom.normalizeAnglePositive(oppadd - Math.PI / 2);
        let intersections = [];
        let ileft = intersectRayArc(pos, dir, leftCenter, radius, to_opponent, to_friendly);
        for (let i of ileft) {
            intersections.push({ pos: i[0], l1: (Math.PI / 2 - i[1]) * radius });
        }
        let iright = intersectRayArc(pos, dir, rightCenter, radius, to_friendly, to_opponent);
        for (let i of iright) {
            intersections.push({ pos: i[0], l1: (Math.PI - i[1]) * radius + arcway + lineway });
        }
        let defenseLineOnpoint = new vector_1.Vector(0, -G.FieldHeightHalf + radius).mul(oppfac);
        let [lineIntersection, l1, l2] = geom.intersectLineLine(pos, dir, defenseLineOnpoint, new vector_1.Vector(1, 0));
        if (lineIntersection && l1 >= 0 && Math.abs(l2) <= G.DefenseStretchHalf) {
            intersections.push({ pos: lineIntersection, l1: l2 + totalway / 2 });
        }
        return [intersections, totalway];
    }
    function intersectionsRayDefenseArea_2017Wrapper(pos, dir, extraDistance = 0, friendly = false) {
        return intersectionsRayDefenseArea_2017(pos, dir, extraDistance, friendly)[0];
    }
    function intersectRayDefenseArea_2017(pos, dir, extraDistance, friendly, invertedPos = false) {
        let [intersections, totalway] = intersectionsRayDefenseArea_2017(pos, dir, extraDistance, friendly);
        let minDistance = invertedPos ? 0 : Infinity;
        let minIntersection = undefined;
        let minWay = totalway / 2;
        for (let i of intersections) {
            let dist = pos.distanceTo(i.pos);
            if (dist < minDistance !== invertedPos) {
                minDistance = dist;
                minIntersection = i.pos;
                minWay = i.l1;
            }
        }
        return [minIntersection, minWay];
    }
    if (World.RULEVERSION === "2018") {
        exports.intersectRayDefenseArea = intersectDefenseArea_2018;
        exports.intersectionsRayDefenseArea = intersectionsRayDefenseArea_2018;
    }
    else {
        exports.intersectRayDefenseArea = intersectRayDefenseArea_2017;
        exports.intersectionsRayDefenseArea = intersectionsRayDefenseArea_2017Wrapper;
    }
    function cornerPointsBetweenWays2018(way1, way2, radius = 0, friendly) {
        let smallerWay = Math.min(way1, way2);
        let largerWay = Math.max(way1, way2);
        let cornerLeftWay = G.DefenseHeight + Math.PI * radius / 4;
        let cornerRightWay = G.DefenseHeight + G.DefenseWidth + 3 * Math.PI * radius / 4;
        let result = [];
        if (smallerWay <= cornerLeftWay && largerWay >= cornerLeftWay) {
            let cornerLeft = new vector_1.Vector(-G.DefenseWidthHalf, -G.FieldHeightHalf + G.DefenseHeight).add(new vector_1.Vector(-1, 1).withLength(radius));
            if (!friendly) {
                cornerLeft = cornerLeft.unm();
            }
            result.push(cornerLeft);
        }
        if (smallerWay <= cornerRightWay && largerWay >= cornerRightWay) {
            let cornerRight = new vector_1.Vector(G.DefenseWidthHalf, -G.FieldHeightHalf + G.DefenseHeight).add(new vector_1.Vector(1, 1).withLength(radius));
            if (!friendly) {
                cornerRight = cornerRight.unm();
            }
            result.push(cornerRight);
        }
        if (result.length === 2 && way1 > way2) {
            let temp = result[0];
            result[0] = result[1];
            result[1] = temp;
        }
        return result;
    }
    function cornerPointsBetweenWays2017() {
        return [];
    }
    if (World.RULEVERSION === "2018") {
        exports.cornerPointsBetweenWays = cornerPointsBetweenWays2018;
    }
    else {
        exports.cornerPointsBetweenWays = cornerPointsBetweenWays2017;
    }
    function maxWay2018(radius) {
        return G.DefenseHeight * 2 + G.DefenseWidth + Math.PI * radius;
    }
    function maxWay2017(radius) {
        return G.DefenseStretch + Math.PI * (radius + G.DefenseRadius);
    }
    if (World.RULEVERSION === "2018") {
        exports.maxWay = maxWay2018;
    }
    else {
        exports.maxWay = maxWay2017;
    }
    function allowedLineSegments(pos, dir, maxLength = Infinity) {
        let direction = dir.normalized();
        let [pos1, lambda1] = geom.intersectLineLine(pos, direction, new vector_1.Vector(G.FieldWidthHalf, 0), new vector_1.Vector(0, 1));
        let [pos2, lambda2] = geom.intersectLineLine(pos, direction, new vector_1.Vector(-G.FieldWidthHalf, 0), new vector_1.Vector(0, 1));
        let [pos3, lambda3] = geom.intersectLineLine(pos, direction, new vector_1.Vector(0, G.FieldHeightHalf), new vector_1.Vector(1, 0));
        let [pos4, lambda4] = geom.intersectLineLine(pos, direction, new vector_1.Vector(0, -G.FieldHeightHalf), new vector_1.Vector(1, 0));
        let lambdas = [];
        let fieldLambdas = [lambda1, lambda2, lambda3, lambda4];
        let fieldPos = [pos1, pos2, pos3, pos4];
        for (let i = 0; i < fieldLambdas.length; i++) {
            let lambda = fieldLambdas[i];
            if (lambda != undefined) {
                if (lambda > maxLength) {
                    lambda = maxLength;
                }
                if (isInField(fieldPos[i], 0.05) && lambda > 0) {
                    lambdas.push(lambda);
                }
            }
        }
        let intersectionsOwn = (0, exports.intersectionsRayDefenseArea)(pos, direction, 0, true);
        let intersectionsOpp = (0, exports.intersectionsRayDefenseArea)(pos, direction, 0, false);
        intersectionsOwn = intersectionsOwn.concat(intersectionsOpp);
        for (let intersection of intersectionsOwn) {
            let lambda = pos.distanceTo(intersection.pos);
            if (lambda > maxLength) {
                lambda = maxLength;
            }
            if (isInField(intersection.pos, 0.05) && lambda > 0) {
                lambdas.push(lambda);
            }
        }
        if (isInAllowedField(pos, 0)) {
            lambdas.push(0);
        }
        lambdas.sort((a, b) => a - b);
        let result = [];
        for (let i = 0; i < Math.floor(lambdas.length / 2); i++) {
            let p1 = pos.add(direction.mul(lambdas[i * 2]));
            let p2 = pos.add(direction.mul(lambdas[i * 2 + 1]));
            if (p1.distanceTo(p2) > 0) {
                result.push([p1, p2]);
            }
        }
        return result;
    }
    exports.allowedLineSegments = allowedLineSegments;
    function defenseIntersectionByWay_2017(way, extraDistance = 0, friendly) {
        let radius = G.DefenseRadius + extraDistance;
        if (radius < 0) {
            throw new Error(`extraDistance must not be smaller thhan -G.DefenseRadius: ${extraDistance}`);
        }
        let arcway = radius * Math.PI / 2;
        let lineway = G.DefenseStretch;
        let totalway = 2 * arcway + lineway;
        if (way < 0) {
            way = -way;
        }
        if (way > totalway) {
            way = 2 * totalway - way;
        }
        if (way < 0) {
            throw new Error(`way is out of bounds (${way}, ${extraDistance}, ${friendly})`);
        }
        let intersection;
        if (way < arcway) {
            let angle = way / radius;
            intersection = vector_1.Vector.fromPolar(-angle, radius).add(new vector_1.Vector(G.DefenseStretchHalf, G.FieldHeightHalf));
        }
        else if (way <= arcway + lineway) {
            intersection = new vector_1.Vector(-way + arcway + G.DefenseStretchHalf, G.FieldHeightHalf - radius);
        }
        else {
            let angle = (way - arcway - lineway) / radius;
            intersection = vector_1.Vector.fromPolar(-Math.PI / 2 - angle, radius).add(new vector_1.Vector(-G.DefenseStretchHalf, G.FieldHeightHalf));
        }
        if (friendly) {
            intersection = intersection.unm();
        }
        return intersection;
    }
    if (World.RULEVERSION === "2018") {
        exports.defenseIntersectionByWay = defenseIntersectionByWay_2018;
    }
    else {
        exports.defenseIntersectionByWay = defenseIntersectionByWay_2017;
    }
    function intersectCircleDefenseArea_2017(pos, radius, extraDistance, friendly) {
        if (friendly) {
            pos = pos.mul(-1);
        }
        let leftCenter = new vector_1.Vector(-G.DefenseStretchHalf, G.FieldHeightHalf);
        let rightCenter = new vector_1.Vector(G.DefenseStretchHalf, G.FieldHeightHalf);
        let defenseRadius = G.DefenseRadius + extraDistance;
        let intersections = [];
        let [li1, li2] = geom.intersectCircleCircle(leftCenter, defenseRadius, pos, radius);
        let [ri1, ri2] = geom.intersectCircleCircle(rightCenter, defenseRadius, pos, radius);
        if (li1 && li1.x < G.DefenseStretchHalf && li1.y < G.FieldHeightHalf) {
            intersections.push(li1);
        }
        if (li2 && li2.x < G.DefenseStretchHalf && li2.y < G.FieldHeightHalf) {
            intersections.push(li2);
        }
        if (ri1 && ri1.x > G.DefenseStretchHalf && ri1.y < G.FieldHeightHalf) {
            intersections.push(ri1);
        }
        if (ri2 && ri2.x > G.DefenseStretchHalf && ri2.y < G.FieldHeightHalf) {
            intersections.push(ri2);
        }
        let [mi1, mi2] = geom.intersectLineCircle(new vector_1.Vector(0, G.FieldHeightHalf - defenseRadius), new vector_1.Vector(1, 0), pos, radius);
        if (mi1 && Math.abs(mi1.x) <= G.DefenseStretchHalf) {
            intersections.push(mi1);
        }
        if (mi2 && Math.abs(mi2.x) <= G.DefenseStretchHalf) {
            intersections.push(mi2);
        }
        if (friendly) {
            for (let i = 0; i < intersections.length; i++) {
                intersections[i] = intersections[i].mul(-1);
            }
        }
        return intersections;
    }
    function intersectCircleDefenseArea_2018(pos, radius, extraDistance, friendly) {
        if (!isInDefenseArea_2018(pos, radius + extraDistance, friendly)) {
            return [];
        }
        let corners = [];
        corners[0] = new vector_1.Vector(G.DefenseWidthHalf, G.FieldHeightHalf);
        corners[1] = new vector_1.Vector(G.DefenseWidthHalf, G.FieldHeightHalf - G.DefenseHeight);
        corners[2] = new vector_1.Vector(-G.DefenseWidthHalf, G.FieldHeightHalf - G.DefenseHeight);
        corners[3] = new vector_1.Vector(-G.DefenseWidthHalf, G.FieldHeightHalf);
        corners[4] = new vector_1.Vector(corners[0].x + extraDistance, corners[0].y);
        corners[5] = new vector_1.Vector(corners[1].x, corners[1].y - extraDistance);
        corners[6] = new vector_1.Vector(corners[2].x - extraDistance, corners[2].y);
        corners[7] = new vector_1.Vector(corners[3].x, corners[3].y + extraDistance);
        if (friendly) {
            pos = pos.mul(-1);
        }
        let intersections = [];
        let ci1, ci2;
        let zero = new vector_1.Vector(0, 0);
        let li1, li2, lambda1, lambda2;
        let dirPrev = corners[0].sub(corners[3]);
        for (let i = 0; i < 3; i++) {
            let dir = corners[i + 1].sub(corners[i]);
            if (i > 0 && i < 2) {
                [ci1, ci2] = geom.intersectCircleCircle(zero, extraDistance, pos.sub(corners[i]), radius);
                if (ci1 && ci1.insideSector(dirPrev, dir.unm())) {
                    intersections.push(ci1.add(corners[i]));
                }
                if (ci2 && ci2.insideSector(dirPrev, dir.unm())) {
                    intersections.push(ci2.add(corners[i]));
                }
            }
            dirPrev = dir;
            [li1, li2, lambda1, lambda2] = geom.intersectLineCircle(corners[i + 4], dir, pos, radius);
            if (lambda1 != undefined && lambda1 >= 0 && lambda1 * lambda1 < dir.lengthSq()) {
                intersections.push(li1);
            }
            if (lambda2 != undefined && lambda2 >= 0 && lambda2 * lambda2 < dir.lengthSq()) {
                intersections.push(li2);
            }
        }
        if (friendly) {
            for (let i = 0; i < intersections.length; i++) {
                intersections[i] = intersections[i].mul(-1);
            }
        }
        return intersections;
    }
    if (World.RULEVERSION === "2018") {
        exports.intersectCircleDefenseArea = intersectCircleDefenseArea_2018;
    }
    else {
        exports.intersectCircleDefenseArea = intersectCircleDefenseArea_2017;
    }
    function distanceToFriendlyGoalLine(pos, radius) {
        if (Math.abs(pos.x) < G.GoalWidth / 2) {
            return Math.max(G.FieldHeightHalf + pos.y - radius, 0);
        }
        let goalpost = new vector_1.Vector(pos.x > 0 ? G.GoalWidth / 2 : -G.GoalWidth / 2, -G.FieldHeightHalf);
        return goalpost.distanceTo(pos) - radius;
    }
    exports.distanceToFriendlyGoalLine = distanceToFriendlyGoalLine;
    function isInOwnCorner(pos, opp) {
        let oppfac = opp ? 1 : -1;
        let a = (G.FieldWidthHalf - Math.abs(pos.x));
        let b = (oppfac * G.FieldHeightHalf - pos.y);
        return a * a + b * b < 1;
    }
    exports.isInOwnCorner = isInOwnCorner;
    function nextLineCut(startPos, dir, offset = 0) {
        if (dir.x === 0 && dir.y === 0) {
            return undefined;
        }
        let width = new vector_1.Vector((dir.x > 0 ? 1 : -1) * (G.FieldWidthHalf + offset), 0);
        let height = new vector_1.Vector(0, (dir.y > 0 ? 1 : -1) * (G.FieldHeightHalf + offset));
        let [sideCut, sideLambda] = geom.intersectLineLine(startPos, dir, width, height);
        let [frontCut, frontLambda] = geom.intersectLineLine(startPos, dir, height, width);
        if (sideCut) {
            if (frontCut) {
                if (sideLambda < frontLambda) {
                    return sideCut;
                }
                else {
                    return frontCut;
                }
            }
            else {
                return sideCut;
            }
        }
        else {
            return frontCut;
        }
    }
    exports.nextLineCut = nextLineCut;
    function nextAllowedFieldLineCut(startPos, dir, extraDistance) {
        let normalizedDir = dir.normalized();
        let perpendicularDir = normalizedDir.perpendicular();
        let boundaryLineCut = nextLineCut(startPos, normalizedDir, -extraDistance);
        let [friendlyDefenseLineCut] = (0, exports.intersectRayDefenseArea)(startPos, normalizedDir, extraDistance, false);
        let [opponentDefenseLineCut] = (0, exports.intersectRayDefenseArea)(startPos, normalizedDir, extraDistance, true);
        let lineCuts = [];
        if (boundaryLineCut != undefined) {
            lineCuts.push(boundaryLineCut);
        }
        if (friendlyDefenseLineCut != undefined) {
            lineCuts.push(friendlyDefenseLineCut);
        }
        if (opponentDefenseLineCut != undefined) {
            lineCuts.push(opponentDefenseLineCut);
        }
        let minLambda = Infinity;
        let minLineCut = undefined;
        for (let lineCut of lineCuts) {
            let [_, lambda] = geom.intersectLineLine(startPos, normalizedDir, lineCut, perpendicularDir);
            if (lambda != undefined && lambda > 0 && lambda < minLambda) {
                minLambda = lambda;
                minLineCut = lineCut;
            }
        }
        if (minLineCut == undefined) {
            return [];
        }
        return [minLineCut, minLambda];
    }
    exports.nextAllowedFieldLineCut = nextAllowedFieldLineCut;
    function isInFriendlyGoal(pos) {
        return geom.insideRect(G.FriendlyGoalLeft.sub(new vector_1.Vector(0, G.GoalDepth)), G.FriendlyGoalRight, pos);
    }
    exports.isInFriendlyGoal = isInFriendlyGoal;
    function isInOpponentGoal(pos) {
        return geom.insideRect(G.OpponentGoalRight.add(new vector_1.Vector(0, G.GoalDepth)), G.OpponentGoalLeft, pos);
    }
    exports.isInOpponentGoal = isInOpponentGoal;
    function defenseBaselineIntersectionDistance_2017() {
        return World.Geometry.DefenseRadius + (World.Geometry.DefenseStretch / 2);
    }
    function defenseBaselineIntersectionDistance_2018() {
        return World.Geometry.DefenseWidth / 2;
    }
    if (World.RULEVERSION === "2018") {
        exports.defenseBaselineIntersectionDistance = defenseBaselineIntersectionDistance_2018;
    }
    else {
        exports.defenseBaselineIntersectionDistance = defenseBaselineIntersectionDistance_2017;
    }
});
//# sourceMappingURL=field.js.map