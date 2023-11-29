import { FriendlyRobot } from "base/robot";
import { Vector } from "base/vector";
import {MoveTo} from "built/built/stp_vibes/skills/moveto";

export class Formation_4_3_3 {
	private robots: FriendlyRobot[];

	constructor(robots: FriendlyRobot[]) {
		this.robots = robots;
	}

	public run() {
        let positions:Vector[] = [
            new Vector(1, 1),
            new Vector()
        ]
		for (let robot of this.robots) {
			
		}
	}
}