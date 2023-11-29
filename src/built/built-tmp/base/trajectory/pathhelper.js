define(["require", "exports", "base/constants", "base/field", "base/geom", "base/mathutil", "base/referee", "base/vector", "base/world"], function (require, exports, Constants, Field, geom, MathUtil, Referee, vector_1, World) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.insertObstacles = exports.setDefaultObstaclesByTable = exports.getObstacleParam = exports.setObstacleParam = exports.ParameterType = exports.PRIORITIES = exports.valueToRating = exports.setHardwareChallenge = void 0;
    const G = World.Geometry;
    const POSITION_PADDING = 0.02;
    const SEED_ANGLE_MOD = geom.degreeToRadian(2);
    const SEED_PREDICT_TIME = 0.5;
    let hardwareChallenge = undefined;
    function setHardwareChallenge(challenge) {
        hardwareChallenge = challenge;
    }
    exports.setHardwareChallenge = setHardwareChallenge;
    function valueToRating(value, zero, one) {
        return MathUtil.bound(0, (value - zero) / (one - zero), 1);
    }
    exports.valueToRating = valueToRating;
    exports.PRIORITIES = {
        GOAL: 100,
        STOP_EVACUATE_GOAL: 96,
        STOP_DEFENSE_AREA: 95,
        ROBOT: 92,
        BALL: 84,
        OUT_OF_FIELD: 80,
        EVACUATE_GOAL: 76,
        INNER_BALL: 68,
        OUTER_BALL: 66,
        BALL_PLACEMENT: 52,
        DEFENSE_AREA: 44,
        OPP_FIELD_HALF_INNER: 37,
        OPP_FIELD_HALF: 36,
        CATCH_BALL: 28,
        GOAL_SHOT: 20,
        PASS_MA_BALL: 13,
        PASS_BALL_STRIKER: 12
    };
    function addSeedTargets(path, robot) {
        if (path.addSeedTarget && robot.speed.length() > 0.1) {
            let angleMod = [-SEED_ANGLE_MOD, 0, SEED_ANGLE_MOD];
            for (let angle of angleMod) {
                let seedTarget = robot.pos.add((robot.speed.mul(SEED_PREDICT_TIME)).rotated(angle));
                path.addSeedTarget(seedTarget.x, seedTarget.y);
            }
        }
    }
    const GOAL_AREA = [
        new vector_1.Vector(-G.GoalWidth / 2 - 0.04, G.FieldHeightHalf + G.GoalDepth + 0.04),
        new vector_1.Vector(G.GoalWidth / 2 + 0.04, G.FieldHeightHalf - G.GoalDepth - 0.04)
    ];
    const GOAL_AREA_FRIENDLY = [
        GOAL_AREA[0].unm(),
        GOAL_AREA[1].unm()
    ];
    function addFriendlyDefenseAreaObstacle(path, robot) {
        if (World.FriendlyKeeper !== robot && robot.pos.y < 0
            && World.RefereeState !== "BallPlacementOffensive") {
            if (World.RULEVERSION === "2018") {
                path.addRect(G.FriendlyGoal.x - G.DefenseWidthHalf - POSITION_PADDING, G.FriendlyGoal.y - 1, G.FriendlyGoal.x + G.DefenseWidthHalf + POSITION_PADDING, G.FriendlyGoal.y + G.DefenseHeight + POSITION_PADDING, 0, "DefenseArea", exports.PRIORITIES.DEFENSE_AREA);
            }
            else {
                path.addLine(G.FriendlyGoal.x - G.DefenseStretch / 2, G.FriendlyGoal.y, G.FriendlyGoal.x + G.DefenseStretch / 2, G.FriendlyGoal.y, G.DefenseRadius + POSITION_PADDING, "DefenseArea", exports.PRIORITIES.DEFENSE_AREA);
            }
            if (geom.insideRect(GOAL_AREA_FRIENDLY[0], GOAL_AREA_FRIENDLY[1], robot.pos) || Field.isInFriendlyDefenseArea(robot.pos, robot.radius)) {
                path.addRect(GOAL_AREA_FRIENDLY[0].x, GOAL_AREA_FRIENDLY[0].y, GOAL_AREA_FRIENDLY[1].x, GOAL_AREA_FRIENDLY[1].y, 0, "EvacuateGoal", exports.PRIORITIES.EVACUATE_GOAL);
            }
        }
    }
    function addOpponentDefenseAreaObstacle(path, robot, targetPosition) {
        let oppDefAreaDist = Referee.isFriendlyFreeKickState() || Referee.isStopState() ? G.FreeKickDefenseDist + 0.05 : 0;
        const priority = oppDefAreaDist === 0 ? exports.PRIORITIES.DEFENSE_AREA : exports.PRIORITIES.STOP_DEFENSE_AREA;
        let distance = oppDefAreaDist + POSITION_PADDING;
        if (robot.pos.y > 0 && (!Referee.isFriendlyPenaltyState()) &&
            World.RefereeState !== "BallPlacementOffensive" && hardwareChallenge !== 0) {
            if (World.RULEVERSION === "2018") {
                path.addRect(G.OpponentGoal.x - G.DefenseWidthHalf - distance, G.OpponentGoal.y - G.DefenseHeight - distance, G.OpponentGoal.x + G.DefenseWidthHalf + distance, G.OpponentGoal.y + 1, 0, "DefenseArea", priority);
            }
            else {
                path.addLine(G.OpponentGoal.x - G.DefenseStretch / 2, G.OpponentGoal.y, G.OpponentGoal.x + G.DefenseStretch / 2, G.OpponentGoal.y, G.DefenseRadius + POSITION_PADDING, "DefenseArea", priority);
            }
            if (geom.insideRect(GOAL_AREA[0], GOAL_AREA[1], robot.pos) || Field.isInOpponentDefenseArea(robot.pos, robot.radius * 2)) {
                path.addRect(GOAL_AREA[0].x, GOAL_AREA[0].y, GOAL_AREA[1].x, GOAL_AREA[1].y, 0, "EvacuateGoal", priority === exports.PRIORITIES.DEFENSE_AREA ? exports.PRIORITIES.EVACUATE_GOAL : exports.PRIORITIES.STOP_EVACUATE_GOAL);
            }
        }
    }
    function addOpponentFieldHalfObstacle(path) {
        if (World.RefereeState === "KickoffOffensive") {
            path.addRect(-G.FieldWidthHalf - 0.5, G.FieldHeightHalf + 0.5, -G.CenterCircleRadius, 0.02, 0, "OppFieldHalf", exports.PRIORITIES.OPP_FIELD_HALF);
            path.addRect(-G.CenterCircleRadius - 0.2, G.FieldHeightHalf + 0.5, G.CenterCircleRadius + 0.2, G.CenterCircleRadius, 0, "OppFieldHalf", exports.PRIORITIES.OPP_FIELD_HALF_INNER);
            path.addRect(G.CenterCircleRadius, G.FieldHeightHalf + 0.5, G.FieldWidthHalf + 0.5, 0.02, 0, "OppFieldHalf", exports.PRIORITIES.OPP_FIELD_HALF);
        }
        else {
            path.addRect(-G.FieldWidthHalf - 0.5, G.FieldHeightHalf + 0.5, G.FieldWidthHalf + 0.5, 0.02, 0, "OppFieldHalf", exports.PRIORITIES.OPP_FIELD_HALF);
        }
    }
    function addZonedBallObstacles(robot, innerBallDistance, outerBallDistance) {
        let ball = World.Ball;
        let distSq = robot.pos.distanceToSq(ball.pos);
        let outermost = Infinity;
        if (outerBallDistance != undefined) {
            outermost = outerBallDistance * outerBallDistance;
            robot.path.addCircle(ball.pos.x, ball.pos.y, ball.radius + outerBallDistance, "OuterBallObstacle", exports.PRIORITIES.OUTER_BALL);
        }
        if (distSq < outermost && innerBallDistance != undefined) {
            outermost = innerBallDistance * innerBallDistance;
            if (ball.speed.length() >= 0.3) {
                let ballSpeedScale = ball.speed.mul(0.4);
                robot.path.addLine(ball.pos.x, ball.pos.y, ball.pos.x + ballSpeedScale.x, ball.pos.y + ballSpeedScale.y, ball.radius + innerBallDistance, "InnerBallObstacle", exports.PRIORITIES.INNER_BALL);
            }
            else {
                robot.path.addCircle(ball.pos.x, ball.pos.y, ball.radius + innerBallDistance, "InnerBallObstacle", exports.PRIORITIES.INNER_BALL);
            }
        }
        if (distSq < outermost) {
            robot.path.addCircle(ball.pos.x, ball.pos.y, ball.radius, "Ball", exports.PRIORITIES.BALL);
        }
    }
    function addBallObstacle(robot, ignoreBall, stopBallDistance, extraBallDistance) {
        let isDefensiveStopState = Referee.isStopState() && World.RefereeState !== "BallPlacementOffensive" && hardwareChallenge !== 0;
        if (isDefensiveStopState) {
            if (stopBallDistance != undefined && extraBallDistance != undefined && stopBallDistance > extraBallDistance) {
                let temp = stopBallDistance;
                stopBallDistance = extraBallDistance;
                extraBallDistance = temp;
            }
            addZonedBallObstacles(robot, stopBallDistance, extraBallDistance);
        }
        else if (!ignoreBall) {
            addZonedBallObstacles(robot, undefined, extraBallDistance);
        }
    }
    function addGoalObstacle(path, robot, ignoreDefense, ignoreOppDefense) {
        const gw = G.GoalWallWidth / 2;
        const depth = G.GoalDepth + 0.5;
        if (robot.pos.y < 0) {
            if (ignoreDefense) {
                path.addLine(G.FriendlyGoalLeft.x - gw, G.FriendlyGoalLeft.y - gw, G.FriendlyGoalLeft.x - gw, G.FriendlyGoalLeft.y - G.GoalDepth - gw, gw, "OwnGoal_Left", exports.PRIORITIES.GOAL);
                path.addLine(G.FriendlyGoalRight.x + gw, G.FriendlyGoalRight.y - gw, G.FriendlyGoalRight.x + gw, G.FriendlyGoalRight.y - G.GoalDepth - gw, gw, "OwnGoal_Right", exports.PRIORITIES.GOAL);
                path.addRect(G.FriendlyGoalLeft.x - G.GoalWallWidth, G.FriendlyGoalLeft.y - G.GoalDepth, G.FriendlyGoalRight.x + G.GoalWallWidth, G.FriendlyGoalRight.y - depth, 0, "OwnGoal_Back", exports.PRIORITIES.GOAL);
            }
        }
        else if (ignoreOppDefense) {
            path.addLine(G.OpponentGoalLeft.x - gw, G.OpponentGoalLeft.y + gw, G.OpponentGoalLeft.x - gw, G.OpponentGoalLeft.y + G.GoalDepth + gw, gw, "OppGoal_Left", exports.PRIORITIES.GOAL);
            path.addLine(G.OpponentGoalRight.x + gw, G.OpponentGoalRight.y + gw, G.OpponentGoalRight.x + gw, G.OpponentGoalRight.y + G.GoalDepth + gw, gw, "OppGoal_Right", exports.PRIORITIES.GOAL);
            path.addRect(G.OpponentGoalLeft.x - G.GoalWallWidth, G.OpponentGoalLeft.y + G.GoalDepth, G.OpponentGoalRight.x + G.GoalWallWidth, G.OpponentGoalRight.y + depth, 0, "OppGoal_Back", exports.PRIORITIES.GOAL);
        }
    }
    function addPenaltyObstacle(path) {
        if (World.RefereeState === "PenaltyOffensivePrepare" || World.RefereeState === "PenaltyOffensive") {
            path.addRect(-G.FieldWidthHalf - 1, G.OpponentGoalRight.y + 1, G.FieldWidthHalf + 1, (G.OpponentGoalRight.y - (G.DefenseHeight + 0.45)), 0);
        }
    }
    function addBallPlacementObstacle(path) {
        if (World.RefereeState === "BallPlacementOffensive" || World.RefereeState === "BallPlacementDefensive") {
            if (!World.BallPlacementPos) {
                throw new Error("Referee state ball placement without ballPlacementPos");
            }
            if (World.Ball.pos.distanceToSq(World.BallPlacementPos) > 0.001) {
                path.addLine(World.Ball.pos.x, World.Ball.pos.y, World.BallPlacementPos.x, World.BallPlacementPos.y, Constants.stopBallDistance + 0.1, "BallPlacement", exports.PRIORITIES.BALL_PLACEMENT);
            }
            else {
                path.addCircle(World.Ball.pos.x, World.Ball.pos.y, Constants.stopBallDistance + 0.1, "BallPlacement");
            }
        }
    }
    function setDefaultObstacles(path, robot, targetPosition, ignoreBall, ignoreGoals, ignoreDefenseArea, radius = robot.radius, stopBallDistance = Constants.stopBallDistance + 0.05, noSeedTarget, ignoreOpponentDefenseArea, extraBallDistance) {
        let forbidOppFieldHalf = Referee.isKickoffState();
        path.setRadius(radius);
        path.setOutOfFieldObstaclePriority(exports.PRIORITIES.OUT_OF_FIELD);
        if (!noSeedTarget) {
            addSeedTargets(path, robot);
        }
        if (!ignoreDefenseArea && hardwareChallenge !== 4) {
            addFriendlyDefenseAreaObstacle(path, robot);
        }
        if (!ignoreOpponentDefenseArea && hardwareChallenge !== 4) {
            addOpponentDefenseAreaObstacle(path, robot, targetPosition);
        }
        if (forbidOppFieldHalf) {
            addOpponentFieldHalfObstacle(path);
        }
        addBallObstacle(robot, ignoreBall, stopBallDistance, extraBallDistance);
        if (!ignoreGoals) {
            addGoalObstacle(path, robot, ignoreDefenseArea || World.RefereeState === "BallPlacementOffensive", ignoreOpponentDefenseArea || World.RefereeState === "BallPlacementOffensive");
        }
    }
    function ignoreRobot(ownRobot, robot) {
        if (robot.speed.length() > 1 && ownRobot.pos.distanceTo(robot.pos) > 2) {
            return true;
        }
        return false;
    }
    function addMovingRobotObstacle(path, otherRobot, safetyDistance) {
        const ACCELERATION = 3.0;
        const speedLength = otherRobot.speed.length();
        const brakeTime = speedLength / ACCELERATION;
        const brakePos = otherRobot.speed.mul((brakeTime * 0.5));
        path.addMovingCircle(0, brakeTime, otherRobot.pos, otherRobot.speed, otherRobot.speed.withLength(ACCELERATION).unm(), otherRobot.radius + safetyDistance, exports.PRIORITIES.ROBOT);
        if (brakeTime < 2) {
            path.addMovingCircle(brakeTime, 2, otherRobot.pos.add(brakePos), new vector_1.Vector(0, 0), new vector_1.Vector(0, 0), otherRobot.radius + safetyDistance, exports.PRIORITIES.ROBOT);
        }
    }
    let robotWasSlowHysteresis = new Map();
    function addRobotObstacles(path, robot, targetPosition, ignoreFriendlyRobots, ignoreOpponentRobots, disableOpponentPrediction, useCMA) {
        let estimationTime = 0.1;
        const SLOW_ROBOT = 0.3;
        const MAX_DISTANCE_TO_IGNORE = 3.5;
        if (!ignoreFriendlyRobots) {
            for (let r of World.FriendlyRobots) {
                if (r.id === robot.id) {
                    continue;
                }
                if (r.pos.distanceToLineSegment(robot.pos, targetPosition) > MAX_DISTANCE_TO_IGNORE) {
                    continue;
                }
                if (useCMA || !r.path.lastFrameWasTrajectoryPath()) {
                    if (ignoreRobot(robot, r)) {
                        continue;
                    }
                    let safetyDistance = MathUtil.bound(0, robot.speed.distanceTo(r.speed) * 0.05, 0.05);
                    let estimatedPosition = r.pos.add(r.speed.mul(estimationTime));
                    if (robot.pos.distanceToLineSegment(r.pos, estimatedPosition) >= robot.radius + r.radius
                        && r.pos.distanceTo(estimatedPosition) > 0.0001) {
                        path.addLine(r.pos.x, r.pos.y, estimatedPosition.x, estimatedPosition.y, r.radius + safetyDistance, `OwnRobot_${r.id}`, exports.PRIORITIES.ROBOT);
                    }
                    else {
                        path.addCircle(r.pos.x, r.pos.y, r.radius + safetyDistance, `OwnRobot_${r.id}`, exports.PRIORITIES.ROBOT);
                    }
                }
                else {
                    path.addFriendlyRobotObstacle(r, r.radius + 0.02, exports.PRIORITIES.ROBOT);
                }
            }
        }
        if (disableOpponentPrediction) {
            estimationTime = 0;
        }
        if (!ignoreOpponentRobots) {
            const MAX_NO_FOUL_SPEED = 0.5;
            const FOUL_SPEED_HYSTERESIS = 0.1;
            let hystValue = robotWasSlowHysteresis.get(robot) ? FOUL_SPEED_HYSTERESIS : 0;
            let robotIsSlow = robot.speed.length() < MAX_NO_FOUL_SPEED + hystValue;
            robotWasSlowHysteresis.set(robot, robotIsSlow);
            for (let r of World.OpponentRobots) {
                const willAccelerate = robot.pos.distanceTo(targetPosition) < MAX_NO_FOUL_SPEED / robot.acceleration.aBrakeFMax * 0.5 * MAX_NO_FOUL_SPEED;
                if (robotIsSlow && willAccelerate) {
                    break;
                }
                if (ignoreRobot(robot, r)) {
                    continue;
                }
                if (r.pos.distanceToLineSegment(robot.pos, targetPosition) > MAX_DISTANCE_TO_IGNORE) {
                    continue;
                }
                let safetyDistance = Math.max(0, valueToRating(robot.speed.distanceTo(r.speed), 0, 1.25) * 0.15 - 0.05);
                if (robot.speed.length() < 0.5) {
                    safetyDistance = Math.min(safetyDistance, 0.02);
                }
                if (disableOpponentPrediction) {
                    safetyDistance = safetyDistance / 2;
                }
                else if (robot.speed.length() < SLOW_ROBOT && r.speed.length() < SLOW_ROBOT) {
                    safetyDistance = safetyDistance - 0.02;
                }
                let estimatedPosition = r.pos.add(r.speed.mul(estimationTime));
                if (robot.pos.distanceToLineSegment(r.pos, estimatedPosition) >= robot.radius + r.radius
                    && r.pos.distanceTo(estimatedPosition) > 0.0001) {
                    if (!useCMA && path.hasOpponentRobotObstacle()) {
                        path.addOpponentRobotObstacle(r, exports.PRIORITIES.ROBOT);
                    }
                    else {
                        const absSpeed = r.speed.length();
                        const brakeTime = absSpeed / r.acceleration.aBrakeFMax;
                        if (brakeTime < estimationTime || useCMA) {
                            path.addLine(r.pos.x, r.pos.y, estimatedPosition.x, estimatedPosition.y, r.radius + safetyDistance, `OwnRobot_${r.id}`, exports.PRIORITIES.ROBOT);
                        }
                        else {
                            let leavingTime = (-absSpeed + Math.sqrt(absSpeed * absSpeed + 2 * r.acceleration.aBrakeFMax * (absSpeed * estimationTime + r.radius))) / r.acceleration.aBrakeFMax;
                            path.addMovingLine(0, leavingTime, r.pos, new vector_1.Vector(0, 0), new vector_1.Vector(0, 0), estimatedPosition, new vector_1.Vector(0, 0), new vector_1.Vector(0, 0), r.radius + safetyDistance, exports.PRIORITIES.ROBOT);
                        }
                        if (!robotIsSlow && !useCMA) {
                            path.addMovingCircle(0, 0.8, r.pos, r.speed, new vector_1.Vector(0, 0), r.radius + safetyDistance, exports.PRIORITIES.ROBOT);
                        }
                    }
                }
                else {
                    path.addCircle(r.pos.x, r.pos.y, r.radius + safetyDistance, `OppRobot_${r.id}`, exports.PRIORITIES.ROBOT);
                }
            }
        }
    }
    var ParameterType;
    (function (ParameterType) {
        ParameterType["ignoreBall"] = "ignoreBall";
        ParameterType["ignoreGoals"] = "ignoreGoals";
        ParameterType["ignoreDefenseArea"] = "ignoreDefenseArea";
        ParameterType["ignoreOpponentDefenseArea"] = "ignoreOpponentDefenseArea";
        ParameterType["noSeedTarget"] = "noSeedTarget";
        ParameterType["ignoreFriendlyRobots"] = "ignoreFriendlyRobots";
        ParameterType["ignoreOpponentRobots"] = "ignoreOpponentRobots";
        ParameterType["ignoreBallPlacementObstacle"] = "ignoreBallPlacementObstacle";
        ParameterType["ignorePenaltyDistance"] = "ignorePenaltyDistance";
        ParameterType["disableOpponentPrediction"] = "disableOpponentPrediction";
        ParameterType["pathRadius"] = "pathRadius";
        ParameterType["stopBallDistance"] = "stopBallDistance";
        ParameterType["extraBallDistance"] = "extraBallDistance";
    })(ParameterType = exports.ParameterType || (exports.ParameterType = {}));
    let obstacles = new Map();
    function setObstacleParam(robot, type, value) {
        if (!obstacles.has(robot)) {
            throw new Error(`setObstacleParam got called before setDefaultObstaclesByTable for robot ${robot.id}`);
        }
        obstacles.get(robot)[type] = value;
    }
    exports.setObstacleParam = setObstacleParam;
    function getObstacleParam(robot, type) {
        if (!obstacles.has(robot)) {
            throw new Error(`getObstacleParam got called before setDefaultObstaclesByTable for robot ${robot.id}`);
        }
        return obstacles.get(robot)[type];
    }
    exports.getObstacleParam = getObstacleParam;
    function setDefaultObstaclesByTable(path, robot, params) {
        if (!params) {
            throw new Error("setDefaultObstaclesByTable called with undefined parameter table");
        }
        path.clearObstacles();
        let obst = { ...params };
        obst["path"] = path || robot.path;
        obst["pathRadius"] = obst.pathRadius != undefined ? obst.pathRadius : robot.radius;
        obst["stopBallDistance"] = obst.stopBallDistance != undefined ? obst.stopBallDistance : Constants.stopBallDistance;
        obstacles.set(robot, obst);
    }
    exports.setDefaultObstaclesByTable = setDefaultObstaclesByTable;
    function insertObstacles(robot, isCMA, targetPosition) {
        if (!obstacles.has(robot)) {
            throw new Error("insertObstacles called without setDefaultObstacles");
        }
        let p = obstacles.get(robot);
        setDefaultObstacles(p.path, robot, targetPosition, p.ignoreBall, p.ignoreGoals, p.ignoreDefenseArea, p.pathRadius, p.stopBallDistance, p.noSeedTarget, p.ignoreOpponentDefenseArea, p.extraBallDistance);
        if (!p.ignoreBallPlacementObstacle) {
            addBallPlacementObstacle(p.path);
        }
        if (!p.ignorePenaltyDistance) {
            addPenaltyObstacle(p.path);
        }
        addRobotObstacles(p.path, robot, targetPosition, p.ignoreFriendlyRobots, p.ignoreOpponentRobots, p.disableOpponentPrediction, isCMA);
        obstacles.delete(robot);
    }
    exports.insertObstacles = insertObstacles;
});
//# sourceMappingURL=pathhelper.js.map