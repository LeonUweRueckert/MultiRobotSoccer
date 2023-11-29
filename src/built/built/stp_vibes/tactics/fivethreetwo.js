define(["require", "exports", "stp_vibes/skills/moveto", "base/vector"], function (require, exports, moveto_1, vector_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Fivethreetwo = void 0;
    class Fivethreetwo {
        constructor(robots) {
            this.robots = robots;
        }
        run() {
            for (let robot of this.robots) {
                amun.log(robot.id);
                if (robot.id == 0) {
                    new moveto_1.MoveTo(robot).run(new vector_1.Vector(0, -5.7), 0);
                }
                else if (robot.id == 1) {
                    new moveto_1.MoveTo(robot).run(new vector_1.Vector(1.33, -3.3), 0);
                }
                else if (robot.id == 2) {
                    new moveto_1.MoveTo(robot).run(new vector_1.Vector(0, -3.3), 0);
                }
                else if (robot.id == 3) {
                    new moveto_1.MoveTo(robot).run(new vector_1.Vector(-1.330, -3.3), 0);
                }
                else if (robot.id == 4) {
                    new moveto_1.MoveTo(robot).run(new vector_1.Vector(2.2, -2.1), 0);
                }
                else if (robot.id == 5) {
                    new moveto_1.MoveTo(robot).run(new vector_1.Vector(-2.2, -2.1), 0);
                }
                else if (robot.id == 6) {
                    new moveto_1.MoveTo(robot).run(new vector_1.Vector(0.0, -1.3), 0);
                }
                else if (robot.id == 7) {
                    new moveto_1.MoveTo(robot).run(new vector_1.Vector(-1.6, -1.3), 0);
                }
                else if (robot.id == 8) {
                    new moveto_1.MoveTo(robot).run(new vector_1.Vector(1.6, -1.3), 0);
                }
                else if (robot.id == 9) {
                    new moveto_1.MoveTo(robot).run(new vector_1.Vector(-0.2, -0.1), 0);
                }
                else if (robot.id == 10) {
                    new moveto_1.MoveTo(robot).run(new vector_1.Vector(0.4, -0.4), 0);
                }
            }
        }
    }
    exports.Fivethreetwo = Fivethreetwo;
});
//# sourceMappingURL=fivethreetwo.js.map