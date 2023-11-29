define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getExportName = exports.getExportedOptions = exports.addOption = void 0;
    const getSelectedOptions = amun.getSelectedOptions;
    const supportsDefaultValues = amun.SUPPORTS_OPTION_DEFAULT;
    let options = [];
    let isFirstExecution = true;
    function invertOptionName(name, defaultValue) {
        const INVERTED_OPTION_TAG = " (inverted)";
        if (defaultValue) {
            return name;
        }
        else {
            return name + INVERTED_OPTION_TAG;
        }
    }
    function addOption(name, defaultValue = true) {
        options.push([name, defaultValue]);
        if (!isFirstExecution) {
            throw new Error("Options must be added during the first strategy file execution");
        }
        if (!supportsDefaultValues && defaultValue === false) {
            name = invertOptionName(name, defaultValue);
            return getSelectedOptions().indexOf(name) === -1;
        }
        else {
            return getSelectedOptions().indexOf(name) > -1;
        }
    }
    exports.addOption = addOption;
    function getExportedOptions() {
        isFirstExecution = false;
        if (supportsDefaultValues) {
            return options;
        }
        else {
            let simpleOptions = [];
            for (let option of options) {
                simpleOptions.push(invertOptionName(option[0], option[1]));
            }
            return simpleOptions;
        }
    }
    exports.getExportedOptions = getExportedOptions;
    function getExportName() {
        if (supportsDefaultValues) {
            return "optionsWithDefault";
        }
        else {
            return "options";
        }
    }
    exports.getExportName = getExportName;
});
//# sourceMappingURL=option.js.map