define(["require", "exports", "base/coordinates", "base/vector", "base/world"], function (require, exports, coordinates_1, vector_1, World) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.addFieldVisualization = exports.addPathRaw = exports.addPath = exports.addPizza = exports.addAxisAlignedRectangle = exports.addPolygonRaw = exports.addPolygon = exports.addCircleRaw = exports.addCircle = exports.setColor = exports.colors = exports.fromHSVA = exports.fromTemperature = exports.fromRGBA = exports.Color = void 0;
    let amunLocal = amun;
    class Color {
        constructor(r, g, b, a) {
            this.red = r, this.green = g, this.blue = b, this.alpha = a;
        }
        setAlpha(a) {
            return new Color(this.red, this.green, this.blue, a);
        }
    }
    exports.Color = Color;
    function fromRGBA(red, green, blue, alpha) {
        return new Color(red, green, blue, alpha);
    }
    exports.fromRGBA = fromRGBA;
    function fromTemperature(value, alpha = 127) {
        if (value < 0) {
            throw new Error(`vis temperature too low: ${value}`);
        }
        if (value > 1) {
            throw new Error(`vis temperature too high: ${value}`);
        }
        let red = 1;
        let green = 1;
        if (value < 0.5) {
            red = 2 * value;
        }
        else {
            green = 2 - 2 * value;
        }
        return new Color(255 * red, 255 * green, 0, alpha);
    }
    exports.fromTemperature = fromTemperature;
    function fromHSVA(hue, saturation, value, alpha = 127) {
        let c = value * saturation;
        let x = c * (1 - Math.abs((hue * 6) % 2 - 1));
        let m = value - c;
        let r, g, b;
        r = c;
        g = x;
        b = 0;
        if (hue * 6 > 1) {
            r = x;
            g = c;
            b = 0;
        }
        if (hue * 6 > 2) {
            r = 0;
            g = c;
            b = x;
        }
        if (hue * 6 > 3) {
            r = 0;
            g = x;
            b = c;
        }
        if (hue * 6 > 4) {
            r = x;
            g = 0;
            b = c;
        }
        if (hue * 6 > 5) {
            r = c;
            g = 0;
            b = x;
        }
        return fromRGBA((r + m) * 255, (g + m) * 255, (b + m) * 255, alpha);
    }
    exports.fromHSVA = fromHSVA;
    exports.colors = {
        black: fromRGBA(0, 0, 0, 255),
        blackHalf: fromRGBA(0, 0, 0, 127),
        white: fromRGBA(255, 255, 255, 255),
        whiteHalf: fromRGBA(255, 255, 255, 127),
        whiteQuarter: fromRGBA(255, 255, 255, 64),
        grey: fromRGBA(127, 127, 127, 255),
        greyHalf: fromRGBA(127, 127, 127, 127),
        red: fromRGBA(255, 0, 0, 255),
        redHalf: fromRGBA(255, 0, 0, 127),
        green: fromRGBA(0, 255, 0, 255),
        greenHalf: fromRGBA(0, 255, 0, 127),
        blue: fromRGBA(0, 0, 255, 255),
        blueHalf: fromRGBA(0, 0, 255, 127),
        yellow: fromRGBA(255, 255, 0, 255),
        yellowHalf: fromRGBA(255, 255, 0, 127),
        pink: fromRGBA(255, 0, 255, 255),
        pinkHalf: fromRGBA(255, 0, 255, 127),
        cyan: fromRGBA(0, 255, 255, 255),
        cyanHalf: fromRGBA(0, 255, 255, 127),
        orange: fromRGBA(255, 127, 0, 255),
        orangeHalf: fromRGBA(255, 127, 0, 127),
        magenta: fromRGBA(255, 0, 127, 255),
        magentaHalf: fromRGBA(255, 0, 127, 127),
        brown: fromRGBA(127, 63, 0, 255),
        brownHalf: fromRGBA(127, 63, 0, 127),
        skyBlue: fromRGBA(127, 191, 255, 255),
        skyBlueHalf: fromRGBA(127, 191, 255, 127),
        slate: fromRGBA(112, 118, 144, 255),
        slateHalf: fromRGBA(112, 118, 144, 127),
        orchid: fromRGBA(218, 94, 224, 255),
        orchidHalf: fromRGBA(218, 94, 224, 127),
        gold: fromRGBA(239, 185, 15, 255),
        goldHalf: fromRGBA(239, 185, 15, 127),
        mediumPurple: fromRGBA(171, 130, 255, 255),
        mediumPurpleHalf: fromRGBA(171, 130, 255, 127),
        darkPurple: fromRGBA(93, 71, 139, 255),
        darkPurpleHalf: fromRGBA(93, 71, 139, 127),
    };
    let gcolor = exports.colors.black;
    let gisFilled = true;
    function setColor(color, isFilled) {
        gcolor = color;
        gisFilled = isFilled;
    }
    exports.setColor = setColor;
    function addCircle(name, center, radius, color, isFilled, background, style, lineWidth) {
        addCircleRaw(name, coordinates_1.Coordinates.toGlobal(center), radius, color, isFilled, background, style, lineWidth);
    }
    exports.addCircle = addCircle;
    function addCircleRaw(name, center, radius, color, isFilled = false, background = false, style, lineWidth = 0.01) {
        if (color == undefined) {
            isFilled = gisFilled;
            color = gcolor;
        }
        if (style != undefined) {
            let brush;
            if (isFilled) {
                brush = color;
            }
            let t = {
                name: name, pen: { color: color, style: style },
                brush: brush, width: lineWidth,
                circle: { p_x: center.x, p_y: center.y, radius: radius },
                background: background
            };
            amunLocal.addVisualization(t);
        }
        else {
            amunLocal.addCircleSimple(name, center.x, center.y, radius, color.red, color.green, color.blue, color.alpha, isFilled, background, lineWidth);
        }
    }
    exports.addCircleRaw = addCircleRaw;
    function addPolygon(name, points, color, isFilled, background, style) {
        addPolygonRaw(name, coordinates_1.Coordinates.listToGlobal(points), color, isFilled, background, style);
    }
    exports.addPolygon = addPolygon;
    function addPolygonRaw(name, points, color, isFilled = false, background = false, style) {
        if (color == undefined) {
            isFilled = gisFilled;
            color = gcolor;
        }
        if (style != undefined) {
            let brush;
            if (isFilled) {
                brush = color;
            }
            amunLocal.addVisualization({
                name: name, pen: { color: color, style: style },
                brush: brush, width: 0.01,
                polygon: { point: points },
                background: background
            });
        }
        else {
            let pointArray = [];
            for (let pos of points) {
                pointArray.push(pos.x);
                pointArray.push(pos.y);
            }
            amunLocal.addPolygonSimple(name, color.red, color.green, color.blue, color.alpha, isFilled, background, pointArray);
        }
    }
    exports.addPolygonRaw = addPolygonRaw;
    function addAxisAlignedRectangle(name, corner1, corner2, color, isFilled, background, style) {
        let minX, minY, maxX, maxY;
        minX = Math.min(corner1.x, corner2.x);
        minY = Math.min(corner1.y, corner2.y);
        maxX = Math.max(corner1.x, corner2.x);
        maxY = Math.max(corner1.y, corner2.y);
        let path = [];
        path[0] = new vector_1.Vector(minX, minY);
        path[1] = new vector_1.Vector(minX, maxY);
        path[2] = new vector_1.Vector(maxX, maxY);
        path[3] = new vector_1.Vector(maxX, minY);
        addPolygon(name, path, color, isFilled, background, style);
    }
    exports.addAxisAlignedRectangle = addAxisAlignedRectangle;
    const N_CORNERS = 25;
    function addPizza(name, center, radius, startAngle, endAngle, color, isFilled, background, style) {
        let points = [center.add(vector_1.Vector.fromPolar(startAngle, radius)), center, center.add(vector_1.Vector.fromPolar(endAngle, radius))];
        if ((startAngle - endAngle) % (2 * Math.PI) < 2 * Math.PI / N_CORNERS) {
            addPolygon(name, points, color, isFilled, background, style);
        }
        else {
            let wStart = Math.ceil(N_CORNERS * endAngle / (2 * Math.PI));
            let wEnd = Math.floor(N_CORNERS * startAngle / (2 * Math.PI));
            if (wEnd < wStart) {
                wEnd = wEnd + N_CORNERS;
            }
            for (let w = wStart; w < wEnd; w++) {
                let angle = w * Math.PI * 2 / N_CORNERS;
                points.push(center.add(vector_1.Vector.fromPolar(angle, radius)));
            }
            addPolygon(name, points, color, isFilled, background, style);
        }
    }
    exports.addPizza = addPizza;
    function addPath(name, points, color, background, style, lineWidth) {
        addPathRaw(name, coordinates_1.Coordinates.listToGlobal(points), color, background, style, lineWidth);
    }
    exports.addPath = addPath;
    function addPathRaw(name, points, color = gcolor, background = false, style, lineWidth = 0.01) {
        if (style != undefined) {
            amunLocal.addVisualization({
                name: name, pen: { color: color, style: style },
                width: lineWidth,
                path: { point: points },
                background: background
            });
        }
        else {
            if (amun.SUPPORTS_EFFICIENT_PATHVIS) {
                let allData = new Float32Array(6 + 2 * points.length);
                allData[0] = color.red;
                allData[1] = color.green;
                allData[2] = color.blue;
                allData[3] = color.alpha;
                allData[4] = lineWidth;
                allData[5] = background ? 1 : 0;
                for (let i = 0; i < points.length; i++) {
                    allData[6 + i * 2] = points[i].x;
                    allData[6 + i * 2 + 1] = points[i].y;
                }
                amunLocal.addPathSimple(name, allData);
            }
            else {
                let pointArray = [];
                for (let pos of points) {
                    pointArray.push(pos.x);
                    pointArray.push(pos.y);
                }
                amunLocal.addPathSimple(name, color.red, color.green, color.blue, color.alpha, lineWidth, background, pointArray);
            }
        }
    }
    exports.addPathRaw = addPathRaw;
    function addFieldVisualization(name, f, pixelWidth, pixelHeight, drawCornerTL, drawCornerBR) {
        if (!drawCornerTL) {
            drawCornerTL = new vector_1.Vector(-World.Geometry.FieldWidthHalf - World.Geometry.BoundaryWidth, -World.Geometry.FieldHeightHalf - World.Geometry.BoundaryWidth);
        }
        else {
            drawCornerTL = coordinates_1.Coordinates.toGlobal(drawCornerTL);
        }
        if (!drawCornerBR) {
            drawCornerBR = new vector_1.Vector(World.Geometry.FieldWidthHalf + World.Geometry.BoundaryWidth, World.Geometry.FieldHeightHalf + World.Geometry.BoundaryWidth);
        }
        else {
            drawCornerBR = coordinates_1.Coordinates.toGlobal(drawCornerBR);
        }
        let data = new Uint8Array(pixelWidth * pixelHeight * 4);
        const fieldSize = drawCornerBR.sub(drawCornerTL);
        for (let y = 0; y < pixelHeight; y++) {
            for (let x = 0; x < pixelWidth; x++) {
                const pos = new vector_1.Vector((x + 0.5) / pixelWidth * fieldSize.x, (y + 0.5) / pixelHeight * fieldSize.y).add(drawCornerTL);
                const color = f(coordinates_1.Coordinates.toLocal(pos));
                const baseIndex = (y * pixelWidth + x) * 4;
                data.set([color.blue, color.green, color.red, color.alpha], baseIndex);
            }
        }
        amunLocal.addVisualization({ name: name, image: {
                width: pixelWidth,
                height: pixelHeight,
                data: data,
                draw_area: {
                    topleft: {
                        x: drawCornerTL.x,
                        y: drawCornerTL.y
                    },
                    bottomright: {
                        x: drawCornerBR.x,
                        y: drawCornerBR.y
                    }
                }
            } });
    }
    exports.addFieldVisualization = addFieldVisualization;
});
//# sourceMappingURL=vis.js.map