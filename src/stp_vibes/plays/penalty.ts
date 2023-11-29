import {MoveTo} from "built/built/stp_vibes/skills/moveto";
import * as World from "base/world";
import { Vector } from "base/vector";


export class Penalty{
    constructor(){

    }

    run(){
        amun.log(World.Ball.pos);
        if(World.FriendlyRobotsById[2].pos.y < -0.15){
            new MoveTo(World.FriendlyRobotsById[2]).run(new Vector(0.0,0.0), 1.57);
            World.FriendlyRobotsById[2].shootDisable();
        }

        if(World.FriendlyRobotsById[2].pos.y >= -0.15){
            World.FriendlyRobotsById[2].setDribblerSpeed(1.57);
        }
    }
}