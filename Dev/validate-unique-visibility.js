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
    location: {
        pathname: "/X:/test/Gallery-Slideshow-Manager.hta"
    }
};
global.ActiveXObject = function(name) {
    if (name === "Scripting.FileSystemObject") {
        return {
            GetParentFolderName: function(path) {
                return String(path).replace(/\\[^\\]+$/, "");
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

function parent(name, galleryNames) {
    return {
        path: "X:\\library\\" + name,
        name: name,
        rating: 0,
        keywords: [],
        galleries: galleryNames.map(function(galleryName) {
            return {
                path:
                    "X:\\library\\"
                    + name
                    + "\\"
                    + galleryName,
                name: galleryName
            };
        })
    };
}

state.searchText = "";
state.ratingFilterMode = "all";
state.ratingFilterValue = -1;
state.ratingFilterValues = {};
state.activeFilters = {};
state.uniqueRandom = true;
state.parents = [
    parent("Alpha", ["A1", "A2"]),
    parent("Beta", ["B1", "B2"]),
    parent("Gamma", ["G1"])
];

syncRandomUniqueAvailability({
    Session: {
        RandomUnique: "1",
        RandomUniqueParentSeen:
            "X:\\library\\Alpha|"
            + "x:\\LIBRARY\\beta",
        CurrentParent: "X:\\library\\Beta"
    }
});

const filtered = getFilteredParents();
const visible = getVisibleParents(filtered);

check(filtered.length === 3, "The complete filtered parent pool must be retained.");
check(
    buildFilteredGalleryPaths(filtered).length === 5,
    "The bridge queue must retain every filtered child gallery."
);
check(
    visible.length === 2
        && visible[0].name === "Beta"
        && visible[1].name === "Gamma",
    "The active parent should remain visible while completed parents are hidden."
);
check(
    getAvailableParentGalleries(state.parents[0]).length === 2,
    "UNIQUE parent filtering must not hide child galleries inside a visible parent."
);

syncRandomUniqueAvailability({
    Session: {
        RandomUnique: "1",
        RandomUniqueParentSeen:
            "X:\\library\\Alpha|"
            + "X:\\library\\Beta|"
            + "X:\\library\\Gamma",
        CurrentParent: "X:\\library\\Gamma"
    }
});
check(
    getVisibleParents().length === 1
        && getVisibleParents()[0].name === "Gamma",
    "The previous parent should hide only after the next parent is active."
);

syncRandomUniqueAvailability({
    Session: {
        RandomUnique: "1",
        RandomUniqueParentSeen: "X:\\library\\Alpha",
        CurrentParent: "X:\\library\\Alpha"
    }
});
check(
    getVisibleParents().length === 3,
    "Completing the final parent should begin a new visible parent round."
);

clearRandomUniqueAvailability();
state.uniqueRandom = true;
state.randomUniqueSessionActive = true;
state.randomUniqueActiveParentPath =
    uniqueParentPathKey("X:\\library\\Beta");
state.randomUniquePendingParentPath =
    uniqueParentPathKey("X:\\library\\Beta");
syncRandomUniqueAvailability({
    Session: {
        RandomUnique: "0",
        CurrentParent: "X:\\library\\Alpha"
    }
});
check(
    isParentAvailableForRandom(state.parents[1])
        && getVisibleParents().length === 3,
    "A stale refresh must keep the active parent visible."
);
check(
    !!state.randomUniquePendingParentPath,
    "The local parent mark should wait for bridge acknowledgement."
);

syncRandomUniqueAvailability({
    Session: {
        RandomUnique: "1",
        RandomUniqueParentSeen: "X:\\library\\Beta",
        CurrentParent: "X:\\library\\Beta"
    }
});
check(
    !state.randomUniquePendingParentPath
        && isParentAvailableForRandom(state.parents[1]),
    "Bridge acknowledgement must not hide the active parent."
);

syncRandomUniqueAvailability({
    Session: {
        RandomUnique: "1",
        RandomUniqueParentSeen:
            "X:\\library\\Beta|"
            + "X:\\library\\Gamma",
        CurrentParent: "X:\\library\\Gamma"
    }
});
check(
    !isParentAvailableForRandom(state.parents[1])
        && isParentAvailableForRandom(state.parents[2]),
    "Activating a different parent should hide the previous parent only."
);

syncRandomUniqueAvailability({
    Session: {
        RandomUnique: "1",
        RandomUniqueParentSeen: "X:\\library\\Beta"
    }
});
check(
    getVisibleParents().length === 2
        && !isParentAvailableForRandom(state.parents[1])
        && isParentAvailableForRandom(state.parents[2]),
    "Escape must retain completed parents without marking the last active parent."
);
check(
    !syncRandomUniqueAvailability({
        Session: {
            RandomUnique: "1",
            RandomUniqueParentSeen: "X:\\library\\Beta"
        }
    }),
    "An idle UNIQUE session should settle instead of refreshing every poll."
);

state.uniqueRandom = false;
check(
    getVisibleParents().length === 3,
    "Disabling UNIQUE should restore every filtered parent."
);

state.uniqueRandom = true;
state.randomUniqueParentSeenPaths = {};
state.randomUniqueActiveParentPath = "";
state.randomUniquePendingParentPath = "";
state.persistentRandomUniqueParentSeenText =
    "ERROR|X:\\library\\Alpha|X:\\library\\Beta";
getPersistentRandomUniqueParentSeenText = function() {
    return state.persistentRandomUniqueParentSeenText;
};
syncRandomUniqueAvailability({ Session: {} });
check(
    getVisibleParents().length === 1
        && getVisibleParents()[0].name === "Gamma",
    "A new program session must restore completed UNIQUE parents from durable settings."
);

state.uniqueRandom = false;
pauseRandomUniqueAvailability();
check(
    getVisibleParents().length === 3,
    "Pausing UNIQUE should show all parents without deleting round progress."
);
state.uniqueRandom = true;
check(
    getVisibleParents().length === 1
        && getVisibleParents()[0].name === "Gamma",
    "Re-enabling UNIQUE should restore the same completed-parent filter."
);

check(
    /random_next_parent_gallery\s*:=\s*ensureStoredRandomDestination\(\)\s*\r?\n\s*writeRandomUniqueSessionProgress\(\)/.test(
        bridgeText
    ),
    "Prepared parent-round resets should be published to the manager."
);
check(
    /if \(allowed_galleries\.Length\(\) < 1\)\s*\{\s*for gallery_index, gallery_path in parent_group\.galleries\s*\{\s*allowed_galleries\.Push\(gallery_path\)/.test(
        bridgeText
    ),
    "Child history must not remove a parent from the UNIQUE parent round."
);
check(
    /previous_parent\s*:=\s*normalizeFolderPath\(current_parent\)[\s\S]*markUniqueRandomParentSeen\(previous_parent\)/.test(
        bridgeText
    ),
    "The bridge should complete the previous parent only after a transition."
);
check(
    /preserve_unique_parent_round\s*:=\s*random_navigation_active\s*&&\s*random_unique_active[\s\S]*RandomUniqueParentSeen/.test(
        bridgeText
    ),
    "Escape should preserve only the completed-parent round state."
);
check(
    /writePersistentRandomUniqueParentProgress\(unique_parent_seen_text\)/.test(
        bridgeText
    )
        && /IniWrite, %persistent_text%, %SETTINGS_INI%, Options, UniqueRandomParentSeen/.test(
        bridgeText
    ),
    "The bridge must persist completed UNIQUE parents in durable settings."
);
check(
    /IniRead, unique_parent_seen_text, %SETTINGS_INI%, Options, UniqueRandomParentSeen/.test(
        bridgeText
    ),
    "Bridge startup must recover UNIQUE progress when session state is absent."
);
check(
    /current_gallery\s*=\s*""\s*&&\s*persistent_unique_value\s*=\s*1/.test(
        bridgeText
    ),
    "An idle restart must prefer the durable UNIQUE preference over stale session state."
);
check(
    /if \(unique_seen_text = "ERROR"\)\s*\{\s*unique_seen_text := ""/.test(
        bridgeText
    ),
    "Missing session history must not become a literal ERROR path."
);
const uniqueToggleFunctionStart = bridgeText.indexOf(
    "setRandomUniqueMode(is_active)"
);
const uniqueToggleFunctionEnd = bridgeText.indexOf(
    "/*\r\nReturn true when Unique mode is active",
    uniqueToggleFunctionStart
);
const uniqueToggleFunctionText = bridgeText.substring(
    uniqueToggleFunctionStart,
    uniqueToggleFunctionEnd
);
check(
    uniqueToggleFunctionStart >= 0
        && uniqueToggleFunctionEnd > uniqueToggleFunctionStart
        && uniqueToggleFunctionText.indexOf(
            "random_unique_parent_seen := []"
        ) < 0,
    "Refreshing UNIQUE must not clear completed-parent progress."
);
check(
    /persistent_text\s*:=\s*parent_seen_text\s*=\s*""\s*\?\s*"__EMPTY__"/.test(
        bridgeText
    ),
    "An empty completed-parent round needs an explicit durable marker."
);

console.log("UNIQUE parent visibility: PASS");
