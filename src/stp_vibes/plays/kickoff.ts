import { Fivethreetwo } from "stp_vibes/tactics/fivethreetwo";
import * as World from "base/world";

class KickOff {
    tactic;

    constructor() {
        this.tactic = new Fivethreetwo(World.FriendlyRobots);
    }
    run() {
        this.tactic.run();
    }
}