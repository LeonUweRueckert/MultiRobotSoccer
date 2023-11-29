define(["require", "exports", "base/coordinates", "base/vector", "base/vis"], function (require, exports, coordinates_1, vector_1, vis) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Trajectory = exports.TrajectoryHandler = void 0;
    class TrajectoryHandler {
        constructor(robot) {
            this._robot = robot;
        }
    }
    exports.TrajectoryHandler = TrajectoryHandler;
    class Trajectory {
        constructor(robot) {
            this._robot = robot;
        }
        update(handlerType, ...args) {
            if (this._handler == undefined || !(this._handler instanceof handlerType) || !this._handler.canHandle(...args)) {
                this._handler = new handlerType(this._robot);
                if (!this._handler) {
                    throw new Error("Malformed trajectory handler constructor!");
                }
            }
            let [splines, moveDest, moveTime] = this._handler.update(...args);
            let splin;
            if (splines.spline != undefined) {
                splin = splines.spline[0];
            }
            if (splin != undefined) {
                let xCalc = splin.x.a0 + splin.x.a1 * moveTime + splin.x.a2 * moveTime / 2;
                let yCalc = splin.y.a0 + splin.y.a1 * moveTime + splin.y.a2 * moveTime / 2;
                this._robot.prevMoveTo = coordinates_1.Coordinates.toLocal(new vector_1.Vector(xCalc, yCalc));
            }
            else {
                this._robot.prevMoveTo = undefined;
            }
            this._robot.setControllerInput(splines);
            if (this._robot.pos) {
                vis.addPath("MoveTo", [this._robot.pos, moveDest], vis.colors.whiteHalf);
                vis.addCircle("MoveTo", moveDest, this._robot.radius, vis.colors.yellowHalf, true);
            }
            return [moveDest, moveTime];
        }
    }
    exports.Trajectory = Trajectory;
});
//# sourceMappingURL=trajectory.js.map