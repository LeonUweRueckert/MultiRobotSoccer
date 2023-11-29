define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ssl = exports.robot = exports.SSL_FieldShapeType = exports.world = exports.SSL_Referee = exports.gameController = exports.amun = exports.SSL_Referee_Game_Event = void 0;
    var SSL_Referee_Game_Event;
    (function (SSL_Referee_Game_Event) {
        let Team;
        (function (Team) {
            Team["TEAM_UNKNOWN"] = "TEAM_UNKNOWN";
            Team["TEAM_YELLOW"] = "TEAM_YELLOW";
            Team["TEAM_BLUE"] = "TEAM_BLUE";
        })(Team = SSL_Referee_Game_Event.Team || (SSL_Referee_Game_Event.Team = {}));
    })(SSL_Referee_Game_Event = exports.SSL_Referee_Game_Event || (exports.SSL_Referee_Game_Event = {}));
    var amun;
    (function (amun) {
        let GameState;
        (function (GameState) {
            let State;
            (function (State) {
                State["Halt"] = "Halt";
                State["Stop"] = "Stop";
                State["Game"] = "Game";
                State["GameForce"] = "GameForce";
                State["KickoffYellowPrepare"] = "KickoffYellowPrepare";
                State["KickoffYellow"] = "KickoffYellow";
                State["PenaltyYellowPrepare"] = "PenaltyYellowPrepare";
                State["PenaltyYellow"] = "PenaltyYellow";
                State["PenaltyYellowRunning"] = "PenaltyYellowRunning";
                State["DirectYellow"] = "DirectYellow";
                State["IndirectYellow"] = "IndirectYellow";
                State["BallPlacementYellow"] = "BallPlacementYellow";
                State["KickoffBluePrepare"] = "KickoffBluePrepare";
                State["KickoffBlue"] = "KickoffBlue";
                State["PenaltyBluePrepare"] = "PenaltyBluePrepare";
                State["PenaltyBlue"] = "PenaltyBlue";
                State["PenaltyBlueRunning"] = "PenaltyBlueRunning";
                State["DirectBlue"] = "DirectBlue";
                State["IndirectBlue"] = "IndirectBlue";
                State["BallPlacementBlue"] = "BallPlacementBlue";
                State["TimeoutYellow"] = "TimeoutYellow";
                State["TimeoutBlue"] = "TimeoutBlue";
            })(State = GameState.State || (GameState.State = {}));
        })(GameState = amun.GameState || (amun.GameState = {}));
    })(amun = exports.amun || (exports.amun = {}));
    var gameController;
    (function (gameController) {
        let AdvantageChoice;
        (function (AdvantageChoice) {
            AdvantageChoice["STOP"] = "STOP";
            AdvantageChoice["CONTINUE"] = "CONTINUE";
        })(AdvantageChoice = gameController.AdvantageChoice || (gameController.AdvantageChoice = {}));
    })(gameController = exports.gameController || (exports.gameController = {}));
    var SSL_Referee;
    (function (SSL_Referee) {
        let Stage;
        (function (Stage) {
            Stage["NORMAL_FIRST_HALF_PRE"] = "NORMAL_FIRST_HALF_PRE";
            Stage["NORMAL_FIRST_HALF"] = "NORMAL_FIRST_HALF";
            Stage["NORMAL_HALF_TIME"] = "NORMAL_HALF_TIME";
            Stage["NORMAL_SECOND_HALF_PRE"] = "NORMAL_SECOND_HALF_PRE";
            Stage["NORMAL_SECOND_HALF"] = "NORMAL_SECOND_HALF";
            Stage["EXTRA_TIME_BREAK"] = "EXTRA_TIME_BREAK";
            Stage["EXTRA_FIRST_HALF_PRE"] = "EXTRA_FIRST_HALF_PRE";
            Stage["EXTRA_FIRST_HALF"] = "EXTRA_FIRST_HALF";
            Stage["EXTRA_HALF_TIME"] = "EXTRA_HALF_TIME";
            Stage["EXTRA_SECOND_HALF_PRE"] = "EXTRA_SECOND_HALF_PRE";
            Stage["EXTRA_SECOND_HALF"] = "EXTRA_SECOND_HALF";
            Stage["PENALTY_SHOOTOUT_BREAK"] = "PENALTY_SHOOTOUT_BREAK";
            Stage["PENALTY_SHOOTOUT"] = "PENALTY_SHOOTOUT";
            Stage["POST_GAME"] = "POST_GAME";
        })(Stage = SSL_Referee.Stage || (SSL_Referee.Stage = {}));
    })(SSL_Referee = exports.SSL_Referee || (exports.SSL_Referee = {}));
    var world;
    (function (world) {
        let Geometry;
        (function (Geometry) {
            let GeometryType;
            (function (GeometryType) {
                GeometryType["TYPE_2014"] = "TYPE_2014";
                GeometryType["TYPE_2018"] = "TYPE_2018";
            })(GeometryType = Geometry.GeometryType || (Geometry.GeometryType = {}));
        })(Geometry = world.Geometry || (world.Geometry = {}));
    })(world = exports.world || (exports.world = {}));
    var SSL_FieldShapeType;
    (function (SSL_FieldShapeType) {
        SSL_FieldShapeType["Undefined"] = "Undefined";
        SSL_FieldShapeType["CenterCircle"] = "CenterCircle";
        SSL_FieldShapeType["TopTouchLine"] = "TopTouchLine";
        SSL_FieldShapeType["BottomTouchLine"] = "BottomTouchLine";
        SSL_FieldShapeType["LeftGoalLine"] = "LeftGoalLine";
        SSL_FieldShapeType["RightGoalLine"] = "RightGoalLine";
        SSL_FieldShapeType["HalfwayLine"] = "HalfwayLine";
        SSL_FieldShapeType["CenterLine"] = "CenterLine";
        SSL_FieldShapeType["LeftPenaltyStretch"] = "LeftPenaltyStretch";
        SSL_FieldShapeType["RightPenaltyStretch"] = "RightPenaltyStretch";
        SSL_FieldShapeType["LeftFieldLeftPenaltyStretch"] = "LeftFieldLeftPenaltyStretch";
        SSL_FieldShapeType["LeftFieldRightPenaltyStretch"] = "LeftFieldRightPenaltyStretch";
        SSL_FieldShapeType["RightFieldLeftPenaltyStretch"] = "RightFieldLeftPenaltyStretch";
        SSL_FieldShapeType["RightFieldRightPenaltyStretch"] = "RightFieldRightPenaltyStretch";
    })(SSL_FieldShapeType = exports.SSL_FieldShapeType || (exports.SSL_FieldShapeType = {}));
    (function (gameController) {
        let GameEvent;
        (function (GameEvent) {
            let Type;
            (function (Type) {
                Type["UNKNOWN_GAME_EVENT_TYPE"] = "UNKNOWN_GAME_EVENT_TYPE";
                Type["BALL_LEFT_FIELD_TOUCH_LINE"] = "BALL_LEFT_FIELD_TOUCH_LINE";
                Type["BALL_LEFT_FIELD_GOAL_LINE"] = "BALL_LEFT_FIELD_GOAL_LINE";
                Type["AIMLESS_KICK"] = "AIMLESS_KICK";
                Type["ATTACKER_TOO_CLOSE_TO_DEFENSE_AREA"] = "ATTACKER_TOO_CLOSE_TO_DEFENSE_AREA";
                Type["DEFENDER_IN_DEFENSE_AREA"] = "DEFENDER_IN_DEFENSE_AREA";
                Type["BOUNDARY_CROSSING"] = "BOUNDARY_CROSSING";
                Type["KEEPER_HELD_BALL"] = "KEEPER_HELD_BALL";
                Type["BOT_DRIBBLED_BALL_TOO_FAR"] = "BOT_DRIBBLED_BALL_TOO_FAR";
                Type["BOT_PUSHED_BOT"] = "BOT_PUSHED_BOT";
                Type["BOT_HELD_BALL_DELIBERATELY"] = "BOT_HELD_BALL_DELIBERATELY";
                Type["BOT_TIPPED_OVER"] = "BOT_TIPPED_OVER";
                Type["ATTACKER_TOUCHED_BALL_IN_DEFENSE_AREA"] = "ATTACKER_TOUCHED_BALL_IN_DEFENSE_AREA";
                Type["BOT_KICKED_BALL_TOO_FAST"] = "BOT_KICKED_BALL_TOO_FAST";
                Type["BOT_CRASH_UNIQUE"] = "BOT_CRASH_UNIQUE";
                Type["BOT_CRASH_DRAWN"] = "BOT_CRASH_DRAWN";
                Type["DEFENDER_TOO_CLOSE_TO_KICK_POINT"] = "DEFENDER_TOO_CLOSE_TO_KICK_POINT";
                Type["BOT_TOO_FAST_IN_STOP"] = "BOT_TOO_FAST_IN_STOP";
                Type["BOT_INTERFERED_PLACEMENT"] = "BOT_INTERFERED_PLACEMENT";
                Type["POSSIBLE_GOAL"] = "POSSIBLE_GOAL";
                Type["GOAL"] = "GOAL";
                Type["INVALID_GOAL"] = "INVALID_GOAL";
                Type["ATTACKER_DOUBLE_TOUCHED_BALL"] = "ATTACKER_DOUBLE_TOUCHED_BALL";
                Type["PLACEMENT_SUCCEEDED"] = "PLACEMENT_SUCCEEDED";
                Type["PENALTY_KICK_FAILED"] = "PENALTY_KICK_FAILED";
                Type["NO_PROGRESS_IN_GAME"] = "NO_PROGRESS_IN_GAME";
                Type["PLACEMENT_FAILED"] = "PLACEMENT_FAILED";
                Type["MULTIPLE_CARDS"] = "MULTIPLE_CARDS";
                Type["MULTIPLE_FOULS"] = "MULTIPLE_FOULS";
                Type["BOT_SUBSTITUTION"] = "BOT_SUBSTITUTION";
                Type["TOO_MANY_ROBOTS"] = "TOO_MANY_ROBOTS";
                Type["CHALLENGE_FLAG"] = "CHALLENGE_FLAG";
                Type["EMERGENCY_STOP"] = "EMERGENCY_STOP";
                Type["UNSPORTING_BEHAVIOR_MINOR"] = "UNSPORTING_BEHAVIOR_MINOR";
                Type["UNSPORTING_BEHAVIOR_MAJOR"] = "UNSPORTING_BEHAVIOR_MAJOR";
                Type["PREPARED"] = "PREPARED";
                Type["INDIRECT_GOAL"] = "INDIRECT_GOAL";
                Type["CHIPPED_GOAL"] = "CHIPPED_GOAL";
                Type["KICK_TIMEOUT"] = "KICK_TIMEOUT";
                Type["ATTACKER_TOUCHED_OPPONENT_IN_DEFENSE_AREA"] = "ATTACKER_TOUCHED_OPPONENT_IN_DEFENSE_AREA";
                Type["ATTACKER_TOUCHED_OPPONENT_IN_DEFENSE_AREA_SKIPPED"] = "ATTACKER_TOUCHED_OPPONENT_IN_DEFENSE_AREA_SKIPPED";
                Type["BOT_CRASH_UNIQUE_SKIPPED"] = "BOT_CRASH_UNIQUE_SKIPPED";
                Type["BOT_PUSHED_BOT_SKIPPED"] = "BOT_PUSHED_BOT_SKIPPED";
                Type["DEFENDER_IN_DEFENSE_AREA_PARTIALLY"] = "DEFENDER_IN_DEFENSE_AREA_PARTIALLY";
                Type["MULTIPLE_PLACEMENT_FAILURES"] = "MULTIPLE_PLACEMENT_FAILURES";
            })(Type = GameEvent.Type || (GameEvent.Type = {}));
        })(GameEvent = gameController.GameEvent || (gameController.GameEvent = {}));
    })(gameController = exports.gameController || (exports.gameController = {}));
    (function (SSL_Referee) {
        let Command;
        (function (Command) {
            Command["HALT"] = "HALT";
            Command["STOP"] = "STOP";
            Command["NORMAL_START"] = "NORMAL_START";
            Command["FORCE_START"] = "FORCE_START";
            Command["PREPARE_KICKOFF_YELLOW"] = "PREPARE_KICKOFF_YELLOW";
            Command["PREPARE_KICKOFF_BLUE"] = "PREPARE_KICKOFF_BLUE";
            Command["PREPARE_PENALTY_YELLOW"] = "PREPARE_PENALTY_YELLOW";
            Command["PREPARE_PENALTY_BLUE"] = "PREPARE_PENALTY_BLUE";
            Command["DIRECT_FREE_YELLOW"] = "DIRECT_FREE_YELLOW";
            Command["DIRECT_FREE_BLUE"] = "DIRECT_FREE_BLUE";
            Command["INDIRECT_FREE_YELLOW"] = "INDIRECT_FREE_YELLOW";
            Command["INDIRECT_FREE_BLUE"] = "INDIRECT_FREE_BLUE";
            Command["TIMEOUT_YELLOW"] = "TIMEOUT_YELLOW";
            Command["TIMEOUT_BLUE"] = "TIMEOUT_BLUE";
            Command["GOAL_YELLOW"] = "GOAL_YELLOW";
            Command["GOAL_BLUE"] = "GOAL_BLUE";
            Command["BALL_PLACEMENT_YELLOW"] = "BALL_PLACEMENT_YELLOW";
            Command["BALL_PLACEMENT_BLUE"] = "BALL_PLACEMENT_BLUE";
        })(Command = SSL_Referee.Command || (SSL_Referee.Command = {}));
    })(SSL_Referee = exports.SSL_Referee || (exports.SSL_Referee = {}));
    var robot;
    (function (robot) {
        let Command;
        (function (Command) {
            let KickStyle;
            (function (KickStyle) {
                KickStyle["Linear"] = "Linear";
                KickStyle["Chip"] = "Chip";
            })(KickStyle = Command.KickStyle || (Command.KickStyle = {}));
        })(Command = robot.Command || (robot.Command = {}));
    })(robot = exports.robot || (exports.robot = {}));
    (function (world) {
        let Geometry;
        (function (Geometry) {
            let Division;
            (function (Division) {
                Division["A"] = "A";
                Division["B"] = "B";
            })(Division = Geometry.Division || (Geometry.Division = {}));
        })(Geometry = world.Geometry || (world.Geometry = {}));
    })(world = exports.world || (exports.world = {}));
    (function (robot) {
        let Specs;
        (function (Specs) {
            let GenerationType;
            (function (GenerationType) {
                GenerationType["Regular"] = "Regular";
                GenerationType["Ally"] = "Ally";
            })(GenerationType = Specs.GenerationType || (Specs.GenerationType = {}));
        })(Specs = robot.Specs || (robot.Specs = {}));
    })(robot = exports.robot || (exports.robot = {}));
    (function (gameController) {
        let ControllerReply;
        (function (ControllerReply) {
            let StatusCode;
            (function (StatusCode) {
                StatusCode["UNKNOWN_STATUS_CODE"] = "UNKNOWN_STATUS_CODE";
                StatusCode["OK"] = "OK";
                StatusCode["REJECTED"] = "REJECTED";
            })(StatusCode = ControllerReply.StatusCode || (ControllerReply.StatusCode = {}));
        })(ControllerReply = gameController.ControllerReply || (gameController.ControllerReply = {}));
    })(gameController = exports.gameController || (exports.gameController = {}));
    (function (SSL_Referee_Game_Event) {
        let GameEventType;
        (function (GameEventType) {
            GameEventType["UNKNOWN"] = "UNKNOWN";
            GameEventType["CUSTOM"] = "CUSTOM";
            GameEventType["NUMBER_OF_PLAYERS"] = "NUMBER_OF_PLAYERS";
            GameEventType["BALL_LEFT_FIELD"] = "BALL_LEFT_FIELD";
            GameEventType["GOAL"] = "GOAL";
            GameEventType["KICK_TIMEOUT"] = "KICK_TIMEOUT";
            GameEventType["NO_PROGRESS_IN_GAME"] = "NO_PROGRESS_IN_GAME";
            GameEventType["BOT_COLLISION"] = "BOT_COLLISION";
            GameEventType["MULTIPLE_DEFENDER"] = "MULTIPLE_DEFENDER";
            GameEventType["MULTIPLE_DEFENDER_PARTIALLY"] = "MULTIPLE_DEFENDER_PARTIALLY";
            GameEventType["ATTACKER_IN_DEFENSE_AREA"] = "ATTACKER_IN_DEFENSE_AREA";
            GameEventType["ICING"] = "ICING";
            GameEventType["BALL_SPEED"] = "BALL_SPEED";
            GameEventType["ROBOT_STOP_SPEED"] = "ROBOT_STOP_SPEED";
            GameEventType["BALL_DRIBBLING"] = "BALL_DRIBBLING";
            GameEventType["ATTACKER_TOUCH_KEEPER"] = "ATTACKER_TOUCH_KEEPER";
            GameEventType["DOUBLE_TOUCH"] = "DOUBLE_TOUCH";
            GameEventType["ATTACKER_TO_DEFENCE_AREA"] = "ATTACKER_TO_DEFENCE_AREA";
            GameEventType["DEFENDER_TO_KICK_POINT_DISTANCE"] = "DEFENDER_TO_KICK_POINT_DISTANCE";
            GameEventType["BALL_HOLDING"] = "BALL_HOLDING";
            GameEventType["INDIRECT_GOAL"] = "INDIRECT_GOAL";
            GameEventType["BALL_PLACEMENT_FAILED"] = "BALL_PLACEMENT_FAILED";
            GameEventType["CHIP_ON_GOAL"] = "CHIP_ON_GOAL";
        })(GameEventType = SSL_Referee_Game_Event.GameEventType || (SSL_Referee_Game_Event.GameEventType = {}));
    })(SSL_Referee_Game_Event = exports.SSL_Referee_Game_Event || (exports.SSL_Referee_Game_Event = {}));
    var ssl;
    (function (ssl) {
        let RobotPlan;
        (function (RobotPlan) {
            let RobotRole;
            (function (RobotRole) {
                RobotRole["Default"] = "Default";
                RobotRole["Goalie"] = "Goalie";
                RobotRole["Defense"] = "Defense";
                RobotRole["Offense"] = "Offense";
            })(RobotRole = RobotPlan.RobotRole || (RobotPlan.RobotRole = {}));
        })(RobotPlan = ssl.RobotPlan || (ssl.RobotPlan = {}));
    })(ssl = exports.ssl || (exports.ssl = {}));
    (function (gameController) {
        let ControllerReply;
        (function (ControllerReply) {
            let Verification;
            (function (Verification) {
                Verification["UNKNOWN_VERIFICATION"] = "UNKNOWN_VERIFICATION";
                Verification["VERIFIED"] = "VERIFIED";
                Verification["UNVERIFIED"] = "UNVERIFIED";
            })(Verification = ControllerReply.Verification || (ControllerReply.Verification = {}));
        })(ControllerReply = gameController.ControllerReply || (gameController.ControllerReply = {}));
    })(gameController = exports.gameController || (exports.gameController = {}));
    (function (amun) {
        let PauseSimulatorReason;
        (function (PauseSimulatorReason) {
            PauseSimulatorReason["Ui"] = "Ui";
            PauseSimulatorReason["WindowFocus"] = "WindowFocus";
            PauseSimulatorReason["DebugBlueStrategy"] = "DebugBlueStrategy";
            PauseSimulatorReason["DebugYellowStrategy"] = "DebugYellowStrategy";
            PauseSimulatorReason["DebugAutoref"] = "DebugAutoref";
            PauseSimulatorReason["Replay"] = "Replay";
            PauseSimulatorReason["Horus"] = "Horus";
            PauseSimulatorReason["Logging"] = "Logging";
        })(PauseSimulatorReason = amun.PauseSimulatorReason || (amun.PauseSimulatorReason = {}));
    })(amun = exports.amun || (exports.amun = {}));
    (function (world) {
        let WorldSource;
        (function (WorldSource) {
            WorldSource["INTERNAL_SIMULATION"] = "INTERNAL_SIMULATION";
            WorldSource["EXTERNAL_SIMULATION"] = "EXTERNAL_SIMULATION";
            WorldSource["REAL_LIFE"] = "REAL_LIFE";
        })(WorldSource = world.WorldSource || (world.WorldSource = {}));
    })(world = exports.world || (exports.world = {}));
    (function (gameController) {
        let Team;
        (function (Team) {
            Team["UNKNOWN"] = "UNKNOWN";
            Team["YELLOW"] = "YELLOW";
            Team["BLUE"] = "BLUE";
        })(Team = gameController.Team || (gameController.Team = {}));
    })(gameController = exports.gameController || (exports.gameController = {}));
    (function (amun) {
        let DebuggerInputTarget;
        (function (DebuggerInputTarget) {
            DebuggerInputTarget["DITStrategyYellow"] = "DITStrategyYellow";
            DebuggerInputTarget["DITStrategyBlue"] = "DITStrategyBlue";
            DebuggerInputTarget["DITAutoref"] = "DITAutoref";
        })(DebuggerInputTarget = amun.DebuggerInputTarget || (amun.DebuggerInputTarget = {}));
    })(amun = exports.amun || (exports.amun = {}));
    (function (amun) {
        let Pen;
        (function (Pen) {
            let Style;
            (function (Style) {
                Style["DashLine"] = "DashLine";
                Style["DotLine"] = "DotLine";
                Style["DashDotLine"] = "DashDotLine";
                Style["DashDotDotLine"] = "DashDotDotLine";
            })(Style = Pen.Style || (Pen.Style = {}));
        })(Pen = amun.Pen || (amun.Pen = {}));
    })(amun = exports.amun || (exports.amun = {}));
});
//# sourceMappingURL=protobuf.js.map