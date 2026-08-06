const fs = require("fs");
const vm = require("vm");

const bridgeText = fs.readFileSync("Gallery-Slideshow-Manager-Bridge.ahk", "utf8");
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
    },
    setTimeout: function(callback) {
        callback();
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

function pathKey(path) {
    return String(path || "").replace(/\//g, "\\").toLowerCase();
}

function parentPath(path) {
    const normalized = String(path || "").replace(/\//g, "\\");
    return normalized.substring(0, normalized.lastIndexOf("\\"));
}

function fileName(path) {
    const normalized = String(path || "").replace(/\//g, "\\");
    return normalized.substring(normalized.lastIndexOf("\\") + 1);
}

const selectedOne = {
    path: "X:\\root\\A\\Parent One",
    name: "Parent One"
};
const selectedTwo = {
    path: "X:\\root\\B\\Parent Two",
    name: "Parent Two"
};
const unselected = {
    path: "X:\\root\\C\\Parent Three",
    name: "Parent Three"
};
const existingFolders = {};

[selectedOne, selectedTwo, unselected].forEach(function(parent) {
    existingFolders[pathKey(parent.path)] = true;
});

const deletedPaths = [];
fso = {
    GetAbsolutePathName: function(path) {
        return String(path || "").replace(/\//g, "\\");
    },
    GetParentFolderName: parentPath,
    GetFileName: fileName,
    FolderExists: function(path) {
        return !!existingFolders[pathKey(path)];
    },
    DeleteFolder: function(path, force) {
        check(force === true, "Parent deletion should include folder contents.");
        check(existingFolders[pathKey(path)], "Only an existing parent may be deleted.");
        delete existingFolders[pathKey(path)];
        deletedPaths.push(path);
    }
};

state.root = "X:\\root";
state.parents = [selectedOne, selectedTwo, unselected];
state.selectedParent = selectedTwo;
state.selectedParentPaths = {};
state.selectedParentPaths[parentSelectionKey(selectedOne)] = true;
state.selectedParentPaths[parentSelectionKey(selectedTwo)] = true;
state.currentParentPath = "";
state.rememberedParentPath = selectedOne.path;

const keywordPath = state.root + "\\" + keywordIniName;
const ratingPath = state.root + "\\" + ratingIniName;
const keywordData = {};
const ratingData = {};

keywordData[encodeParentSection(selectedOne.path)] = { Keywords: "Blue" };
keywordData[encodeParentSection(selectedTwo.path)] = { Keywords: "Red" };
keywordData[encodeParentSection(unselected.path)] = { Keywords: "Green" };
ratingData[encodeParentSection(selectedOne.path)] = { Rating: "3" };
ratingData[encodeParentSection(selectedTwo.path)] = { Rating: "4" };
ratingData[encodeParentSection(unselected.path)] = { Rating: "5" };

const iniData = {};
iniData[pathKey(keywordPath)] = keywordData;
iniData[pathKey(ratingPath)] = ratingData;
readIni = function(path) {
    return iniData[pathKey(path)] || {};
};
writeIni = function(path, data) {
    iniData[pathKey(path)] = data;
    return true;
};
setIniValue = function() {
    return true;
};

let confirmationText = "";
global.confirm = function(message) {
    confirmationText = message;
    return true;
};
global.alert = function(message) {
    throw new Error("Unexpected alert: " + message);
};

let statusText = "";
setStatus = function(message) {
    statusText = message;
};
scanLibrary = function() {
    state.parents = [unselected];
    state.selectedParent = null;
    state.selectedParentPaths = {};
};

check(
    deleteSelectedParentGalleries(),
    "Confirmed selected-parent deletion should succeed."
);
check(
    confirmationText.indexOf("PERMANENTLY delete 2 selected parent galleries") >= 0
        && confirmationText.indexOf("Parent One") >= 0
        && confirmationText.indexOf("Parent Two") >= 0
        && confirmationText.indexOf("cannot be undone") >= 0,
    "Confirmation should identify the selected parents and irreversible scope."
);
check(
    deletedPaths.length === 2
        && !existingFolders[pathKey(selectedOne.path)]
        && !existingFolders[pathKey(selectedTwo.path)],
    "Every selected parent folder should be deleted exactly once."
);
check(
    existingFolders[pathKey(unselected.path)],
    "An unselected parent folder must remain untouched."
);
check(
    !keywordData[encodeParentSection(selectedOne.path)]
        && !keywordData[encodeParentSection(selectedTwo.path)]
        && keywordData[encodeParentSection(unselected.path)],
    "Only deleted parents' keyword metadata should be removed."
);
check(
    !ratingData[encodeParentSection(selectedOne.path)]
        && !ratingData[encodeParentSection(selectedTwo.path)]
        && ratingData[encodeParentSection(unselected.path)],
    "Only deleted parents' rating metadata should be removed."
);
check(
    statusText.indexOf("Deleted 2 selected parent galleries") >= 0,
    "Deletion should report the successful selected-parent count."
);
check(
    htaText.indexOf('id="restoreCropButton"')
        < htaText.indexOf('id="deleteSelectedParentsButton"'),
    "Delete Selected should appear directly after Restore Crop."
);
check(
    htaText.indexOf("fso.DeleteFolder(targetPath, true);") >= 0
        && htaText.indexOf("isDirectParentGalleryPath(parent.path)") >= 0
        && htaText.indexOf('sendCommand("stopcurrent", "")') >= 0
        && bridgeText.indexOf('command_action = "stopcurrent"') >= 0
        && bridgeText.indexOf("clearRunningSessionState()") >= 0,
    "Deletion should enforce parent-depth validation and close an active slideshow."
);

console.log("Selected-parent confirmed deletion safety: PASS");
