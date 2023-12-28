import * as World from "base/world";
import { Game } from "stp_vibes/plays/game";
import { Halt } from "stp_vibes/plays/halt";
import { Playstub } from "./plays/playstub";

//import { Play } from "stp_vibes/plays/playstub"

let currentPlay : Playstub = new Game();

function redecide_play(): boolean {
	// Decide if you want to change your current play
	return false;
}

export function main() {
	if (redecide_play()) {
		switch (World.RefereeState) {
			// Decide on play based on referee and world state
			case "Game":{
				currentPlay = new Game();
				break;
			}		
			case "Halt":{
				currentPlay = new Halt();
				break;
			}	
		}
	}
	currentPlay.run();
}
