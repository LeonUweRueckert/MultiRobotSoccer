import "base/base";
import "base/entrypoints";
import * as debug from "base/debug";
import * as plot from "base/plot";
import * as World from "base/world";
import * as EntryPoints from "base/entrypoints";
import { log } from "base/amun";
import { main as gametrainer } from "stp_vibes/gameTrainer";
import { main as simplegametrainer } from "stp_vibes/simpleGameTrainer";

function game(): boolean {
	amun.log("Main Loop")

	gametrainer()

	return true;
}

EntryPoints.add("Game", game);

function simpleGame(): boolean {
	amun.log("Main Loop")

	simplegametrainer()

	return true;
}

EntryPoints.add("SimpleGame", simpleGame);

function wrapper(func: () => boolean): () => void {
	function f() {
		World.update();

		func();

		// Call this function to pass robot commands set during the strategy run back to amun
		World.setRobotCommands();
		// Clear the debug tree. Otherwise old output would pile up
		debug.resetStack();
		plot._plotAggregated();
	}
	return f;
}

export let scriptInfo = { name: "Game Strategy", entrypoints: EntryPoints.get(wrapper) }
