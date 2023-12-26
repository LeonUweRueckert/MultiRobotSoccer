import { FriendlyRobot } from "base/robot";
import { Vector } from "base/vector";
import * as World from "base/world";
import { FollowBall } from "stp_vibes/skills/followBall";
import { MoveTo } from "stp_vibes/skills/moveto";
import { ShootAtGoal } from "stp_vibes/skills/shootAtGoal";
import { ShootMiddle } from "stp_vibes/skills/shootMiddle";
import { Playstub } from "stp_vibes/plays/playstub";
import { ShootBall } from "stp_vibes/skills/shootBall";
import { AttackerManager } from "stp_vibes/tactics/attackerManager";

/**
 * makes the robot behave according to it's position:
 * 	defender: will stand stationary in a line close to the FriendylGoal
 * 	attacker: will stand stationary in a line close to the middle line
 * 	blocker: will try to move between the ball and the FriendlyGoal
 * 	chaser: will try to shoot the ball into the opponent's goal
 * 	keeper: stands in the center of his goal until a ball enters his penalty area, then moves towards the ball
 */
export class Game extends Playstub {

	static attackerManager : AttackerManager = new AttackerManager();

	constructor() {
		super();
	}

	run() {
		amun.log("simplegame");
		//specify the number of robots per position here
		let robots = World.FriendlyRobotsAll;
		let defensePlayerCount = 3;
		let hasKeeper = World.FriendlyKeeper != undefined;
		let chasersCount = 1;
		let blockerCount = 1;
		let wingmanCount = 0;
		if(World.Ball.pos.y > World.Geometry.FieldHeightQuarter){
			wingmanCount = 1;
		}
		let attackerCount = robots.length - defensePlayerCount - chasersCount - (hasKeeper ? 1 : 0) - blockerCount - wingmanCount;

		//counters to keep track of assigning the next robot the correct role
		let numDefenders = 0;
		let numChasers = 0;
		let numBlockers = 0;
		let numAttackers = 0;
		let numWingman = 0;
		let counts = attackerCount + blockerCount + chasersCount + defensePlayerCount + (hasKeeper ? 1 : 0);
		for(let robot of robots) {
			
			let lookAtBallorientation = World.Ball.pos.sub(robot.pos).angle();
			let standardOrientation = World.Geometry.OpponentGoal.angle();

			const skill = new MoveTo(robot);

			if(robot == World.FriendlyKeeper) { //keeper
				
				let goalBallDistance = World.Geometry.FriendlyGoal.distanceTo(World.Ball.pos);
				if(goalBallDistance < 1) {
					let goalPosition = World.Geometry.FriendlyGoal;
					let ballPosition = World.Ball.pos;
					let ballToOwnGoal : Vector = goalPosition.sub(ballPosition);
					skill.run(World.Ball.pos, ballToOwnGoal.mul(-1).angle());
				} else {
					skill.run(World.Geometry.FriendlyGoal, standardOrientation);
				}

			} else {
				if(numDefenders < defensePlayerCount) { //defense

					let x = - World.Geometry.FieldWidthHalf + World.Geometry.FieldWidth / defensePlayerCount * numDefenders + World.Geometry.FieldWidth / (defensePlayerCount*2);
					let y = - World.Geometry.FieldHeightQuarter;
					skill.run(new Vector(x,y), standardOrientation);
					numDefenders++;

				// } else if(numChasers < chasersCount) { //chasers
				// 	//this.makeChaser(robot);	
				// 	numChasers++;

				} else if(numBlockers < blockerCount) { //blockers

					//move between friendly goal and ball
					let goalPosition = World.Geometry.FriendlyGoal;
					let ballPosition = World.Ball.pos;
					let ballToOwnGoal : Vector = goalPosition.sub(ballPosition);
					skill.run(ballPosition.add(ballToOwnGoal.normalized()), standardOrientation);
					numBlockers++;
				} else if(numWingman < wingmanCount){
					this.makeWingman(robot);
					numWingman++;			   
				}
				// } else if(numAttackers < attackerCount){ //attackers

				// 	let x = - World.Geometry.FieldWidthHalf + World.Geometry.FieldWidth / attackerCount * numAttackers + World.Geometry.FieldWidth / (attackerCount*2);
				// 	let y = - 0.5;
				// 	skill.run(new Vector(x,y), standardOrientation);
				// 	numAttackers++;

			}
			
		}

		Game.attackerManager.run(robots.slice(robots.length - attackerCount));
	}

	private makeWingman(robot: FriendlyRobot){
		let ballPosition = World.Ball.pos;
		if(Math.abs(ballPosition.x) < World.Geometry.FieldWidthQuarter){
			//Wait
			return;
		}
		//Pass the Ball in front of enemy goal
		let middle : Vector = new Vector(0, World.Geometry.FieldHeightQuarter);
		let skill = new ShootBall(robot);
		skill.pass(middle);

	}

	private makeChaser(robot: FriendlyRobot){
		let ballPosition = World.Ball.pos;
		if(Math.abs(ballPosition.x) > World.Geometry.FieldWidthQuarter && World.Ball.pos.y > World.Geometry.FieldHeightQuarter){
			//Wait for pass from Wingman
			let middle : Vector = new Vector(0, World.Geometry.FieldHeightQuarter);
			new MoveTo(robot).run(middle, World.Geometry.OpponentGoal.angle());
			return;
		}
		//Try to shoot at goal
		new ShootAtGoal(robot).run();
	}
}
