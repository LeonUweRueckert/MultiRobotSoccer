import { FriendlyRobot } from "base/robot";
import { Vector } from "base/vector";
import * as World from "base/world";
import { MoveTo } from "stp_vibes/skills/moveto";


/**
 * makes the robot move behind the ball, so that he is in line with the ball and the opponent's goal in the end.
 * if he is between the ball and the goal, the robot will move to a spot next to the ball
 */
export class MoveBehindBall {

	private robot: FriendlyRobot;

	constructor(robot: FriendlyRobot) {
		this.robot = robot;
	}

	run(target: Vector) {
        const move = new MoveTo(this.robot);

        let ballPosition = World.Ball.pos;
        let playerPosition = this.robot.pos;

        let ballToTarget: Vector = target.sub(ballPosition);
        let playerToTarget: Vector = target.sub(this.robot.pos);

        //this is the position the robot tries to move to.
        //it's in line with both the ball and the goal.
        let aimingPosition = ballPosition.sub(ballToTarget.normalized().mul(0.3));


        let offsetVector = ballToTarget.normalized().perpendicular().mul(0.5);
        let rightOfBall: Vector = ballPosition.add(offsetVector);
        let leftOfBall: Vector = ballPosition.sub(offsetVector);
        //evasionPoint is the point next to the ball to move to when in front of the ball.
        //this point lies on the line perpendicular to the line between ball and goal.
        let evasionPoint = playerPosition.distanceTo(rightOfBall) < playerPosition.distanceTo(leftOfBall) ? rightOfBall : leftOfBall;

        if(ballToTarget.length() - playerToTarget.length() > 0) { //if the player is closer to the goal than the ball, he must be in front of it
            move.run(evasionPoint, ballToTarget.angle());
        } else {
            move.run(aimingPosition, ballToTarget.angle());
        }

	}
}