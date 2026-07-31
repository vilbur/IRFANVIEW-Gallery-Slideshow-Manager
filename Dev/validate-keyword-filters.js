const fs = require("fs");
const vm = require("vm");

const htaText = fs.readFileSync(
    "Gallery-Slideshow-Manager.hta",
    "utf8"
);
const keywordWindowText = fs.readFileSync(
    "Gallery-Slideshow-Manager-Keywords.hta",
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
const keywordWindowScriptMatch = keywordWindowText.match(
    /<script type="text\/javascript">([\s\S]*?)<\/script>/
);

if (!scriptMatch) {
    throw new Error("HTA JavaScript block not found.");
}

new Function(scriptMatch[1]);
console.log("HTA JavaScript syntax: PASS");

if (!keywordWindowScriptMatch) {
    throw new Error("Dedicated keyword-window JavaScript block not found.");
}

new Function(keywordWindowScriptMatch[1]);
console.log("Keyword-window JavaScript syntax: PASS");

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

const keywordWindowContext = {
    window: {
        location: {
            pathname: "/X:/test/Gallery-Slideshow-Manager-Keywords.hta"
        }
    },
    screen: {
        availWidth: 1920,
        availHeight: 1080
    },
    ActiveXObject: function(name) {
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
    }
};
vm.createContext(keywordWindowContext);
vm.runInContext(keywordWindowScriptMatch[1], keywordWindowContext);

function check(value, message) {
    if (!value) {
        throw new Error(message);
    }
}

state.searchText = "";
state.ratingFilterMode = "all";
state.ratingFilterValue = -1;
state.ratingFilterValues = {};
state.keywordMatchMode = "any";

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
const allIncludedParent = {
    name: "all-included",
    rating: 0,
    keywords: ["red", "blue"]
};
const allIncludedVetoedParent = {
    name: "all-included-vetoed",
    rating: 0,
    keywords: ["red", "blue", "blocked"]
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

state.activeFilters = {
    red: "include",
    blue: "include",
    blocked: "exclude"
};
state.keywordMatchMode = "any";
check(
    parentMatches(includedParent) && parentMatches(unmatchedParent),
    "ANY mode should accept a parent matching either included keyword."
);
state.keywordMatchMode = "all";
check(
    !parentMatches(includedParent)
        && parentMatches(allIncludedParent)
        && !parentMatches(allIncludedVetoedParent),
    "ALL mode should require every include while exclusions still veto."
);
state.keywordMatchMode = "any";

check(
    filterSignature(["Blue", "red"], ["bad"])
        === filterSignature(["RED", "blue"], ["BAD"]),
    "Filter signatures should be case-insensitive and order-independent."
);
check(
    filterSignature(["red"], [], "all")
        !== filterSignature(["red"], [], "any"),
    "ALL and ANY combinations should have distinct preset signatures."
);

readIni = function() {
    return {
        KeywordFilterPresets: {
            "Preset.Legacy": "red|blue",
            "Preset.Mixed": "red",
            "PresetExclude.Mixed": "blocked",
            "PresetMatchMode.Mixed": "all"
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
        && legacyPreset.excludeKeywords.length === 0
        && legacyPreset.matchMode === "any",
    "An older include-only preset should load unchanged."
);
check(
    mixedPreset.includeKeywords[0] === "red"
        && mixedPreset.excludeKeywords[0] === "blocked"
        && mixedPreset.matchMode === "all",
    "An include/exclude preset should load both states."
);

const controls = {
    filterPresetName: {
        value: "Mixed filters",
        focus: function() {}
    },
    filterPresetSelect: {
        value: ""
    },
    keywordMatchModeButton: {
        className: "",
        title: ""
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
state.keywordMatchMode = "all";
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
check(
    savedSettings.KeywordFilterPresets[
        "PresetMatchMode.Mixed%20filters"
    ] === "all",
    "A saved preset should retain ALL matching mode."
);
updateKeywordMatchModeButton();
check(
    controls.keywordMatchModeButton.className.indexOf("matchAll") >= 0,
    "The ALL/ANY button should visibly identify ALL mode."
);

const keywordInput = {
    value: "~ blocked",
    focus: function() {},
    select: function() {}
};
const galleryKeywords = {
    innerText: ""
};
const keywordData = {
    Keywords: {
        List: "red|~blocked"
    },
    "Parent.A": {
        Keywords: "red|~blocked"
    }
};
savedSettings = {
    KeywordFilterPresets: {
        "Preset.Mixed": "red",
        "PresetExclude.Mixed": "~blocked"
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
let renamePromptDefault = "";
global.prompt = function(message, defaultValue) {
    renamePromptDefault = defaultValue;
    return "@ hidden";
};
global.alert = function(message) {
    throw new Error("Unexpected alert: " + message);
};
state.root = "X:\\root";
state.keywords = ["red", "~blocked"];
state.activeFilters = {
    "~blocked": "exclude"
};
state.parents = [{
    path: "X:\\root\\A",
    keywords: ["red", "~blocked"]
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

state.keywordMatchMode = "all";
toggleKeywordMatchMode();
check(
    state.keywordMatchMode === "any"
        && savedSettings.Options.KeywordMatchMode === "any",
    "The ALL/ANY toggle should persist ANY mode."
);
toggleKeywordMatchMode();
check(
    state.keywordMatchMode === "all"
        && savedSettings.Options.KeywordMatchMode === "all",
    "The ALL/ANY toggle should persist ALL mode."
);

check(renameKeyword(), "An excluded keyword should rename.");
check(
    renamePromptDefault === "~ blocked",
    "The rename prompt should separate the prefix from the keyword name."
);
check(
    savedSettings.KeywordFilterPresets["PresetExclude.Mixed"] === "@hidden",
    "Renaming should update excluded preset keywords and their prefix."
);
check(
    state.activeFilters["@hidden"] === "exclude"
        && !state.activeFilters["~blocked"],
    "Renaming should preserve the active excluded state under the new prefix."
);
check(
    state.parents[0].keywords[1] === "@hidden",
    "Renaming should update the prefix-bound in-memory parent assignment."
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
check(
    filterButton.title.indexOf("LMB include · RMB exclude") >= 0,
    "Each keyword button should expose include/exclude help in its tooltip."
);
check(
    htaText.indexOf('id="keywordFilterHint"') < 0
        && htaText.indexOf('<span class="label">Filter</span>') < 0,
    "The visible Filter and mouse-help labels should be removed."
);
check(
    htaText.indexOf('id="keywordMatchModeButton"') >= 0
        && htaText.indexOf('id="keywordMatchModeButton"')
            < htaText.indexOf('<span class="label">Keyword</span>'),
    "The ALL/ANY button should be prepended to the keyword controls row."
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

function flattenKeywordGroups(groups) {
    var flattened = [];
    var groupIndex;
    var wordIndex;

    for (groupIndex = 0; groupIndex < groups.length; groupIndex++) {
        for (
            wordIndex = 0;
            wordIndex < groups[groupIndex].words.length;
            wordIndex++
        ) {
            flattened.push(groups[groupIndex].words[wordIndex]);
        }
    }

    return flattened;
}

const symbolKeywords = [
    "?later",
    "&Other",
    "@beta",
    "#lower",
    "~z",
    "+more",
    "$money",
    "plain",
    "!UPPER",
    "@Capital",
    "%rate",
    "~ALPHA"
];
const expectedKeywordOrder = [
    "~ALPHA",
    "~z",
    "@Capital",
    "@beta",
    "!UPPER",
    "#lower",
    "$money",
    "%rate",
    "&Other",
    "+more",
    "?later",
    "plain"
];
const orderedKeywordGroups = groupedKeywords(symbolKeywords);
const orderedKeywords = flattenKeywordGroups(orderedKeywordGroups);
const reverseSourceOrder = flattenKeywordGroups(
    groupedKeywords(symbolKeywords.slice(0).reverse())
);

check(
    orderedKeywords.join("|") === expectedKeywordOrder.join("|"),
    "Special-prefix keywords should follow the fixed symbol-first order."
);
check(
    reverseSourceOrder.join("|") === expectedKeywordOrder.join("|"),
    "Special-prefix order should not depend on source-list order."
);
check(
    orderedKeywordGroups[0].isSpecial
        && orderedKeywordGroups[0].specialCharacter === "~"
        && orderedKeywordGroups[0].words.join("|") === "~ALPHA|~z",
    "Each special character should produce one labeled keyword row."
);
check(
    htaText.indexOf("prefix.innerText = group.isSpecial") >= 0,
    "Every main keyword row should reserve the shared prefix column."
);
check(
    keywordControlText("~ALPHA") === "ALPHA"
        && keywordControlText("plain") === "plain",
    "Control captions should omit a special prefix only."
);
check(
    keywordEditText("~ALPHA") === "~ ALPHA"
        && keywordFromEditText(" @  Changed ") === "@Changed",
    "Keyword edit text should add one separator and remove it when saved."
);
const prefixedBadgeWords = [
    "~ TILDE",
    "@ AT",
    "! BANG",
    "# HASH",
    "$ DOLLAR",
    "% PERCENT",
    "& AMPERSAND",
    "+ PLUS"
];
const prefixedBadgeHtml = keywordBadgeHtml(prefixedBadgeWords);
check(
    prefixedBadgeHtml === [
        "TILDE",
        "AT",
        "BANG",
        "HASH",
        "DOLLAR",
        "PERCENT",
        "AMPERSAND",
        "PLUS"
    ].map(function(word) {
        return '<span class="keywordBadge">' + word + '</span>';
    }).join(""),
    "Thumbnail keyword badges should hide every special-character prefix."
);
check(
    htaText.indexOf("label.innerText = keywordControlText(word);") >= 0,
    "Keyword-window buttons should use prefix-free control captions."
);

filterButton = createKeywordFilterButton("~green");
check(
    filterButton.innerHTML.indexOf("~") < 0
        && filterButton.innerHTML.indexOf("green") >= 0,
    "Main keyword buttons should hide the special prefix."
);
check(
    filterButton.title.indexOf("~ green") >= 0,
    "The keyword tooltip should retain the readable prefix-bound name."
);
filterButton.ondblclick();
check(
    keywordInput.value === "~ green",
    "Renaming should receive the complete prefix-bound keyword name."
);

check(
    htaText.indexOf(
        'id="contextMenu" class="keywordMenuSurface" '
        + 'onclick="window.event.cancelBubble=true;"'
    ) >= 0
        && htaText.indexOf("clickEvent.cancelBubble = true;") >= 0,
    "Keyword clicks should stay inside the open right-click menu."
);
check(
    htaText.indexOf('ratingCount.className = "contextRatingCount";') >= 0
        && htaText.indexOf(
            "menu._keywordRatingCount.innerText = String(parentRating);"
        ) >= 0,
    "The right-click keyword menu should display the numeric parent rating."
);
check(
    keywordIniName === "gallery-keywords.ini"
        && keywordIniPath() === "X:\\root\\gallery-keywords.ini"
        && keywordIniPath() !== ratingIniPath()
        && keywordIniPath() !== settingsPath,
    "Keyword definitions and assignments should stay in their dedicated file."
);
check(
    keywordWindowText.indexOf('applicationname="Gallery Slideshow Keywords"') >= 0
        && keywordWindowText.indexOf('showintaskbar="no"') >= 0
        && keywordWindowText.indexOf('singleinstance="no"') >= 0,
    "The slideshow keyword UI should be a separate lightweight HTA window."
);
check(
    keywordWindowText.indexOf("function fitAndPlaceWindow()") >= 0
        && keywordWindowText.indexOf("state.screenX - outerWidth - gap") >= 0
        && keywordWindowText.indexOf("state.screenY - outerHeight - gap") >= 0,
    "The slideshow keyword window should flip around the cursor when space is limited."
);
check(
    keywordWindowText.indexOf("label.innerText = keywordControlText(word);") >= 0
        && keywordWindowText.indexOf('className = "keywordButton"') >= 0,
    "The dedicated window should retain the main keyword-menu captions and styling."
);
const sharedOrderingInput = [
    "lower",
    "Capital",
    "UPPER",
    "~z",
    "~ALPHA",
    "@Beta",
    "123"
];
const managerOrdering = groupedKeywords(sharedOrderingInput).map(function(group) {
    return group.words.join("|");
});
const windowOrdering = keywordWindowContext
    .groupedKeywords(sharedOrderingInput)
    .map(function(group) {
        return group.words.join("|");
    });
check(
    managerOrdering.join("\n") === windowOrdering.join("\n"),
    "Manager and slideshow keyword windows should use the same deterministic order."
);
keywordWindowContext.state.root = "X:\\root";
check(
    keywordWindowContext.encodeParentSection("X:\\root\\A\\Parent")
        === encodeParentSection("X:\\root\\A\\Parent"),
    "Manager and slideshow keyword windows should encode parent sections identically."
);
check(
    bridgeText.indexOf("Gallery-Slideshow-Manager-Keywords.hta") >= 0
        && bridgeText.indexOf('DllCall("SetWindowLongPtr"') >= 0
        && bridgeText.indexOf("ensureHtmlManagerForKeywordPopup") < 0,
    "IrfanView right-click should launch and own the dedicated window without activating the manager."
);
check(
    assistantText.indexOf("Keywords - Gallery Slideshow ahk_exe mshta.exe") >= 0,
    "Automatic slideshow navigation should pause for the dedicated keyword window."
);

console.log("Keyword filter behavior: PASS");
