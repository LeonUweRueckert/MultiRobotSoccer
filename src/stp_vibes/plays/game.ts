import { FriendlyRobot } from "base/robot";
import { Vector } from "base/vector";
import * as World from "base/world";
import { AttackerManager } from "stp_vibes/tactics/attackerManager";
import { DefenderManager } from "stp_vibes/tactics/defenderManager";
import { Keeper } from "stp_vibes/tactics/keeper";
import { Wingman } from "stp_vibes/tactics/wingman";

export class Game {

	private attackerManager = new AttackerManager;
	private defenderManager = new DefenderManager;

	private managerResetCounter = 0;

	constructor() {

	}

	run() {
		//reset the managers regularly for more realistic play
		if(this.managerResetCounter++ == 1000) {
			this.defenderManager = new DefenderManager();
			this.attackerManager = new AttackerManager();
		}

		//specify the numbers of robots to assign per position
		let numAttackers = World.Ball.pos.y < 0 ? 1 : 3;
		let numDefenders = World.Ball.pos.y < 0 ? 3 : 1;
		//rest of the robots are assigned as wingmen

		let attackers: FriendlyRobot[] = new Array;
		let defenders: FriendlyRobot[] = new Array;
		let wingmen: FriendlyRobot[] = new Array;
		let keeper: FriendlyRobot[] = new Array;
		
		let robots: FriendlyRobot[] = World.FriendlyRobots;
		for(let robot of robots) {
			if(World.FriendlyKeeper == robot) {
				new Keeper(robot).run();
			} else
			if(attackers.length < numAttackers) {
				attackers[attackers.length] = robot;
			} else
			if(defenders.length < numDefenders) {
				defenders[defenders.length] = robot;
			} else {
				new Wingman(robot).run();
			}
		}
		
		this.defenderManager.run(defenders);
		this.attackerManager.run(attackers);
	}
}