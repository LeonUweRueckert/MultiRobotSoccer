import * as World from "base/world";
import { FriendlyRobot } from "base/robot";
import {MoveTo} from "stp_vibes/skills/moveto";
import { Vector } from "base/vector";
import { MoveBehindBall } from "stp_vibes/skills/moveBehindBall";

export class ShootMiddle {

    private accuracy = 0.4;

	private robot: FriendlyRobot;
	constructor(robot: FriendlyRobot) {
		this.robot = robot;
	}

	run() {
        let ballPosition = World.Ball.pos;
        let middle : Vector = new Vector(0, World.Geometry.FieldHeightQuarter);
        let ballToMiddle : Vector = middle.sub(ballPosition);
        let ballToPlayer : Vector = ballPosition.sub(this.robot.pos);

        let isInLineWithMiddle = ballToMiddle.absoluteAngleDiff(ballToPlayer) < this.accuracy;
        amun.log(ballToMiddle.absoluteAngleDiff(ballToPlayer))
        if(!isInLineWithMiddle) { //take aim         
            amun.log("Positioning") 
            new MoveBehindBall(this.robot).run(middle);
        } else { //try to shoot
            amun.log("Shooting")
            if(this.robot.hasBall(World.Ball)) {
                this.robot.shoot(2);
            }
            new MoveTo(this.robot).run(ballPosition, ballToPlayer.angle());
        }
    }
}