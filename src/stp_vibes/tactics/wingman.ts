import { FriendlyRobot } from "base/robot";
import { CurvedMaxAccel } from "base/trajectory/curvedmaxaccel";
import { setDefaultObstaclesByTable, PathHelperParameters } from "base/trajectory/pathhelper";
import { Vector } from "base/vector";
import * as World from "base/world";
import { ShootBall } from "stp_vibes/skills/shootBall";


/**
 * Makes the supplied robot behave as Wingman that passes the ball towards the center of the pitch.
 */
export class Wingman {
	private robot: FriendlyRobot;

	constructor(robot: FriendlyRobot) {
		this.robot = robot;
	}

	run() {
		let ballPosition = World.Ball.pos;
		if(Math.abs(ballPosition.x) < World.Geometry.FieldWidthQuarter){
			//Wait
			return;
		}
		//Pass the Ball in front of enemy goal
		let middle : Vector = new Vector(0, World.Geometry.FieldHeightQuarter);
		new ShootBall(this.robot).pass(middle);
	}
}
