define(["require", "exports", "base/amun", "base/protobuf", "base/referee", "base/world"], function (require, exports, amun_1, protobuf_1, Referee, World) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sendAdvantageReponse = exports.requestSubstitution = exports.requestDesiredKeeper = exports.isConnected = exports._update = void 0;
    const amunLocal = amun;
    let state = "UNCONNECTED";
    let message = undefined;
    function _update() {
        message = undefined;
        if (!World.IsReplay && World.TeamName === "ER-Force" && (World.OpponentTeamName !== "ER-Force" || World.TeamIsBlue)) {
            if (amunLocal.connectGameController()) {
                if (state === "UNCONNECTED") {
                    state = "CONNECTED";
                    amun.log("Connect to gameController");
                    amunLocal.sendGameControllerMessage("TeamRegistration", { team_name: "ER-Force" });
                }
                message = amunLocal.getGameControllerMessage();
            }
            else {
                state = "UNCONNECTED";
            }
        }
    }
    exports._update = _update;
    function isConnected() {
        return state === "CONNECTED";
    }
    exports.isConnected = isConnected;
    function requestDesiredKeeper(id) {
        if (World.RefereeState !== "Stop") {
            (0, amun_1.throwInDebug)("Trying to change keeper while not in STOP. The request would be rejected");
        }
        amunLocal.sendGameControllerMessage("TeamToController", { desired_keeper: id });
    }
    exports.requestDesiredKeeper = requestDesiredKeeper;
    function requestSubstitution() {
        amunLocal.sendGameControllerMessage("TeamToController", { substitute_bot: true });
    }
    exports.requestSubstitution = requestSubstitution;
    function sendAdvantageReponse(resp) {
        if (amunLocal.isDebug && !Referee.hasTooManyOpponentRobots()) {
            throw new Error("Trying to send advantage reponse while no foul occured. This will be rejected");
        }
        amunLocal.sendGameControllerMessage("TeamToController", {
            advantage_choice: resp === "continue"
                ? protobuf_1.gameController.AdvantageChoice.CONTINUE
                : protobuf_1.gameController.AdvantageChoice.STOP
        });
    }
    exports.sendAdvantageReponse = sendAdvantageReponse;
});
//# sourceMappingURL=gamecontroller.js.map