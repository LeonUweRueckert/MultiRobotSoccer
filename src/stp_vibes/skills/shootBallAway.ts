import { FriendlyRobot } from "base/robot";
import * as World from "base/world";
import { MoveTo } from "stp_vibes/skills/moveto";
import { Vector } from "base/vector";

/**
 * makes the robot shoot/chip the ball in the direction of the opponent's goal.
 * if he's not in the right position, he will take aim first.
 * doesn't save any state.
 */
export class ShootBallAway {

	private robot: FriendlyRobot;
    private accuracy = 0.01;
    private sideOffset = 0.5;
    private rearOffset = 0.3;

	constructor(robot: FriendlyRobot) {
		this.robot = robot;
	}

    /**
     * Shoot/chip the ball in the direction of the opponent's goal
     * @returns True if the ball was shot, false if the bot repositioned
     */
    run() : boolean {

        let ballPosition = World.Ball.pos;
        
        let target : Vector = World.Geometry.OpponentGoal;

        let targetToBallVector: Vector = target.sub(World.Ball.pos);
        let playerToBallVector = this.robot.pos.sub(ballPosition);
        
        let aimingPosition = ballPosition.sub(targetToBallVector.normalized().mul(this.rearOffset)); //position behind the ball as seen from the target
        
        let targetToPlayerVector: Vector = target.sub(this.robot.pos);
        let targetToAimingPositionVector: Vector = target.sub(aimingPosition);
        let isInFrontOfBall = targetToBallVector.length() - targetToPlayerVector.length() > 0; //if the player is closer to the goal than the ball, he must be in front
        let isInFrontOfAimingPosition = targetToAimingPositionVector.length() - targetToPlayerVector.length() > 0; //if the player is closer to the goal than the ball, he must be in front

        let besideBallPosition = this.calculateBesidePosition(ballPosition, target); //Position to move to if in front of ball
        let besideAimingPosition = this.calculateBesidePosition(aimingPosition, target); //Position to move to if in front of ball

        let isAimedAtTarget = targetToBallVector.absoluteAngleDiff(targetToPlayerVector) < this.accuracy;
        
        let moveTo = new MoveTo(this.robot);

        let shot = false;
        if(this.robot.hasBall(World.Ball)) {
            if(Math.random() > 0.5){
                //this.robot.shoot(10);
            }else{
                
            }   
            this.robot.chip(Math.random() * 10);     
            shot = true;
        }

        if(isInFrontOfBall) {
            //move beside ball
            moveTo.run(besideBallPosition, playerToBallVector.mul(-1).angle());
        } else if(!isInFrontOfBall && isInFrontOfAimingPosition) {
            if(isAimedAtTarget) {
                //shoot
                moveTo.run(ballPosition, playerToBallVector.mul(-1).angle());
            } else {
                //move beside aimingPosition
                moveTo.run(besideAimingPosition, playerToBallVector.mul(-1).angle());
            }
        } else if(!isInFrontOfAimingPosition && isAimedAtTarget) {
            //shoot
            moveTo.run(ballPosition, playerToBallVector.mul(-1).angle());
        } else {
            //move to aimingPosition
            moveTo.run(aimingPosition, playerToBallVector.mul(-1).angle());
        }
        return shot;
    }

    /**
     * returns a position to the left or right of the supplied position when viewed from a target
     */
    private calculateBesidePosition(position: Vector, target: Vector) {
        let offsetVector = target.sub(position).normalized().perpendicular().mul(this.sideOffset);
        let rightSidePosition: Vector = position.add(offsetVector);
        let leftSidePosition: Vector = position.sub(offsetVector);

        //if besidePosition is out of bounds, use other side
        //if(Math.abs(leftSidePosition.x) > World.Geometry.FieldWidth || Math.abs(leftSidePosition.y) > World.Geometry.FieldHeight) leftSidePosition = rightSidePosition;
        //if(Math.abs(rightSidePosition.x) > World.Geometry.FieldWidth || Math.abs(rightSidePosition.y) > World.Geometry.FieldHeight) rightSidePosition = leftSidePosition;

        return this.robot.pos.distanceTo(rightSidePosition) < this.robot.pos.distanceTo(leftSidePosition) ? rightSidePosition : leftSidePosition; //Position to move to if in front of ball
    }
}