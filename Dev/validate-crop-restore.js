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

function pathKey(path) {
    return String(path || "").toLowerCase();
}

function fileName(path) {
    var normalized = String(path || "").replace(/\//g, "\\");
    return normalized.substring(normalized.lastIndexOf("\\") + 1);
}

const parentOne = {
    path: "X:\\root\\A\\Parent One",
    name: "Parent One"
};
const parentTwo = {
    path: "X:\\root\\B\\Parent Two",
    name: "Parent Two"
};
const galleryOne = parentOne.path + "\\Gallery One";
const galleryTwo = parentTwo.path + "\\Gallery Two";
const cropOne = galleryOne + "\\_CROP";
const cropTwo = galleryTwo + "\\_CROP";
const sourceOne = cropOne + "\\photo.jpg";
const sourceTwo = cropTwo + "\\second.png";
const ignoredText = cropTwo + "\\notes.txt";
const requestedOne = galleryOne + "\\photo.jpg";
const firstSuffix = galleryOne + "\\photo - Restored.jpg";
const secondSuffix = galleryOne + "\\photo - Restored 2.jpg";
const requestedTwo = galleryTwo + "\\second.png";

const existing = {};
[
    parentOne.path,
    parentTwo.path,
    galleryOne,
    galleryTwo,
    cropOne,
    cropTwo,
    sourceOne,
    sourceTwo,
    ignoredText,
    requestedOne,
    firstSuffix
].forEach(function(path) {
    existing[pathKey(path)] = true;
});

const copyCalls = [];
fso = {
    FileExists: function(path) {
        return !!existing[pathKey(path)];
    },
    FolderExists: function(path) {
        return !!existing[pathKey(path)];
    },
    GetParentFolderName: function(path) {
        var normalized = String(path).replace(/\//g, "\\");
        return normalized.substring(0, normalized.lastIndexOf("\\"));
    },
    GetFileName: fileName,
    GetBaseName: function(path) {
        var name = fileName(path);
        var dot = name.lastIndexOf(".");
        return dot > 0 ? name.substring(0, dot) : name;
    },
    GetExtensionName: function(path) {
        var name = fileName(path);
        var dot = name.lastIndexOf(".");
        return dot >= 0 ? name.substring(dot + 1) : "";
    },
    CopyFile: function(source, destination, overwrite) {
        check(overwrite === false, "Restore copies must disable overwrite.");
        check(existing[pathKey(source)], "Restore source must exist.");
        check(!existing[pathKey(destination)], "Restore destination must be unique.");
        existing[pathKey(destination)] = true;
        copyCalls.push({
            source: source,
            destination: destination,
            overwrite: overwrite
        });
    }
};

check(
    uniqueCropRestoreDestinationPath(requestedOne) === secondSuffix,
    "Conflicting restore names should advance to the second unique suffix."
);

getSelectedParents = function() {
    return [parentOne, parentTwo];
};
enumerateSubfolders = function(parentPath) {
    if (pathKey(parentPath) === pathKey(parentOne.path)) {
        return [galleryOne];
    }

    if (pathKey(parentPath) === pathKey(parentTwo.path)) {
        return [galleryTwo];
    }

    return [];
};
enumerateFiles = function(folderPath) {
    if (pathKey(folderPath) === pathKey(cropOne)) {
        return [sourceOne];
    }

    if (pathKey(folderPath) === pathKey(cropTwo)) {
        return [sourceTwo, ignoredText];
    }

    return [];
};

global.confirm = function() {
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
    state.parents = [parentOne, parentTwo];
};
renderParents = function() {};

state.parents = [parentOne, parentTwo];
state.selectedParent = parentTwo;
state.selectedParentPaths = {};
state.selectedParentPaths[parentSelectionKey(parentOne)] = true;
state.selectedParentPaths[parentSelectionKey(parentTwo)] = true;

check(
    restoreSelectedCropBackups(),
    "Crop backups should restore for every selected parent."
);
check(copyCalls.length === 2, "Only supported image backups should copy.");
check(
    copyCalls[0].destination === secondSuffix
        && copyCalls[1].destination === requestedTwo,
    "Restore should suffix only collisions and preserve available names."
);
check(
    existing[pathKey(sourceOne)] && existing[pathKey(sourceTwo)],
    "Restore must retain every _CROP source."
);
check(
    state.selectedParentPaths[parentSelectionKey(parentOne)]
        && state.selectedParentPaths[parentSelectionKey(parentTwo)],
    "Library refresh should restore the complete parent selection."
);
check(
    statusText.indexOf("Restored 2 image backup(s)") >= 0,
    "Restore should report the number of copied images."
);
check(
    htaText.indexOf('id="restoreCropButton"') >= 0
        && htaText.indexOf("openCurrentParent()")
            < htaText.indexOf('id="restoreCropButton"'),
    "Restore Crop should appear beside Open parent folder."
);
check(
    htaText.indexOf("fso.CopyFile(sourcePath, destinationPath, false);") >= 0
        && htaText.indexOf('galleryPath + "\\\\_CROP"') >= 0,
    "Restore must copy from gallery _CROP folders with overwrite disabled."
);

console.log("Selected-parent crop restore safety: PASS");