import { FriendlyRobot } from "base/robot";
import * as World from "base/world";
import { MoveTo } from "built/built/stp_vibes/skills/moveto";
import { Vector } from "base/vector";
import { ShootBall } from "stp_vibes/skills/shootBall";


/**
 * splits up (most of) the opponents half of the pitch for the assigned robots.
 * the robots will stay in their part of the pitch.
 * some will shoot at the goal, some will pass the ball to another attacker.
 * keep the ordering of the robots that are passed in consistent.
 *
 * does save state, so make sure to accomodate!
 * ideally the state would be reset every couple seconds for more realistic behaviour
 */
export class AttackerManager {
    private attackers: Attacker[] = [];

	private instatiate(robots: FriendlyRobot[]) {
        //each attacker gets a horizontal slice of the pitch
        let keepOutX = 0.5;
        let keepOutY = 1;
        let totalMaxX = World.Geometry.FieldWidthHalf - keepOutX;
        let totalMinX = - totalMaxX;
        let totalMaxY = World.Geometry.FieldHeightHalf - keepOutY;
        let totalMinY = - keepOutY;

        let deltaX = Math.abs(totalMaxX - totalMinX); //total Attackerfield width
        this.attackers = [];
        for (let i = 0; i < robots.length; i++) {
            let specificMaxX = (deltaX) / robots.length * (i + 1) - (World.Geometry.FieldWidthHalf - keepOutX);
            let specificMinX = (deltaX) / robots.length * i - (World.Geometry.FieldWidthHalf - keepOutX);
            this.attackers.push(new Attacker(specificMinX, specificMaxX, totalMinY, totalMaxY));
		}
	}

	public run(robots: FriendlyRobot[]) {
        if(!Array.isArray(this.attackers) || this.attackers === undefined || this.attackers.length != robots.length){
            this.instatiate(robots);
        } 
        for(let i = 0; i < robots.length; i++) {
            this.attackers[i].run(robots, i);
        }
	}
}

class Attacker {

    private followingFactor = 0.35; //determines how much the robot will follow the ball outside his area
    private minX: number;
    private maxX: number;
    private minY: number;
    private maxY: number;
    private attackerState: AttackerState;
    private passToIndex: number = -1;

    constructor(minX: number, maxX: number, minY: number, maxY: number) {
        this.minX = minX;
        this.maxX = maxX;
        this.minY = minY;
        this.maxY = maxY;
        this.attackerState = AttackerState.shoot;
	}

	public run(allAttackers: FriendlyRobot[], indexOfAttacker: number) {
        let robot = allAttackers[indexOfAttacker];
        if(this.passToIndex == -1) {
            if(allAttackers.length > 1) {               
                while(this.passToIndex == -1) {
                    let index = Math.round(Math.random()) * (allAttackers.length - 1);
                    if(indexOfAttacker != index) this.passToIndex = index; 
                }
            } else {
                this.passToIndex = 0;
            }
        }
       

        let isCloseToBall = World.Ball.pos.distanceTo(robot.pos) < this.followingFactor;
        let isBallInBounds = World.Ball.pos.x < this.maxX && World.Ball.pos.x > this.minX && World.Ball.pos.y < this.maxY && World.Ball.pos.y > this.minY

        if(isCloseToBall || isBallInBounds) {
            amun.log(this.attackerState)
            //shoot / pass
            switch(this.attackerState) {
                 // changes attackerState when the bot shot/passed the ball
                case AttackerState.pass:                   
                    if(new ShootBall(robot).pass(allAttackers[this.passToIndex].pos)){
                        this.attackerState = AttackerState.shoot;
                    } 
                    break;
                case AttackerState.shoot: 
                    if(new ShootBall(robot).shoot(World.Geometry.OpponentGoal, 10)){
                        this.attackerState = AttackerState.pass;
                    } 
                    break;
            }
        } else {
            //move to position in bounds TODO improve
            let centerPoint = new Vector((this.maxX + this.minX) / 2, (this.maxY - Math.abs(this.minY)) / 2);
            let angleToGoal = World.Geometry.OpponentGoal.sub(robot.pos).angle;
            new MoveTo(robot).run(centerPoint, 0);
        }
	}
}

enum AttackerState {
    pass,
    shoot
}