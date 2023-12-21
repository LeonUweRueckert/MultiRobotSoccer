import { FriendlyRobot } from "base/robot";
import * as World from "base/world";
import { MoveTo } from "stp_vibes/skills/moveto";
import { Vector } from "base/vector";
import { MoveBehindBall } from "stp_vibes/skills/moveBehindBall";

/**
 * makes the robot always try to shoot the ball straight at the opponent's goal.
 * moves behind the ball using moveBehindBall, and if he is in line with the ball and the goal goes to the ball and shoots it if he can.
 */
export class ShootAtGoal {

    private accuracy = 0.4;

	private robot: FriendlyRobot;
	constructor(robot: FriendlyRobot) {
		this.robot = robot;
	}

	run() {

        let goalPosition = World.Geometry.OpponentGoal;
        let ballPosition = World.Ball.pos;
        let ballToGoal : Vector = goalPosition.sub(ballPosition);
        let ballToPlayer : Vector = ballPosition.sub(this.robot.pos);
        let playerToGoal : Vector = goalPosition.sub(this.robot.pos);

        let isInLineWithGoal = ballToGoal.absoluteAngleDiff(ballToPlayer) < this.accuracy;

        if(!isInLineWithGoal) { //take aim
            new MoveBehindBall(this.robot).run(World.Geometry.OpponentGoal);
        } else { //try to shoot
            if(this.robot.hasBall(World.Ball)) {
                this.robot.shoot(10);
            }
            new MoveTo(this.robot).run(ballPosition, ballToPlayer.angle());
        }
	}
}