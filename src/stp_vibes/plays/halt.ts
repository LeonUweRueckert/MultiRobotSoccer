import * as World from "base/world";
import { Playstub } from "stp_vibes/plays/playstub";

export class Halt extends Playstub{
    
    constructor(){
        super();
    }

    run(){
        amun.log("Halt Play");
        for (let robot of World.FriendlyRobots) {
            if (robot.moveCommand == undefined) {
                robot.setStandby(true);
                robot.halt();
            }
        }
    }
}