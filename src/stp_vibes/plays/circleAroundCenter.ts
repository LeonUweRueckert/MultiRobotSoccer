import { Vector } from "base/vector";
import * as World from "base/world";
import { MoveTo } from "stp_vibes/skills/moveto";

/**
 * makes all robots of the team stand in a circle around (0, 0)
 */
export class CircleAroundCenter {

	constructor() {

	}

	run() {
		World.FriendlyRobots.forEach((robot, index, robots) => {
            const play = new MoveTo(robot);
            const y = Math.sin(index / (robots.length) * Math.PI * 2);
            const x = Math.cos(index / (robots.length) * Math.PI * 2);
            play.run(new Vector(x,y),0);
        });
    }
}
