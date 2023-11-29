import { Vector } from "base/vector";
import * as World from "base/world";
import {MoveTo} from "stp_vibes/skills/moveto";

export class MoveCenter {
    constructor() {
    }
    run() {
        new MoveTo(World.FriendlyRobotsById[2]).run(new Vector(0,0), 0);
    }
}

