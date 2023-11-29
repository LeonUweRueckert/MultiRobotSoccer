import * as World from "base/world";
import { ShootAtGoal } from "stp_vibes/skills/shootAtGoal";


//makes all robots on the team try to shoot the ball straight into the opponent's goal using ShootAtGoal
export class AllChasers {

	constructor() {

	}

	run() {
		World.FriendlyRobots.forEach((robot, index, robots) => {
			new ShootAtGoal(robot).run();
		})
	}
}
