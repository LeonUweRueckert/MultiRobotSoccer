define(["require", "exports", "base/amun", "base/debug", "base/protobuf", "base/world"], function (require, exports, amun_1, debug, pb, World) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.runDebugger = void 0;
    const connectDebugger = amun.connectDebugger;
    const debuggerSend = amun.debuggerSend;
    const terminateExecution = amun.terminateExecution;
    const resolveJsToTs = amun.resolveJsToTs;
    const pauseSimulatorOnError = false;
    let exceptionCounter = 0;
    let messageCounter = 0;
    function sendMessage(method, params) {
        messageCounter++;
        let sendObject = {
            id: messageCounter,
            method: method
        };
        if (params) {
            sendObject.params = params;
        }
        const asString = JSON.stringify(sendObject);
        debuggerSend(asString);
    }
    let getPropertiesResponseMap = new Map();
    let scriptInfos = [];
    function handleNotification(notification) {
        let notificationObject = JSON.parse(notification);
        if (!notificationObject.method) {
            (0, amun_1.log)(`Invalid notification from debugger: ${notification}`);
            return;
        }
        switch (notificationObject.method) {
            case "Debugger.scriptParsed":
                scriptInfos.push(notificationObject.params);
                break;
            case "Debugger.paused":
                if (amun.isDebug && pauseSimulatorOnError) {
                    amun.sendCommand({
                        pause_simulator: {
                            reason: pb.amun.PauseSimulatorReason.Ui,
                            pause: true
                        }
                    });
                }
                else {
                    World.haltOwnRobots();
                    World.setRobotCommands();
                }
                getPropertiesResponseMap.clear();
                ___globalpleasedontuseinregularcode.debugSet = debug.set;
                ___globalpleasedontuseinregularcode.debugExtraParams = debug.getInitialExtraParams();
                let pausedInfo = notificationObject.params;
                if (exceptionCounter === 0) {
                    debug.pushtop("Stack trace");
                }
                else {
                    debug.pushtop(`Stack trace ${exceptionCounter}`);
                }
                exceptionCounter += 1;
                debug.set("Globals", undefined);
                let level = 0;
                let globalDumped = false;
                for (let callFrame of pausedInfo.callFrames) {
                    const fileSplit = callFrame.url.split("/");
                    let shortFile = fileSplit[fileSplit.length - 1];
                    shortFile = shortFile.replace(".js", "");
                    let functionName = `${level}: ${shortFile}::`;
                    if (callFrame.functionName.length === 0) {
                        functionName += "<anonymous>";
                    }
                    else {
                        functionName += callFrame.functionName;
                    }
                    if (callFrame.this.objectId) {
                        const evaluate = {
                            callFrameId: callFrame.callFrameId,
                            expression: `amun.debugSet("${functionName}/this", this);`,
                            throwOnSideEffect: false
                        };
                        sendMessage("Debugger.evaluateOnCallFrame", evaluate);
                    }
                    for (let scope of callFrame.scopeChain) {
                        let typeName = `${functionName}/${scope.type}/`;
                        if (scope.type === "global") {
                            if (globalDumped) {
                                continue;
                            }
                            typeName = "Globals/";
                        }
                        if (scope.object.objectId) {
                            getPropertiesResponseMap.set(messageCounter + 1, {
                                baseDebugString: typeName,
                                callFrame: callFrame.callFrameId
                            });
                            let getProperties = {
                                objectId: scope.object.objectId,
                                generatePreview: true,
                                ownProperties: true
                            };
                            sendMessage("Runtime.getProperties", getProperties);
                            getProperties.ownProperties = false;
                            getProperties.accessorPropertiesOnly = true;
                            getPropertiesResponseMap.set(messageCounter + 1, {
                                baseDebugString: typeName,
                                callFrame: callFrame.callFrameId
                            });
                            sendMessage("Runtime.getProperties", getProperties);
                        }
                    }
                    level++;
                }
                if (notificationObject.params.reason === "Script timeout") {
                    amun.log("<font color=\"red\">Script timeout</font>");
                    for (let callFrame of pausedInfo.callFrames) {
                        let resolved = resolveJsToTs(callFrame.url, callFrame.location.lineNumber, callFrame.location.columnNumber);
                        amun.log(`<font color=\"red\">at ${callFrame.functionName} (${resolved})</font>`);
                    }
                    terminateExecution();
                }
                sendMessage("Debugger.resume");
                break;
        }
    }
    function handleResponse(response) {
        const reponseObject = JSON.parse(response);
        if (!reponseObject) {
            (0, amun_1.log)(`Invalid response from debugger: ${response}`);
            return;
        }
        if (getPropertiesResponseMap.has(reponseObject.id)) {
            const propertyResponse = reponseObject.result;
            let responseInfo = getPropertiesResponseMap.get(reponseObject.id);
            for (let property of propertyResponse.result) {
                if (property.name === "___globalpleasedontuseinregularcode") {
                    continue;
                }
                let evaluate = {
                    callFrameId: responseInfo.callFrame,
                    expression: `___globalpleasedontuseinregularcode.debugSet("${responseInfo.baseDebugString}/${property.name}",
					${property.name}, ___globalpleasedontuseinregularcode.debugExtraParams[0], ___globalpleasedontuseinregularcode.debugExtraParams[1]);`,
                    throwOnSideEffect: false
                };
                sendMessage("Debugger.evaluateOnCallFrame", evaluate);
            }
        }
    }
    function messageLoop() {
        sendMessage("Debugger.resume");
    }
    function runDebugger() {
        exceptionCounter = 0;
        if (connectDebugger(handleResponse, handleNotification, messageLoop)) {
            sendMessage("Console.enable");
            sendMessage("Debugger.enable");
            sendMessage("Runtime.enable");
            sendMessage("Debugger.setAsyncCallStackDepth", { maxDepth: 4 });
            sendMessage("Debugger.setPauseOnExceptions", { state: "all" });
        }
    }
    exports.runDebugger = runDebugger;
    runDebugger();
});
//# sourceMappingURL=debugger.js.map