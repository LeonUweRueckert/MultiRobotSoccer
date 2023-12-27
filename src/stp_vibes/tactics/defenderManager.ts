import { FriendlyRobot } from "base/robot";
import * as World from "base/world";
import { MoveTo } from "built/built/stp_vibes/skills/moveto";
import { Vector } from "base/vector";
import { ShootBall } from "stp_vibes/skills/shootBall";
import { Random } from "base/random";
import { ShootBallAway } from "stp_vibes/skills/shootBallAway";
import { FollowBall } from "stp_vibes/skills/followBall";


/**
 * splits up (most of) the friendly half of the pitch for the assigned robots.
 * the robots will stay in their part of the pitch.
 * if the ball comes close to one of the robots, it will shoot/chip it away in the direction
 * of the opponent's goal.
 * keep the ordering of the robots that are passed in consistent.
 *
 * does save state, so make sure to accomodate!
 * ideally the state would be reset every couple seconds for more realistic behaviour
 */
export class DefenderManager {
    private defenders: Defender[] = [];

	private instatiate(robots: FriendlyRobot[]) {
        //each defender gets a horizontal slice of the pitch
        let keepOutX = 0.5;
        let keepOutY = 1;
        let totalMaxX = World.Geometry.FieldWidthHalf - keepOutX;
        let totalMinX = - totalMaxX;
        let totalMaxY = - keepOutY;
        let totalMinY = - World.Geometry.FieldHeightHalf - keepOutY;


        let deltaX = Math.abs(totalMaxX - totalMinX); //total Defenderfield width
        this.defenders = [];
        for (let i = 0; i < robots.length; i++) {
            let specificMaxX = (deltaX) / robots.length * (i + 1) - (World.Geometry.FieldWidthHalf - keepOutX);
            let specificMinX = (deltaX) / robots.length * i - (World.Geometry.FieldWidthHalf - keepOutX);
            amun.log(specificMinX + " " + specificMaxX)
            this.defenders.push(new Defender(specificMinX, specificMaxX, totalMinY, totalMaxY));
		}
	}

	public run(robots: FriendlyRobot[]) {
        if(!Array.isArray(this.defenders) || this.defenders === undefined || this.defenders.length != robots.length){
            this.instatiate(robots);
        } 
        for(let i = 0; i < robots.length; i++) {
            this.defenders[i].run(robots, i);
        }
	}
}

class Defender {

    private followingFactor = 0.35; //determines how much the robot will follow the ball outside his area
    private minX: number;
    private maxX: number;
    private minY: number;
    private maxY: number;

    constructor(minX: number, maxX: number, minY: number, maxY: number) {
        this.minX = minX;
        this.maxX = maxX;
        this.minY = minY;
        this.maxY = maxY;
	}

	public run(allDefenders: FriendlyRobot[], indexOfDefender: number) {
        let robot = allDefenders[indexOfDefender];    

        let isCloseToBall = World.Ball.pos.distanceTo(robot.pos) < this.followingFactor;
        let isBallInBounds = World.Ball.pos.x < this.maxX && World.Ball.pos.x > this.minX && World.Ball.pos.y < this.maxY && World.Ball.pos.y > this.minY

        if(isCloseToBall && isBallInBounds) {
            new ShootBallAway(robot).run();
            
        } else if(isBallInBounds) {
            new FollowBall(robot).run();
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