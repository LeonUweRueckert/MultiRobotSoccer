import * as World from "base/world";
import { AllFollowBall } from "stp_vibes/tactics/allFollowBall";

export class Game {

	constructor() {

	}

	run() {
    	amun.log("Game Play loop");
		new AllFollowBall(World.FriendlyRobots).run();
	}
}