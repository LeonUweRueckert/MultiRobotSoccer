import { FriendlyRobot } from "base/robot";
import {FollowBall} from "stp_vibes/skills/followBall";

export class AllFollowBall {
	private robots: FriendlyRobot[];

	constructor(robots: FriendlyRobot[]) {
		this.robots = robots;
	}

	public run() {
		for (let robot of this.robots) {
			new FollowBall(robot).run();
		}
	}
}