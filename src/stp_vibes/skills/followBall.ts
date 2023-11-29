import * as World from "base/world";
import { FriendlyRobot } from "base/robot";
import {MoveTo} from "stp_vibes/skills/moveto";
import { Vector } from "base/vector";

export class FollowBall {

	private robot: FriendlyRobot;
	constructor(robot: FriendlyRobot) {
		this.robot = robot;
	}

	run() {
        new MoveTo(this.robot).run(World.Ball.pos, 0);
    }
}