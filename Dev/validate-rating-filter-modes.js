const fs = require("fs");
const vm = require("vm");

const htaText = fs.readFileSync(
    "Gallery-Slideshow-Manager.hta",
    "utf8"
);
const scriptMatch = htaText.match(
    /<script type="text\/javascript">([\s\S]*?)<\/script>/
);

if (!scriptMatch) {
    throw new Error("HTA JavaScript block not found.");
}

new Function(scriptMatch[1]);
console.log("HTA JavaScript syntax: PASS");

global.window = {
    location: {
        pathname: "/X:/test/Gallery-Slideshow-Manager.hta"
    }
};
global.ActiveXObject = function(name) {
    if (name === "Scripting.FileSystemObject") {
        return {
            GetParentFolderName: function() {
                return "X:\\test";
            }
        };
    }

    if (name === "WScript.Shell") {
        return {
            ExpandEnvironmentStrings: function() {
                return "X:\\temp";
            },
            RegRead: function() {
                return "850";
            }
        };
    }

    return {};
};

vm.runInThisContext(scriptMatch[1]);

function check(value, message) {
    if (!value) {
        throw new Error(message);
    }
}

check(
    nextRatingFilterMode("exact") === "upto",
    "Exact mode should switch to up-to mode."
);
check(
    nextRatingFilterMode("upto") === "exact",
    "Up-to mode should switch to exact mode."
);
check(
    nextRatingFilterMode("multiple") === "exact"
        && nextRatingFilterMode("all") === "exact",
    "A double-click outside the toggle modes should enter exact mode."
);

let appliedMode = "";
let appliedValue = -1;
applyRatingFilter = function(mode, value) {
    appliedMode = mode;
    appliedValue = value;
};
window.clearTimeout = function() {};

state.ratingFilterClickTimer = 1;
state.ratingFilterMode = "exact";
toggleRatingFilterMode(4);
check(
    appliedMode === "upto" && appliedValue === 4,
    "Double-click should apply the opposite mode to the clicked star."
);

let scheduledDelay = 0;
window.setTimeout = function(callback, delay) {
    scheduledDelay = delay;
    return 1;
};
ratingFilterClickDelayMs = 0;
state.ratingFilterClickTimer = 0;
scheduleRatingFilterToggle(4);
check(
    scheduledDelay === 925,
    "Single-click handling should wait beyond the configured Windows double-click interval."
);

console.log("Rating-filter mode switching: PASS");
console.log("Windows double-click timing protection: PASS");
