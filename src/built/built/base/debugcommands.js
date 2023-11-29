define(["require", "exports", "base/coordinates", "base/protobuf", "base/world"], function (require, exports, coordinates_1, pb, World) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.moveObjects = exports.sendRefereeCommand = void 0;
    let amunLocal = amun;
    const stageNames = {
        FirstHalfPre: pb.SSL_Referee.Stage.NORMAL_FIRST_HALF_PRE,
        FirstHalf: pb.SSL_Referee.Stage.NORMAL_FIRST_HALF,
        HalfTime: pb.SSL_Referee.Stage.NORMAL_HALF_TIME,
        SecondHalfPre: pb.SSL_Referee.Stage.NORMAL_SECOND_HALF_PRE,
        SecondHalf: pb.SSL_Referee.Stage.NORMAL_SECOND_HALF,
        ExtraTimeBreak: pb.SSL_Referee.Stage.EXTRA_TIME_BREAK,
        ExtraFirstHalfPre: pb.SSL_Referee.Stage.EXTRA_FIRST_HALF_PRE,
        ExtraFirstHalf: pb.SSL_Referee.Stage.EXTRA_FIRST_HALF,
        ExtraHalfTime: pb.SSL_Referee.Stage.EXTRA_HALF_TIME,
        ExtraSecondHalfPre: pb.SSL_Referee.Stage.EXTRA_SECOND_HALF_PRE,
        ExtraSecondHalf: pb.SSL_Referee.Stage.EXTRA_SECOND_HALF,
        PenaltyShootoutBreak: pb.SSL_Referee.Stage.PENALTY_SHOOTOUT_BREAK,
        PenaltyShootout: pb.SSL_Referee.Stage.PENALTY_SHOOTOUT,
        PostGame: pb.SSL_Referee.Stage.POST_GAME,
    };
    const commandNames = {
        Start: pb.SSL_Referee.Command.NORMAL_START,
        Halt: pb.SSL_Referee.Command.HALT,
        Stop: pb.SSL_Referee.Command.STOP,
        GameForce: pb.SSL_Referee.Command.FORCE_START,
        KickoffYellowPrepare: pb.SSL_Referee.Command.PREPARE_KICKOFF_YELLOW,
        KickoffBluePrepare: pb.SSL_Referee.Command.PREPARE_KICKOFF_BLUE,
        PenaltyYellowPrepare: pb.SSL_Referee.Command.PREPARE_PENALTY_YELLOW,
        PenaltyBluePrepare: pb.SSL_Referee.Command.PREPARE_PENALTY_BLUE,
        DirectYellow: pb.SSL_Referee.Command.DIRECT_FREE_YELLOW,
        DirectBlue: pb.SSL_Referee.Command.DIRECT_FREE_BLUE,
        IndirectYellow: pb.SSL_Referee.Command.INDIRECT_FREE_YELLOW,
        IndirectBlue: pb.SSL_Referee.Command.INDIRECT_FREE_BLUE,
        TimeoutYellow: pb.SSL_Referee.Command.TIMEOUT_YELLOW,
        TimeoutBlue: pb.SSL_Referee.Command.TIMEOUT_BLUE,
        BallPlacementBlue: pb.SSL_Referee.Command.BALL_PLACEMENT_BLUE,
        BallPlacementYellow: pb.SSL_Referee.Command.BALL_PLACEMENT_YELLOW,
    };
    function sendRefereeCommand(refereeCommand, gameStage, blueKeeperID, yellowKeeperID, pos) {
        if (amunLocal.isDebug === false) {
            throw new Error("only works in debug mode");
        }
        let origState = World._getFullRefereeState();
        if (origState === undefined) {
            throw new Error("Musn't be called before World.update(), that is outside of Entrypoints");
        }
        let state = {
            stage: origState.stage,
            packet_timestamp: 0, command_timestamp: 0,
            stage_time_left: origState.stage_time_left,
            command_counter: 0,
            blue: origState.blue, yellow: origState.yellow,
            command: undefined,
            designated_position: undefined
        };
        if (gameStage != undefined) {
            state.stage = stageNames[gameStage];
            if (state.stage == undefined) {
                throw new Error(`Invalid game stage name: ${gameStage}`);
            }
        }
        if (refereeCommand != undefined) {
            let command;
            if (World.TeamIsBlue) {
                command = refereeCommand
                    .replace("Offensive", "Blue")
                    .replace("Defensive", "Yellow");
            }
            else {
                command = refereeCommand
                    .replace("Offensive", "Yellow")
                    .replace("Defensive", "Blue");
            }
            state.command = commandNames[command];
            if (state.command == undefined) {
                throw new Error(`Invalid referee command name: ${refereeCommand}`);
            }
            state.command_counter = 1;
        }
        if (blueKeeperID != undefined) {
            state.blue.goalie = blueKeeperID;
        }
        if (yellowKeeperID != undefined) {
            state.yellow.goalie = yellowKeeperID;
        }
        if (pos != undefined) {
            pos = pos.mul(1000);
            pos = coordinates_1.Coordinates.toGlobal(pos);
            state.designated_position = { x: pos.x, y: pos.y };
        }
        amunLocal.sendRefereeCommand(state);
    }
    exports.sendRefereeCommand = sendRefereeCommand;
    function moveObjects(ball, friendlyRobots, opponentRobots) {
        if (!amun.isDebug) {
            throw new Error("only works in debug mode");
        }
        if (World.WorldStateSource() !== pb.world.WorldSource.INTERNAL_SIMULATION) {
            throw new Error("This can only be used in the internal simulator!");
        }
        let simCommand = { teleport_ball: {} };
        if (ball != undefined) {
            if (ball.pos == undefined || ball.speed == undefined) {
                throw new Error("ball parameter missing");
            }
            let pos = coordinates_1.Coordinates.toVision(ball.pos);
            let speed = coordinates_1.Coordinates.toVision(ball.speed);
            simCommand.teleport_ball = {
                x: pos.x, y: pos.y, z: ball.posZ || 0,
                vx: speed.x, vy: speed.y, vz: ball.speedZ || 0
            };
        }
        let friendly;
        let opponent;
        if (World.TeamIsBlue) {
            friendly = pb.gameController.Team.BLUE;
            opponent = pb.gameController.Team.YELLOW;
        }
        else {
            friendly = pb.gameController.Team.YELLOW;
            opponent = pb.gameController.Team.BLUE;
        }
        let createTeleportCommandsForRobots = (robots, team) => robots.map((robot) => {
            if (robot.id == undefined || robot.pos == undefined || robot.speed == undefined || robot.dir == undefined || robot.angularSpeed == undefined) {
                throw new Error("robot parameter missing");
            }
            let pos = coordinates_1.Coordinates.toVision(robot.pos);
            let speed = coordinates_1.Coordinates.toVision(robot.speed);
            return {
                id: { id: robot.id, team: team },
                x: pos.x, y: pos.y, orientation: coordinates_1.Coordinates.toVision(robot.dir),
                v_x: speed.x, v_y: speed.y, v_angular: robot.angularSpeed
            };
        });
        simCommand.teleport_robot = [];
        if (friendlyRobots != undefined) {
            simCommand.teleport_robot = simCommand.teleport_robot.concat(createTeleportCommandsForRobots(friendlyRobots, friendly));
        }
        if (opponentRobots != undefined) {
            simCommand.teleport_robot = simCommand.teleport_robot.concat(createTeleportCommandsForRobots(opponentRobots, opponent));
        }
        amun.sendCommand({ simulator: { ssl_control: simCommand }, tracking: { reset: true } });
    }
    exports.moveObjects = moveObjects;
});
//# sourceMappingURL=debugcommands.js.map