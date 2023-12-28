import { FriendlyRobot } from "base/robot";
import { Vector } from "base/vector";
import * as World from "base/world";
import { MoveTo } from "stp_vibes/skills/moveto";
import { ShootBall } from "stp_vibes/skills/shootBall";
import { ShootBallAway } from "stp_vibes/skills/shootBallAway";


/**
 * Makes the supplied robot behave as Goalie.
 * Make sure to pass in the robot, whose id matches the one set as Goalie in the Sim.
 * The robot will move between the ball and the goal, but always stay close to the goal.
 */
export class Keeper {
	private robot: FriendlyRobot;

	constructor(robot: FriendlyRobot) {
		this.robot = robot;
	}

    /**
     * If the ball is close to the goal, move to the ball.
     * If the ball is close to the goal and stationary, shoot it away.
     * Else move on the goalline according to the ball's x coordiante.
     */
	run() {
		let goalBallDistance = World.Geometry.FriendlyGoal.distanceTo(World.Ball.pos);
        if(goalBallDistance < 1) {
            if(this.robot.hasBall(World.Ball)) {
                this.robot.chip(5);
            } else {
                let goalPosition = World.Geometry.FriendlyGoal;
                let ballPosition = World.Ball.pos;
                let ballToOwnGoal : Vector = goalPosition.sub(ballPosition);
                new MoveTo(this.robot).run(World.Ball.pos, ballToOwnGoal.mul(-1).angle());
            }
        } else if(goalBallDistance < 2 && Math.abs(World.Ball.speed.x) <= 0.05 && Math.abs(World.Ball.speed.y) <= 0.05){
            new ShootBall(this.robot).shoot(World.Geometry.OpponentGoal, 5, true);
        } else {
            let ballx = World.Ball.pos.x;
            let goalPostXOffset = Math.abs(World.Geometry.FriendlyGoalRight.x - 0.2);
            let goaliePosition = new Vector(ballx, World.Geometry.FriendlyGoal.y);
            if(ballx > goalPostXOffset) {
                goaliePosition = new Vector(goalPostXOffset, World.Geometry.FriendlyGoal.y);
            } else if (ballx < -goalPostXOffset) {
                goaliePosition = new Vector(-goalPostXOffset, World.Geometry.FriendlyGoal.y);
            }
            new MoveTo(this.robot).run(goaliePosition, World.Geometry.OpponentGoal.angle());
        }
	}
}
