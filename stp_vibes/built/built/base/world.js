define(["require", "exports", "base/ball", "base/coordinates", "base/debug", "base/mathutil", "base/protobuf", "base/robot", "base/vector"], function (require, exports, ball_1, coordinates_1, debug, MathUtil, pb, robot_1, vector_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setRobotCommands = exports.haltOwnRobots = exports._updateUserInput = exports._getFullRefereeState = exports._updateWorld = exports.switchBallModelConstants = exports._updateRuleVersion = exports._updateTeam = exports.update = exports._init = exports.Geometry = exports.DIVISION = exports.RULEVERSION = exports.OpponentScore = exports.FriendlyScore = exports.MaxAllowedOpponentRobots = exports.MaxAllowedFriendlyRobots = exports.BallPlacementPos = exports.OpponentRedCards = exports.FriendlyRedCards = exports.OpponentYellowCards = exports.FriendlyYellowCards = exports.GameStage = exports.NextRefereeState = exports.RefereeState = exports.OpponentTeamName = exports.TeamName = exports.BallModel = exports.WorldStateSource = exports.SelectedOptions = exports.MixedTeam = exports.IsReplay = exports.IsLargeField = exports.TeamIsBlue = exports.Robots = exports.OpponentKeeper = exports.OpponentRobotsById = exports.OpponentRobots = exports.FriendlyKeeper = exports.FriendlyRobotsAll = exports.FriendlyRobotsById = exports.FriendlyInvisibleRobots = exports.FriendlyRobots = exports.Ball = exports.AoI = exports.TimeDiff = exports.Time = void 0;
    let amunLocal = amun;
    exports.Time = 0;
    exports.TimeDiff = 0;
    exports.AoI = undefined;
    exports.Ball = new ball_1.Ball();
    exports.FriendlyRobots = [];
    exports.FriendlyInvisibleRobots = [];
    exports.FriendlyRobotsById = {};
    exports.FriendlyRobotsAll = [];
    exports.OpponentRobots = [];
    exports.OpponentRobotsById = {};
    exports.Robots = [];
    exports.TeamIsBlue = false;
    exports.IsLargeField = false;
    exports.IsReplay = false;
    exports.MixedTeam = undefined;
    exports.SelectedOptions = undefined;
    let _WorldStateSource = undefined;
    function WorldStateSource() {
        if (_WorldStateSource === undefined) {
            throw new Error("WorldStateSource can not be accessed at load-time");
        }
        return _WorldStateSource;
    }
    exports.WorldStateSource = WorldStateSource;
    exports.BallModel = {};
    exports.TeamName = "";
    exports.OpponentTeamName = "";
    exports.RefereeState = "";
    exports.NextRefereeState = "";
    exports.GameStage = "";
    exports.FriendlyYellowCards = [];
    exports.OpponentYellowCards = [];
    exports.FriendlyRedCards = 0;
    exports.OpponentRedCards = 0;
    exports.MaxAllowedFriendlyRobots = 11;
    exports.MaxAllowedOpponentRobots = 11;
    exports.FriendlyScore = 0;
    exports.OpponentScore = 0;
    exports.RULEVERSION = "";
    exports.DIVISION = "";
    exports.Geometry = {};
    function _init() {
        exports.TeamIsBlue = amunLocal.isBlue();
        let geom = amunLocal.getGeometry();
        _updateGeometry(geom);
        _updateRuleVersion(geom);
        updateDivision(geom);
        _updateTeam(amunLocal.getTeam());
    }
    exports._init = _init;
    function update() {
        if (exports.SelectedOptions == undefined) {
        }
        let hasVisionData = _updateWorld(amunLocal.getWorldState());
        _updateGameState(amunLocal.getGameState());
        _updateUserInput(amunLocal.getUserInput());
        exports.IsReplay = amunLocal.isReplay ? amunLocal.isReplay() : false;
        return hasVisionData;
    }
    exports.update = update;
    function _updateTeam(state) {
        let friendlyRobotsById = {};
        let friendlyRobotsAll = [];
        for (let rdata of state.robot || []) {
            let robot = new robot_1.FriendlyRobot(rdata);
            friendlyRobotsById[rdata.id] = robot;
            friendlyRobotsAll.push(robot);
        }
        exports.FriendlyRobotsById = friendlyRobotsById;
        exports.FriendlyRobotsAll = friendlyRobotsAll;
    }
    exports._updateTeam = _updateTeam;
    function _updateRuleVersion(geom) {
        if (geom.type == undefined || geom.type === "TYPE_2014") {
            exports.RULEVERSION = "2017";
        }
        else {
            exports.RULEVERSION = "2018";
        }
    }
    exports._updateRuleVersion = _updateRuleVersion;
    function updateDivision(geom) {
        if (geom.division == undefined || geom.division === "A") {
            exports.DIVISION = "A";
        }
        else {
            exports.DIVISION = "B";
        }
    }
    let hasRaBallModel = false;
    function switchBallModelConstants(isSimulated) {
        if (isSimulated) {
            exports.BallModel.BallDeceleration = -0.35;
            exports.BallModel.FastBallDeceleration = -4.5;
            exports.BallModel.BallSwitchRatio = 0.69;
        }
        else {
            exports.BallModel.BallDeceleration = -0.343;
            exports.BallModel.FastBallDeceleration = -3.73375;
            exports.BallModel.BallSwitchRatio = 0.7;
        }
        exports.BallModel.FloorDampingZ = 0.55;
        exports.BallModel.FloorDampingXY = 1;
    }
    exports.switchBallModelConstants = switchBallModelConstants;
    function _updateGeometry(geom) {
        let wgeom = exports.Geometry;
        wgeom.FieldWidth = geom.field_width;
        wgeom.FieldWidthHalf = geom.field_width / 2;
        wgeom.FieldWidthQuarter = geom.field_width / 4;
        wgeom.FieldHeight = geom.field_height;
        wgeom.FieldHeightHalf = geom.field_height / 2;
        wgeom.FieldHeightQuarter = geom.field_height / 4;
        wgeom.GoalWidth = geom.goal_width;
        wgeom.GoalWallWidth = geom.goal_wall_width;
        wgeom.GoalDepth = geom.goal_depth;
        wgeom.GoalHeight = geom.goal_height;
        wgeom.LineWidth = geom.line_width;
        wgeom.CenterCircleRadius = geom.center_circle_radius;
        wgeom.FreeKickDefenseDist = geom.free_kick_from_defense_dist;
        wgeom.DefenseRadius = geom.defense_radius;
        wgeom.DefenseStretch = geom.defense_stretch;
        wgeom.DefenseStretchHalf = geom.defense_stretch / 2;
        wgeom.DefenseWidth = geom.defense_width != undefined ? geom.defense_width : geom.defense_stretch;
        wgeom.DefenseHeight = geom.defense_height != undefined ? geom.defense_height : geom.defense_radius;
        wgeom.DefenseWidthHalf = (geom.defense_width != undefined ? geom.defense_width : geom.defense_stretch) / 2;
        wgeom.FriendlyPenaltySpot = new vector_1.Vector(0, -wgeom.FieldHeightHalf + geom.penalty_spot_from_field_line_dist);
        wgeom.OpponentPenaltySpot = new vector_1.Vector(0, wgeom.FieldHeightHalf - geom.penalty_spot_from_field_line_dist);
        wgeom.PenaltyLine = wgeom.OpponentPenaltySpot.y - geom.penalty_line_from_spot_dist;
        wgeom.OwnPenaltyLine = wgeom.FriendlyPenaltySpot.y + geom.penalty_line_from_spot_dist;
        wgeom.FriendlyGoal = new vector_1.Vector(0, -wgeom.FieldHeightHalf);
        wgeom.FriendlyGoalLeft = new vector_1.Vector(-wgeom.GoalWidth / 2, wgeom.FriendlyGoal.y);
        wgeom.FriendlyGoalRight = new vector_1.Vector(wgeom.GoalWidth / 2, wgeom.FriendlyGoal.y);
        wgeom.OpponentGoal = new vector_1.Vector(0, wgeom.FieldHeightHalf);
        wgeom.OpponentGoalLeft = new vector_1.Vector(-wgeom.GoalWidth / 2, wgeom.OpponentGoal.y);
        wgeom.OpponentGoalRight = new vector_1.Vector(wgeom.GoalWidth / 2, wgeom.OpponentGoal.y);
        wgeom.BoundaryWidth = geom.boundary_width;
        exports.IsLargeField = wgeom.FieldWidth > 5 && wgeom.FieldHeight > 7;
        hasRaBallModel = geom.ball_model != undefined;
        if (geom.ball_model != undefined) {
            exports.BallModel.BallDeceleration = -geom.ball_model.slow_deceleration;
            exports.BallModel.FastBallDeceleration = -geom.ball_model.fast_deceleration;
            exports.BallModel.BallSwitchRatio = geom.ball_model.switch_ratio;
            exports.BallModel.FloorDampingXY = geom.ball_model.xy_damping;
            exports.BallModel.FloorDampingZ = geom.ball_model.z_damping;
        }
        else {
            switchBallModelConstants(false);
        }
    }
    function _updateWorld(state) {
        if (exports.Time != undefined) {
            exports.TimeDiff = state.time * 1E-9 - exports.Time;
        }
        else {
            exports.TimeDiff = 0;
        }
        exports.Time = state.time * 1E-9;
        MathUtil.randomseed(state.time);
        for (let robot of exports.FriendlyRobots) {
            robot.path.seedRandom(state.time);
        }
        if (exports.Time <= 0) {
            throw new Error("Invalid Time. Outdated ra version!");
        }
        const prevWorldSource = _WorldStateSource;
        if (state.world_source != undefined) {
            if (state.world_source !== _WorldStateSource) {
                _WorldStateSource = state.world_source;
            }
        }
        else if (state.is_simulated != undefined) {
            _WorldStateSource = state.is_simulated ? pb.world.WorldSource.INTERNAL_SIMULATION : pb.world.WorldSource.REAL_LIFE;
        }
        if (_WorldStateSource !== prevWorldSource && !hasRaBallModel) {
            switchBallModelConstants(_WorldStateSource !== pb.world.WorldSource.REAL_LIFE);
        }
        let radioResponses = state.radio_response || [];
        exports.Ball._update(state.ball, exports.Time, exports.Geometry, exports.Robots);
        let dataFriendly = exports.TeamIsBlue ? state.blue : state.yellow;
        if (dataFriendly) {
            let dataById = {};
            for (let rdata of dataFriendly) {
                dataById[rdata.id] = rdata;
            }
            exports.FriendlyRobots = [];
            exports.FriendlyInvisibleRobots = [];
            for (let robot of exports.FriendlyRobotsAll) {
                let robotResponses = [];
                for (let response of radioResponses) {
                    if (response.generation === robot.generation
                        && response.id === robot.id) {
                        robotResponses.push(response);
                    }
                }
                robot._update(dataById[robot.id], exports.Time, robotResponses);
                robot._updatePathBoundaries(exports.Geometry, exports.AoI);
                if (robot.isVisible) {
                    exports.FriendlyRobots.push(robot);
                }
                else {
                    exports.FriendlyInvisibleRobots.push(robot);
                }
            }
        }
        let dataOpponent = exports.TeamIsBlue ? state.yellow : state.blue;
        if (dataOpponent) {
            let opponentRobotsById = exports.OpponentRobotsById;
            exports.OpponentRobots = [];
            exports.OpponentRobotsById = {};
            for (let rdata of dataOpponent) {
                let robot = opponentRobotsById[rdata.id];
                delete opponentRobotsById[rdata.id];
                if (!robot) {
                    robot = new robot_1.Robot(rdata.id);
                }
                robot._updateOpponent(rdata, exports.Time);
                exports.OpponentRobots.push(robot);
                exports.OpponentRobotsById[rdata.id] = robot;
            }
            for (let robotId in opponentRobotsById) {
                opponentRobotsById[robotId]._updateOpponent(undefined, exports.Time);
            }
        }
        exports.Robots = exports.FriendlyRobots.slice();
        exports.Robots = exports.Robots.concat(exports.OpponentRobots);
        exports.MixedTeam = undefined;
        exports.AoI = state.tracking_aoi;
        return state.has_vision_data !== false;
    }
    exports._updateWorld = _updateWorld;
    let gameStageMapping = {
        NORMAL_FIRST_HALF_PRE: "FirstHalfPre",
        NORMAL_FIRST_HALF: "FirstHalf",
        NORMAL_HALF_TIME: "HalfTime",
        NORMAL_SECOND_HALF_PRE: "SecondHalfPre",
        NORMAL_SECOND_HALF: "SecondHalf",
        EXTRA_TIME_BREAK: "ExtraTimeBreak",
        EXTRA_FIRST_HALF_PRE: "ExtraFirstHalfPre",
        EXTRA_FIRST_HALF: "ExtraFirstHalf",
        EXTRA_HALF_TIME: "ExtraHalfTime",
        EXTRA_SECOND_HALF_PRE: "ExtraSecondHalfPre",
        EXTRA_SECOND_HALF: "ExtraSecondHalf",
        PENALTY_SHOOTOUT_BREAK: "PenaltyShootoutBreak",
        PENALTY_SHOOTOUT: "PenaltyShootout",
        POST_GAME: "PostGame"
    };
    let fullRefereeState = undefined;
    function _getFullRefereeState() {
        return fullRefereeState;
    }
    exports._getFullRefereeState = _getFullRefereeState;
    function _updateGameState(state) {
        fullRefereeState = state;
        const replaceWithTeamColor = (val) => {
            return exports.TeamIsBlue
                ? val.replace("Blue", "Offensive").replace("Yellow", "Defensive")
                : val.replace("Yellow", "Offensive").replace("Blue", "Defensive");
        };
        exports.RefereeState = replaceWithTeamColor(state.state);
        if (state.next_state) {
            exports.NextRefereeState = replaceWithTeamColor(state.next_state);
        }
        if (exports.RefereeState === "TimeoutOffensive" || exports.RefereeState === "TimeoutDefensive") {
            exports.RefereeState = "Halt";
        }
        if (state.designated_position && state.designated_position.x != undefined) {
            exports.BallPlacementPos = coordinates_1.Coordinates.toLocal(new vector_1.Vector(-state.designated_position.y / 1000, state.designated_position.x / 1000));
        }
        exports.GameStage = gameStageMapping[state.stage];
        let friendlyTeamInfo = exports.TeamIsBlue ? state.blue : state.yellow;
        let opponentTeamInfo = exports.TeamIsBlue ? state.yellow : state.blue;
        let friendlyKeeperId = friendlyTeamInfo.goalie;
        let opponentKeeperId = opponentTeamInfo.goalie;
        let friendlyKeeper = exports.FriendlyRobotsById[friendlyKeeperId];
        if (friendlyKeeper && !friendlyKeeper.isVisible) {
            friendlyKeeper = undefined;
        }
        debug.set("opponent keeper ID", opponentKeeperId);
        let opponentKeeper = exports.OpponentRobotsById[opponentKeeperId];
        if (opponentKeeper && !opponentKeeper.isVisible) {
            opponentKeeper = undefined;
        }
        exports.FriendlyKeeper = friendlyKeeper;
        exports.OpponentKeeper = opponentKeeper;
        exports.FriendlyYellowCards = [];
        if (friendlyTeamInfo.yellow_card_times != undefined) {
            for (let time of friendlyTeamInfo.yellow_card_times) {
                exports.FriendlyYellowCards.push(time / 1000000);
            }
        }
        exports.OpponentYellowCards = [];
        if (opponentTeamInfo.yellow_card_times != undefined) {
            for (let time of opponentTeamInfo.yellow_card_times) {
                exports.OpponentYellowCards.push(time / 1000000);
            }
        }
        exports.FriendlyRedCards = friendlyTeamInfo.red_cards;
        exports.OpponentRedCards = opponentTeamInfo.red_cards;
        exports.TeamName = friendlyTeamInfo.name;
        if (opponentTeamInfo.name !== exports.OpponentTeamName) {
            exports.OpponentTeamName = opponentTeamInfo.name;
            for (let r of exports.OpponentRobots) {
                r.updateSpecs(exports.OpponentTeamName);
            }
        }
        if (friendlyTeamInfo.max_allowed_bots != undefined) {
            exports.MaxAllowedFriendlyRobots = friendlyTeamInfo.max_allowed_bots;
        }
        else {
            exports.MaxAllowedFriendlyRobots = exports.DIVISION === "A" ? 11 : 6;
        }
        if (opponentTeamInfo.max_allowed_bots != undefined) {
            exports.MaxAllowedOpponentRobots = opponentTeamInfo.max_allowed_bots;
        }
        else {
            exports.MaxAllowedOpponentRobots = exports.DIVISION === "A" ? 11 : 6;
        }
        exports.FriendlyScore = friendlyTeamInfo.score;
        exports.OpponentScore = opponentTeamInfo.score;
    }
    function _updateUserInput(input) {
        if (input.radio_command) {
            for (let robot of exports.FriendlyRobotsAll) {
                robot._updateUserControl(undefined);
            }
            for (let cmd of input.radio_command) {
                let robot = exports.FriendlyRobotsById[cmd.id];
                if (robot) {
                    robot._updateUserControl(cmd.command);
                }
            }
        }
        if (input.move_command) {
            for (let robot of exports.FriendlyRobotsAll) {
                if (robot.moveCommand && (exports.Time - robot.moveCommand.time > 0.3 ||
                    exports.Time - robot.moveCommand.time < 0)) {
                    robot.moveCommand = undefined;
                }
            }
            for (let cmd of input.move_command) {
                if (exports.FriendlyRobotsById[cmd.id]) {
                    exports.FriendlyRobotsById[cmd.id].moveCommand = { time: exports.Time, pos: coordinates_1.Coordinates.toGlobal(new vector_1.Vector(cmd.p_x || 0, cmd.p_y || 0)) };
                }
                else {
                    let teamColorString = exports.TeamIsBlue ? "blue" : "yellow";
                    amunLocal.log(`<font color="red">WARNING: </font>please select robot ${cmd.id} for team ${teamColorString} for pulling it`);
                }
            }
        }
    }
    exports._updateUserInput = _updateUserInput;
    function haltOwnRobots() {
        for (let robot of exports.FriendlyRobotsAll) {
            if (robot.moveCommand == undefined) {
                robot.setStandby(true);
                robot.halt();
            }
        }
    }
    exports.haltOwnRobots = haltOwnRobots;
    function setRobotCommands() {
        if (amunLocal.setCommands) {
            let commands = [];
            for (let robot of exports.FriendlyRobotsAll) {
                commands.push([robot.generation, robot.id, robot._command()]);
            }
            amunLocal.setCommands(commands);
        }
        else {
            for (let robot of exports.FriendlyRobotsAll) {
                amunLocal.setCommand(robot.generation, robot.id, robot._command());
            }
        }
    }
    exports.setRobotCommands = setRobotCommands;
    _init();
});
//# sourceMappingURL=world.js.map