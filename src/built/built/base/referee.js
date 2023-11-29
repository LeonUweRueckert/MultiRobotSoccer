define(["require", "exports", "base/constants", "base/vector", "base/vis", "base/world"], function (require, exports, constants_1, vector_1, vis, World) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hasTooManyOpponentRobots = exports.hasTooManyFriendlyRobots = exports.robotAndPosOfLastBallTouch = exports.opponentTouchedLast = exports.friendlyTouchedLast = exports.checkTouching = exports.lastStateChangeTime = exports.checkStateChange = exports.check = exports.isPlausiblyStillOppFreekick = exports.illustrateRefereeStates = exports.isDefensiveCornerKick = exports.isOffensiveCornerKick = exports.isNonGameStage = exports.isGameState = exports.isFriendlyPenaltyState = exports.isOpponentPenaltyState = exports.isKickoffState = exports.isOpponentKickoffState = exports.isFriendlyKickoffState = exports.isOpponentFreeKickState = exports.isFriendlyFreeKickState = exports.isSlowDriveState = exports.isStopState = void 0;
    const stopStates = {
        Stop: true,
        KickoffDefensivePrepare: true,
        KickoffDefensive: true,
        DirectDefensive: true,
        IndirectDefensive: true,
        BallPlacementDefensive: true,
        BallPlacementOffensive: true
    };
    const slowDriveStates = {
        Stop: true
    };
    const friendlyFreeKickStates = {
        DirectOffensive: true,
        IndirectOffensive: true
    };
    const opponentFreeKickStates = {
        DirectDefensive: true,
        IndirectDefensive: true
    };
    const friendlyKickoffStates = {
        KickoffOffensivePrepare: true,
        KickoffOffensive: true
    };
    const opponentKickoffStates = {
        KickoffDefensivePrepare: true,
        KickoffDefensive: true
    };
    const opponentPenaltyStates = {
        PenaltyDefensivePrepare: true,
        PenaltyDefensive: true,
        PenaltyDefensiveRunning: true
    };
    const friendlyPenaltyStates = {
        PenaltyOffensivePrepare: true,
        PenaltyOffensive: true,
        PenaltyOffensiveRunning: true
    };
    const gameStates = {
        Game: true,
        GameForce: true
    };
    const nonGameStages = {
        FirstHalfPre: true,
        HalfTime: true,
        SecondHalfPre: true,
        ExtraTimeBreak: true,
        ExtraFirstHalfPre: true,
        ExtraHalfTime: true,
        ExtraSecondHalfPre: true,
        PenaltyShootoutBreak: true,
        PostGame: true
    };
    function isStopState(state = World.RefereeState) {
        return stopStates[state];
    }
    exports.isStopState = isStopState;
    function isSlowDriveState(state = World.RefereeState) {
        return slowDriveStates[state];
    }
    exports.isSlowDriveState = isSlowDriveState;
    function isFriendlyFreeKickState(state = World.RefereeState) {
        return friendlyFreeKickStates[state];
    }
    exports.isFriendlyFreeKickState = isFriendlyFreeKickState;
    function isOpponentFreeKickState(state = World.RefereeState) {
        return opponentFreeKickStates[state];
    }
    exports.isOpponentFreeKickState = isOpponentFreeKickState;
    function isFriendlyKickoffState(state = World.RefereeState) {
        return friendlyKickoffStates[state];
    }
    exports.isFriendlyKickoffState = isFriendlyKickoffState;
    function isOpponentKickoffState(state = World.RefereeState) {
        return opponentKickoffStates[state];
    }
    exports.isOpponentKickoffState = isOpponentKickoffState;
    function isKickoffState(state = World.RefereeState) {
        return isFriendlyKickoffState(state) || isOpponentKickoffState(state);
    }
    exports.isKickoffState = isKickoffState;
    function isOpponentPenaltyState(state = World.RefereeState) {
        return opponentPenaltyStates[state];
    }
    exports.isOpponentPenaltyState = isOpponentPenaltyState;
    function isFriendlyPenaltyState(state = World.RefereeState) {
        return friendlyPenaltyStates[state];
    }
    exports.isFriendlyPenaltyState = isFriendlyPenaltyState;
    function isGameState(state = World.RefereeState) {
        return gameStates[state];
    }
    exports.isGameState = isGameState;
    function isNonGameStage() {
        return nonGameStages[World.GameStage];
    }
    exports.isNonGameStage = isNonGameStage;
    let rightLine = World.Geometry.FieldWidthHalf;
    let leftLine = -rightLine;
    let goalLine = World.Geometry.FieldHeightHalf;
    let cornerDist = 0.7;
    function isOffensiveCornerKick() {
        let ballPos = World.Ball.pos;
        let refState = World.RefereeState;
        return (refState === "DirectOffensive" ||
            refState === "IndirectOffensive")
            && goalLine - ballPos.y < cornerDist
            && (leftLine - ballPos.x > -cornerDist || rightLine - ballPos.x < cornerDist);
    }
    exports.isOffensiveCornerKick = isOffensiveCornerKick;
    function isDefensiveCornerKick() {
        let ballPos = World.Ball.pos;
        let refState = World.RefereeState;
        return (refState === "DirectDefensive" ||
            refState === "IndirectDefensive" || refState === "Stop")
            && -goalLine - ballPos.y > -cornerDist
            && (leftLine - ballPos.x > -cornerDist || rightLine - ballPos.x < cornerDist);
    }
    exports.isDefensiveCornerKick = isDefensiveCornerKick;
    function illustrateRefereeStates() {
        if (World.RefereeState === "PenaltyDefensivePrepare" || World.RefereeState === "PenaltyDefensive") {
            vis.addPath("penaltyDistanceAllowed", [new vector_1.Vector(-2, World.Geometry.OwnPenaltyLine), new vector_1.Vector(2, World.Geometry.OwnPenaltyLine)], vis.colors.red);
        }
        else if (World.RefereeState === "PenaltyOffensivePrepare" || World.RefereeState === "PenaltyOffensive") {
            vis.addPath("penaltyDistanceAllowed", [new vector_1.Vector(-2, World.Geometry.PenaltyLine), new vector_1.Vector(2, World.Geometry.PenaltyLine)], vis.colors.red);
        }
        else if (isStopState()) {
            vis.addCircle("stopstateBallDist", World.Ball.pos, 0.5, vis.colors.redHalf, true);
        }
    }
    exports.illustrateRefereeStates = illustrateRefereeStates;
    let couldStillBeFreekick = false;
    function isPlausiblyStillOppFreekick() {
        return couldStillBeFreekick;
    }
    exports.isPlausiblyStillOppFreekick = isPlausiblyStillOppFreekick;
    let posInFreekick;
    let freekickStartTime = World.Time;
    function updateStillFreekick() {
        if ((isOpponentFreeKickState() || isOpponentKickoffState()) && !posInFreekick) {
            posInFreekick = World.Ball.pos;
            freekickStartTime = World.Time;
        }
        const maxFreekickTime = World.DIVISION === "A" ? 5 : 10;
        if (!isGameState() && !isOpponentFreeKickState() &&
            !isOpponentKickoffState()) {
            couldStillBeFreekick = false;
        }
        else if (World.Time - freekickStartTime > maxFreekickTime) {
            couldStillBeFreekick = false;
            posInFreekick = undefined;
        }
        else if (posInFreekick) {
            const maxDist = 0.1;
            couldStillBeFreekick = World.Ball.pos.distanceToSq(posInFreekick) < maxDist * maxDist;
        }
        else {
            couldStillBeFreekick = false;
        }
    }
    let lastTeam = true;
    let lastRobot;
    let lastTouchPos;
    let touchDist = World.Ball.radius + constants_1.maxRobotRadius;
    let fieldHeightHalf = World.Geometry.FieldHeightHalf;
    let fieldWidthHalf = World.Geometry.FieldWidthHalf;
    let noBallTouchStates = {
        Halt: true,
        Stop: true,
        KickoffOffensivePrepare: true,
        KickoffDefensivePrepare: true,
        PenaltyOffensivePrepare: true,
        PenaltyDefensivePrepare: true,
        TimeoutOffensive: true,
        TimeoutDefensive: true,
        BallPlacementDefensive: true,
        BallPlacementOffensive: true
    };
    function check() {
        checkTouching();
        checkStateChange();
        updateStillFreekick();
    }
    exports.check = check;
    let lastState;
    let lastChangedTime;
    function checkStateChange() {
        if (World.RefereeState !== lastState) {
            lastChangedTime = World.Time;
            lastState = World.RefereeState;
        }
    }
    exports.checkStateChange = checkStateChange;
    function lastStateChangeTime() {
        return lastChangedTime;
    }
    exports.lastStateChangeTime = lastStateChangeTime;
    let lastFlightTime = 0;
    function checkTouching() {
        let ballPos = World.Ball.pos;
        if (noBallTouchStates[World.RefereeState] ||
            Math.abs(ballPos.x) > fieldWidthHalf || Math.abs(ballPos.y) > fieldHeightHalf) {
            return;
        }
        if (World.Ball.posZ !== 0) {
            lastFlightTime = World.Time;
            return;
        }
        if (World.Time - lastFlightTime < 0.1) {
            return;
        }
        for (let robot of World.FriendlyRobots) {
            if (robot.pos.distanceTo(ballPos) <= touchDist) {
                lastTeam = true;
                lastRobot = robot;
                lastTouchPos = new vector_1.Vector(ballPos.x, ballPos.y);
                return;
            }
        }
        for (let robot of World.OpponentRobots) {
            if (robot.pos.distanceTo(ballPos) <= touchDist) {
                lastTeam = false;
                lastRobot = robot;
                lastTouchPos = new vector_1.Vector(ballPos.x, ballPos.y);
                return;
            }
        }
    }
    exports.checkTouching = checkTouching;
    function friendlyTouchedLast() {
        return lastTeam;
    }
    exports.friendlyTouchedLast = friendlyTouchedLast;
    function opponentTouchedLast() {
        return !friendlyTouchedLast();
    }
    exports.opponentTouchedLast = opponentTouchedLast;
    function robotAndPosOfLastBallTouch() {
        return [lastRobot, lastTouchPos];
    }
    exports.robotAndPosOfLastBallTouch = robotAndPosOfLastBallTouch;
    function hasTooManyFriendlyRobots() {
        return World.FriendlyRobots.length > World.MaxAllowedFriendlyRobots;
    }
    exports.hasTooManyFriendlyRobots = hasTooManyFriendlyRobots;
    function hasTooManyOpponentRobots() {
        return World.OpponentRobots.length > World.MaxAllowedOpponentRobots;
    }
    exports.hasTooManyOpponentRobots = hasTooManyOpponentRobots;
});
//# sourceMappingURL=referee.js.map