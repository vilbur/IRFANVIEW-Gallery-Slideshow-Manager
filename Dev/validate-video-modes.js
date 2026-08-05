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
const scriptMatch = htaText.match(
    /<script type="text\/javascript">([\s\S]*?)<\/script>/
);

if (!scriptMatch) {
    throw new Error("HTA JavaScript block not found.");
}

new Function(scriptMatch[1]);
console.log("HTA JavaScript syntax: PASS");

global.window = {
    location: { pathname: "/X:/test/Gallery-Slideshow-Manager.hta" }
};
global.ActiveXObject = function(name) {
    if (name === "Scripting.FileSystemObject") {
        return {
            GetParentFolderName: function() { return "X:\\test"; }
        };
    }

    if (name === "WScript.Shell") {
        return {
            ExpandEnvironmentStrings: function() { return "X:\\temp"; }
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

const labelSpan = { innerText: "" };
const button = {
    className: "",
    title: "",
    attributes: {},
    setAttribute: function(name, value) {
        this.attributes[name] = value;
    },
    getElementsByTagName: function() {
        return [{}, labelSpan];
    }
};
const statusBar = { innerText: "" };
const writes = [];
const commands = [];

global.document = {
    getElementById: function(id) {
        if (id === "videoModeButton") {
            return button;
        }

        if (id === "statusBar") {
            return statusBar;
        }

        return null;
    }
};
setIniValue = function(path, section, key, value) {
    writes.push({ key: key, value: value });
};
ensureBridge = function() { return true; };
sendCommand = function(action, path) {
    commands.push({ action: action, path: path });
};

state.videoMode = "paired";
toggleVideoMode();
check(state.videoMode === "all", "Paired should advance to All.");
check(labelSpan.innerText === "ALL VIDEOS", "All mode needs its label.");
toggleVideoMode();
check(state.videoMode === "auto", "All should advance to Auto.");
check(labelSpan.innerText === "AUTO VIDEOS", "Auto mode needs its label.");
toggleVideoMode();
check(state.videoMode === "none", "Auto should advance to No videos.");
check(!/ active/.test(button.className), "No videos should be grey/unpressed.");
toggleVideoMode();
check(state.videoMode === "paired", "No videos should advance to paired.");
check(/ active/.test(button.className), "Paired mode should be pressed.");
check(
    /No videos/.test(button.title)
        && /All videos/.test(button.title)
        && /Auto videos/.test(button.title),
    "The tooltip should list every video mode."
);
check(
    writes.some(function(write) {
        return write.key === "VideoMode" && write.value === "auto";
    }),
    "The selected VideoMode should be persisted."
);
check(
    commands.length === 4
        && commands.every(function(command) {
            return command.action === "videomodechanged";
        }),
    "Every mode change should be sent to the live bridge."
);
check(
    /parent_changed[\s\S]*sendVideosToVlc\(parent_video_paths\)/.test(bridgeText),
    "The bridge should gate parent playlists on a parent change."
);
check(
    /video_mode = "auto"[\s\S]*parentHasPairedVideo/.test(bridgeText),
    "Auto mode should detect whether the parent has pairs."
);
check(
    /videomodechanged[\s\S]*applyCurrentVideoMode\(\)/.test(bridgeText),
    "The bridge should apply toolbar mode changes immediately."
);
check(
    /closeOtherVlcInstances\(new_vlc_pid\)/.test(bridgeText),
    "A replacement launch should close every older VLC process."
);
check(
    /if \(process_id != protected_vlc_pid\)[\s\S]*Process, Close, %process_id%/.test(bridgeText),
    "Older VLC processes should be closed while the new PID is protected."
);
check(
    /Select ProcessId from Win32_Process where Name='vlc\.exe'/.test(bridgeText),
    "Windowless VLC processes should be included in replacement verification."
);
check(
    /if \(initial_vlc_pids\.Length\(\) = 1\)[\s\S]*return initial_vlc_pids\[1\] = protected_vlc_pid/.test(bridgeText),
    "A sole protected VLC process should return before any close command."
);

console.log("Four-state video mode behavior: PASS");
