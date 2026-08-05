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

const parentPath = "X:\\root\\A\\Alpha";
const pairedOne = parentPath + "\\1 clip.mp4";
const pairedTwo = parentPath + "\\2 clip.wmv";
const unpairedVideo = parentPath + "\\9 extra.mp4";
const ignoredVideo = parentPath + "\\notes.avi";
const existing = {};

existing[pairedOne.toLowerCase()] = true;
existing[pairedTwo.toLowerCase()] = true;
existing[unpairedVideo.toLowerCase()] = true;
existing[ignoredVideo.toLowerCase()] = true;

fso = {
    FileExists: function(path) {
        return !!existing[String(path).toLowerCase()];
    },
    GetExtensionName: function(path) {
        const match = String(path).match(/\.([^.]*)$/);
        return match ? match[1] : "";
    }
};
enumerateFiles = function(path) {
    check(path === parentPath, "The parent directory should be enumerated.");
    return [pairedOne, pairedTwo, unpairedVideo, ignoredVideo];
};

const parent = {
    path: parentPath,
    galleries: [
        { path: parentPath + "\\1 Gallery", video: pairedOne },
        { path: parentPath + "\\2 Gallery", video: pairedTwo },
        { path: parentPath + "\\3 Gallery", video: "" }
    ]
};
const counts = getParentMediaCounts(parent, parent.galleries);

check(counts.pairs === 2, "Two paired galleries should be counted.");
check(counts.galleries === 1, "One unpaired gallery should be counted.");
check(counts.videos === 1, "One unpaired MP4/WMV should be counted.");
check(
    getParentMediaCounts(parent, parent.galleries) === counts,
    "Media counts should be cached on the parent tile model."
);
check(
    /class="parentStat pairs"/.test(htaText)
        && /class="parentStat galleries"/.test(htaText)
        && /class="parentStat videos"/.test(htaText),
    "The parent thumbnail should render all three media counters."
);

console.log("Parent thumbnail media counts: PASS");
