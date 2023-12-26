import { FriendlyRobot } from "base/robot";
import * as World from "base/world";
import { MoveTo } from "stp_vibes/skills/moveto";
import { Vector } from "base/vector";

/**
 * makes the robot shoot the ball.
 * if he's not in the right position, he will take aim first.
 * doesn't save any state.
 */
export class shootBall {

	private robot: FriendlyRobot;
    private accuracy = 0.01;
    private sideOffset = 0.5;
    private rearOffset = 0.3;

	constructor(robot: FriendlyRobot) {
		this.robot = robot;
	}

	pass(target: Vector) {
        let passStrength = this.calculatePassStrength(this.robot.pos, target);
        this.shoot(target, passStrength);
	}

    shoot(target: Vector, strength: number) {

        let ballPosition = World.Ball.pos;

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


        if(this.robot.hasBall(World.Ball)) {
            this.robot.shoot(strength);
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
        
    }

    /**
     * calculates an appropriate shot speed for passing the ball a teammate
     */
    private calculatePassStrength(playerPosition: Vector, targetPosition: Vector): number {
        let maxShotStrength = 6.1; //6.1 m/s
        let fullStrengthDistance = 10; //shoot at max strength if distance = fullstrengthDistance
        let distance = playerPosition.distanceTo(targetPosition);
        return maxShotStrength * (distance / fullStrengthDistance);
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