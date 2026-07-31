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

state.searchText = "";
state.ratingFilterMode = "all";
state.ratingFilterValue = -1;
state.ratingFilterValues = {};

const includedParent = {
    name: "included",
    rating: 0,
    keywords: ["red"]
};
const unmatchedParent = {
    name: "unmatched",
    rating: 0,
    keywords: ["blue"]
};
const vetoedParent = {
    name: "vetoed",
    rating: 0,
    keywords: ["red", "blocked"]
};

state.activeFilters = {
    red: "include",
    blocked: "exclude"
};
check(parentMatches(includedParent), "Included parent should match.");
check(!parentMatches(unmatchedParent), "Unmatched include should fail.");
check(!parentMatches(vetoedParent), "Exclude should veto include.");

state.activeFilters = {
    blocked: "exclude"
};
check(
    parentMatches(includedParent),
    "Exclude-only filtering should allow other parents."
);
check(
    !parentMatches(vetoedParent),
    "Exclude-only filtering should reject a matching parent."
);

state.activeFilters = {
    red: true
};
check(
    parentMatches(includedParent) && !parentMatches(unmatchedParent),
    "Legacy boolean filter state should remain an include filter."
);

check(
    filterSignature(["Blue", "red"], ["bad"])
        === filterSignature(["RED", "blue"], ["BAD"]),
    "Filter signatures should be case-insensitive and order-independent."
);

readIni = function() {
    return {
        KeywordFilterPresets: {
            "Preset.Legacy": "red|blue",
            "Preset.Mixed": "red",
            "PresetExclude.Mixed": "blocked"
        }
    };
};
updateFilterPresetControls = function() {};
loadFilterPresets();

const legacyPreset = findFilterPresetById("Preset.Legacy");
const mixedPreset = findFilterPresetById("Preset.Mixed");

check(state.filterPresets.length === 2, "Both presets should load.");
check(
    legacyPreset.includeKeywords.length === 2
        && legacyPreset.excludeKeywords.length === 0,
    "An older include-only preset should load unchanged."
);
check(
    mixedPreset.includeKeywords[0] === "red"
        && mixedPreset.excludeKeywords[0] === "blocked",
    "An include/exclude preset should load both states."
);

const controls = {
    filterPresetName: {
        value: "Mixed filters",
        focus: function() {}
    },
    filterPresetSelect: {
        value: ""
    }
};
let savedSettings = {
    KeywordFilterPresets: {}
};

global.document = {
    getElementById: function(id) {
        return controls[id];
    }
};
readIni = function() {
    return savedSettings;
};
writeIni = function(path, data) {
    savedSettings = data;
    return true;
};
setStatus = function() {};
state.keywords = ["red", "blocked"];
state.activeFilters = {
    red: "include",
    blocked: "exclude"
};
state.filterPresets = [];

check(saveCurrentFilterPreset(), "A mixed filter preset should save.");
check(
    savedSettings.KeywordFilterPresets["Preset.Mixed%20filters"] === "red",
    "The included half of a preset should use the legacy preset key."
);
check(
    savedSettings.KeywordFilterPresets[
        "PresetExclude.Mixed%20filters"
    ] === "blocked",
    "The excluded half of a preset should use its companion key."
);

const keywordInput = {
    value: "blocked",
    focus: function() {}
};
const galleryKeywords = {
    innerText: ""
};
const keywordData = {
    Keywords: {
        List: "red|blocked"
    },
    "Parent.A": {
        Keywords: "red|blocked"
    }
};
savedSettings = {
    KeywordFilterPresets: {
        "Preset.Mixed": "red",
        "PresetExclude.Mixed": "blocked"
    }
};
global.document.getElementById = function(id) {
    if (id === "keywordName") {
        return keywordInput;
    }

    if (id === "galleryKeywords") {
        return galleryKeywords;
    }

    return controls[id];
};
global.prompt = function() {
    return "hidden";
};
global.alert = function(message) {
    throw new Error("Unexpected alert: " + message);
};
state.root = "X:\\root";
state.keywords = ["red", "blocked"];
state.activeFilters = {
    blocked: "exclude"
};
state.parents = [{
    path: "X:\\root\\A",
    keywords: ["red", "blocked"]
}];
state.selectedParent = state.parents[0];
readIni = function(path) {
    return path === settingsPath ? savedSettings : keywordData;
};
writeIni = function(path, data) {
    if (path === settingsPath) {
        savedSettings = data;
    }

    return true;
};
renderKeywordFilters = function() {};
renderParents = function() {};
saveLibraryCache = function() {};

check(renameKeyword(), "An excluded keyword should rename.");
check(
    savedSettings.KeywordFilterPresets["PresetExclude.Mixed"] === "hidden",
    "Renaming should update excluded preset keywords."
);
check(
    state.activeFilters.hidden === "exclude"
        && !state.activeFilters.blocked,
    "Renaming should preserve the active excluded state."
);
check(
    state.parents[0].keywords[1] === "hidden",
    "Renaming should update the in-memory parent assignment."
);

global.document.createElement = function() {
    return {};
};
global.window.setTimeout = function(callback) {
    callback();
    return 1;
};
global.window.clearTimeout = function() {};
global.window.event = {};

state.activeFilters = {};
let filterButton = createKeywordFilterButton("green");
check(
    filterButton.innerHTML.indexOf("keywordFilterMark") < 0,
    "Keyword filter buttons should not contain a checkbox or mark."
);
filterButton.onclick();
check(
    state.activeFilters.green === "include",
    "Left-click should include a neutral keyword."
);

filterButton = createKeywordFilterButton("green");
check(
    filterButton.className.indexOf("include") >= 0,
    "An included keyword should receive the green include class."
);
filterButton.onclick();
check(
    !state.activeFilters.green,
    "Left-click should clear an already included keyword."
);

filterButton = createKeywordFilterButton("red");
filterButton.oncontextmenu();
check(
    state.activeFilters.red === "exclude",
    "Right-click should exclude a neutral keyword."
);

filterButton = createKeywordFilterButton("red");
check(
    filterButton.className.indexOf("exclude") >= 0,
    "An excluded keyword should receive the red exclude class."
);
filterButton.oncontextmenu();
check(
    !state.activeFilters.red,
    "Right-click should clear an already excluded keyword."
);

state.activeFilters.switcher = "exclude";
filterButton = createKeywordFilterButton("switcher");
filterButton.onclick();
check(
    state.activeFilters.switcher === "include",
    "Left-click should switch an excluded keyword to include."
);

filterButton = createKeywordFilterButton("switcher");
filterButton.oncontextmenu();
check(
    state.activeFilters.switcher === "exclude",
    "Right-click should switch an included keyword to exclude."
);

console.log("Keyword filter behavior: PASS");
