import { Vector } from "base/vector";
import { MoveTo } from "stp_vibes/skills/moveto";
import { FriendlyRobot } from "base/robot";


export class Fivethreetwo {

    robots : FriendlyRobot[];

    constructor(robots : FriendlyRobot[]) {
        this.robots = robots;
    }

    run() {
        for (let robot of this.robots) {
            amun.log(robot.id);
            if (robot.id == 0) {
                new MoveTo(robot).run(new Vector(0, -5.7), 0);
            }
            else if (robot.id == 1) {
                new MoveTo(robot).run(new Vector(1.33, -3.3), 0);
            }
            else if (robot.id == 2) {
                new MoveTo(robot).run(new Vector(0, -3.3), 0);
            }
            else if (robot.id == 3) {
                new MoveTo(robot).run(new Vector(-1.330, -3.3), 0);
            }
            else if (robot.id == 4) {
                new MoveTo(robot).run(new Vector(2.2, -2.1), 0);
            }
            else if (robot.id == 5) {
                new MoveTo(robot).run(new Vector(-2.2, -2.1), 0);
            }
            else if (robot.id == 6) {
                new MoveTo(robot).run(new Vector(0.0, -1.3), 0);
            }
            else if (robot.id == 7) {
                new MoveTo(robot).run(new Vector(-1.6, -1.3), 0);
            }
            else if (robot.id == 8) {
                new MoveTo(robot).run(new Vector(1.6, -1.3), 0);
            }
            else if (robot.id == 9) {
                new MoveTo(robot).run(new Vector(-0.2, -0.1), 0);
            }
            else if (robot.id == 10) {
                new MoveTo(robot).run(new Vector(0.4, -0.4), 0);
            }
        }
    }
}