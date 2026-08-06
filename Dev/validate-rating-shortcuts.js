const fs = require("fs");
const vm = require("vm");

const htaText = fs.readFileSync(
    "Gallery-Slideshow-Manager.hta",
    "utf8"
);
const bridgeText = fs.readFileSync(
    "Gallery-Slideshow-Manager-Bridge.ahk",
    "utf8"
);
const assistantText = fs.readFileSync(
    "Slideshow-Assistant.ahk",
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
    rating: 0,
    keywords: ["Blue"]
};
const parentB = {
    name: "Beta",
    path: "X:\\root\\B\\Beta",
    rating: 0,
    keywords: []
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

let keywordData = {
    Keywords: { List: "Blue|Red" }
};
keywordData[encodeParentSection(parentA.path)] = {
    Keywords: "Blue"
};

readIni = function() {
    return keywordData;
};
writeIni = function(path, data) {
    keywordData = data;
    return true;
};
refreshParentKeywordPresentation = function(parent, words) {
    parent.keywords = words;
    return true;
};
scheduleLibraryCacheSave = function() {};

check(
    toggleParentsKeyword(getSelectedParents(), "Red", true),
    "A keyword should be assignable to the full thumbnail selection."
);
check(
    parentA.keywords.indexOf("Red") >= 0
        && parentB.keywords.indexOf("Red") >= 0,
    "Every selected parent should receive the keyword in memory."
);
check(
    parseKeywordList(
        keywordData[encodeParentSection(parentA.path)].Keywords
    ).indexOf("Red") >= 0
        && parseKeywordList(
            keywordData[encodeParentSection(parentB.path)].Keywords
        ).indexOf("Red") >= 0,
    "Every selected parent should persist the assigned keyword."
);

check(
    toggleParentsKeyword(getSelectedParents(), "Blue", false),
    "A keyword should be removable from the full thumbnail selection."
);
check(
    parentA.keywords.indexOf("Blue") < 0
        && parentB.keywords.indexOf("Blue") < 0,
    "Every selected parent should have the keyword removed."
);

console.log("Selected-parent keyword assignment: PASS");

check(
    bridgeText.indexOf("#If isManagedViewerToggleActive()") >= 0
        && bridgeText.indexOf("$^LWin::") >= 0
        && bridgeText.indexOf("$^RWin::") >= 0
        && bridgeText.indexOf("$LWin::") < 0
        && bridgeText.indexOf("$RWin::") < 0,
    "Only Ctrl+Windows should use the managed viewer toggle context."
);
check(
    bridgeText.indexOf("handleManagedViewerWinKey") < 0
        && bridgeText.indexOf("SendInput, {Blind}{vkE8}") < 0,
    "The viewer toggle should not synthesize or mask a plain Windows-key tap."
);
check(
    bridgeText.indexOf("if (remote_open)") >= 0
        && bridgeText.indexOf("getManagedIrfanViewWindowId()") >= 0
        && bridgeText.indexOf("getManagedVlcWindowId()") >= 0,
    "The toggle should validate managed windows and respect Remote input isolation."
);
const irfanActivationStart = bridgeText.indexOf(
    "activateManagedIrfanViewPreservingDisplayState(window_id)"
);
const viewerToggleStart = bridgeText.indexOf(
    "toggleManagedViewerWindow()",
    irfanActivationStart
);
const irfanActivationBody = bridgeText.slice(
    irfanActivationStart,
    viewerToggleStart
);
check(
    irfanActivationStart >= 0
        && bridgeText.indexOf(
            "activateManagedIrfanViewPreservingDisplayState(irfanview_window_id)"
        ) >= 0
        && irfanActivationBody.indexOf("WinActivate") >= 0
        && irfanActivationBody.indexOf("SendInput") < 0
        && irfanActivationBody.indexOf("Send,") < 0
        && irfanActivationBody.indexOf("ControlSend") < 0,
    "Returning from VLC should preserve IrfanView display state without sending a viewer key."
);
console.log("Managed viewer Ctrl+Windows toggle: PASS");

check(
    htaText.indexOf('id="shortcutHelpOverlay"') >= 0
        && htaText.indexOf("function keyboardShortcutHelpText()") >= 0
        && htaText.indexOf("if (keyCode === 112)") >= 0,
    "F1 should toggle the manager keyboard-shortcut overlay."
);
check(
    bridgeText.indexOf("$F1::") >= 0
        && bridgeText.indexOf("showKeyboardShortcutHelp()") >= 0
        && bridgeText.indexOf(
            "Gallery Slideshow Manager - Keyboard shortcuts"
        ) >= 0,
    "F1 should show keyboard help from managed IrfanView or VLC."
);
check(
    htaText.indexOf('"MANAGER"') >= 0
        && htaText.indexOf('"SLIDESHOW NAVIGATION"') >= 0
        && htaText.indexOf('"SLIDESHOW ASSISTANT — IMAGE CONTROLS"') >= 0
        && htaText.indexOf('"REMOTE"') >= 0
        && bridgeText.indexOf("SLIDESHOW ASSISTANT - IMAGE CONTROLS") >= 0,
    "Both help surfaces should contain all four shortcut sections."
);
check(
    assistantText.indexOf("$*Space::") >= 0
        && assistantText.indexOf("$*Backspace::") >= 0
        && assistantText.indexOf("*Del::") >= 0
        && assistantText.indexOf("$a::") >= 0
        && assistantText.indexOf("*q::") >= 0
        && assistantText.indexOf("$^f::") >= 0
        && htaText.indexOf('"Space — Next image"') >= 0
        && htaText.indexOf('"Delete — Move the current image safely to _DELETE, then continue"') >= 0
        && htaText.indexOf('"Ctrl+F — Copy the current image as the parent folder.jpg"') >= 0,
    "The F1 reference should cover the active Slideshow Assistant controls."
);
console.log("Combined F1 keyboard-shortcut help: PASS");
