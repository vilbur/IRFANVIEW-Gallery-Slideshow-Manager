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

const parentA = {
    name: "Alpha",
    path: "X:\\root\\A\\Alpha",
    rating: 0
};
const parentB = {
    name: "Beta",
    path: "X:\\root\\B\\Beta",
    rating: 0
};

state.root = "X:\\root";
state.parents = [parentA, parentB];
state.selectedParent = null;
state.selectedParentPaths = {};
state.currentParentPath = parentB.path;

renderParents = function() {};
rememberParentSelection = function() {
    return true;
};
setStatus = function() {};

setOnlyParentSelected(parentA);
toggleParentSelection(parentB);
check(getSelectedParents().length === 2, "Ctrl-click should add a parent.");

toggleParentSelection(parentB);
check(
    getSelectedParents().length === 1
        && isParentSelected(parentA),
    "Ctrl-click should remove one parent without clearing the others."
);

toggleParentSelection(parentA);
check(
    getSelectedParents().length === 0
        && state.selectedParent === null,
    "The last selected parent should be removable."
);

setOnlyParentSelected(parentA);
toggleParentSelection(parentB);

let ratingData = {};
let sessionData = { Session: {} };
readIni = function(path) {
    return path === ratingIniPath() ? ratingData : sessionData;
};
writeIni = function(path, data) {
    if (path === ratingIniPath()) {
        ratingData = data;
    } else {
        sessionData = data;
    }
    return true;
};

check(assignSelectedParentRating(7), "Rating assignment should succeed.");
check(
    parentA.rating === 7 && parentB.rating === 7,
    "Every selected parent should update in memory."
);
check(
    ratingData[encodeParentSection(parentA.path)].Rating === "7"
        && ratingData[encodeParentSection(parentB.path)].Rating === "7",
    "Every selected parent should persist its rating."
);
check(
    sessionData.Session.CurrentParentRating === "7"
        && sessionData.Session.RatingRevision,
    "The shared session should receive the current rating and revision."
);

check(assignSelectedParentRating(0), "Rating clearing should succeed.");
check(
    !ratingData[encodeParentSection(parentA.path)]
        && !ratingData[encodeParentSection(parentB.path)],
    "Ctrl+0 should remove empty rating sections."
);

console.log("Parent multi-selection behavior: PASS");
console.log("Selected-parent rating persistence: PASS");
