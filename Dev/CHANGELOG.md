# Gallery Slideshow Manager — Design Changelog

This records design milestones and trusted baselines, not every code edit.

## 0.68

Slideshow navigation recovery:

- filtered navigation is published as Unicode so a non-ANSI gallery path cannot leave a zero-byte temporary file and preserve a stale two-parent queue;
- single Tab again changes gallery after the Windows double-click interval;
- double Tab again opens Remote on the current gallery;
- Ctrl+Tab still changes parent, and Tab inside Remote still offers the next gallery;
- random Tab navigation remains constrained to the current parent while random parent navigation remains different-parent only.

Status: syntax and static regression validation required; live Windows interaction requires user confirmation.

## 0.67

Reusable keyword-menu rendering:

- the keyword menu structure and grouped keyword order are prepared once;
- later openings update only the rating and checked keyword states;
- slideshow popup windows clone cached menu markup and hydrate lightweight click handlers;
- popup requests no longer restore or activate the complete manager window;
- 0.66 focus lifecycle, slideshow pause, fast tile updates and deferred cache writing remain unchanged;
- 0.64 TAB/Remote/random navigation code remains unchanged.

Status: syntax and package validation required; live Windows interaction requires user confirmation.

## 0.66

Keyword-menu responsiveness and focus lifecycle:

- removed the global popup RButton interceptor that could consume a slideshow right-click;
- the popup now closes itself on focus loss and clears its stale window reference;
- main-tile right-click updates selection without rebuilding the parent grid;
- keyword assignment updates only the affected tile and defers cache serialization;
- an active keyword filter still triggers a render when membership changes;
- 0.64 TAB/Remote/random navigation code remains unchanged.

Status: syntax and package validation required; live Windows interaction requires user confirmation.

## 0.65

Shared slideshow keyword popup:

- slideshow right-click uses the same HTML keyword renderer as the manager UI;
- no native AutoHotkey keyword menu remains in the slideshow path;
- right-click anywhere dismisses the popup;
- automatic slideshow navigation pauses while the popup is visible;
- the popup disables scrollbars and expands to the monitor work area when needed;
- the 0.64 TAB, Remote, random-navigation, and IrfanView lifecycle paths are unchanged.

Status: syntax and package validated; live Windows interaction requires user confirmation.

## 0.64

IrfanView lifecycle tightened:

- slideshow launches use IrfanView's one-instance mode;
- any existing 32-bit or 64-bit IrfanView process is closed before a slideshow starts;
- closing the final manager window exits the resident bridge and closes IrfanView;
- manager replacement and automatic version handoff keep working because the new manager window exists before the old one closes.
- random Tab navigation stays inside the current parent;
- Ctrl+Tab alone selects a random different parent.

Status: statically validated; live Windows process behaviour still requires user confirmation.

## 0.63

New-version handoff automated:

- an open manager checks the adjacent HTA and bridge version declarations;
- restart occurs only when both files advertise the same version newer than the running manager;
- the candidate must remain stable across two checks, avoiding partially written releases;
- the existing single-instance claim replaces the older manager window.

Status: statically validated; live update handoff still requires user confirmation.

## 0.62

Random next-item failure fixed at the queue boundary:

- live diagnosis found a zero-byte filtered-navigation INI;
- the manager now writes that queue through a complete temporary file;
- signature caching no longer suppresses repair of a missing or empty queue;
- the bridge falls back to direct library discovery only when the queue is missing or corrupt;
- a valid zero-match filtered queue remains authoritative;
- random parent-first selection remains unchanged once candidates are available.

Status: statically validated and exercised against the live zero-byte queue;
full Windows slideshow runtime still requires user confirmation.

## 0.61

Random Gallery is now the default slideshow mode:

- gallery double-click and direct gallery starts select random navigation;
- the user-selected gallery remains the first slideshow item;
- the explicit `SLIDESHOW` action still selects normal sequential navigation;
- new or mode-less restored sessions default to random;
- Ctrl+Tab validates live and prepared destinations before launch;
- parent destinations must exist and belong to a different parent;
- Remote Ctrl+Tab rejects same-parent candidates.

Status: statically validated; Windows runtime still requires user confirmation.

## 0.60

Next-parent navigation hardened:

- Ctrl+Tab no longer sends an empty path to `startGallery`;
- a valid prepared next-parent slot is used when live destination resolution is temporarily unavailable;
- prepared parent recovery must point to an existing gallery in a different parent;
- if neither live nor prepared destination is valid, the current slideshow remains running and a navigation notice is shown;
- redundant pre-closing of IrfanView was removed from the prepared-switch dispatcher.

Status: statically validated; Windows runtime still requires user confirmation.

## 0.59

Remote preview refined:

- the first direct image of the displayed gallery is used for Remote preview;
- parent `folder.jpg` remains a fallback when that image cannot be loaded;
- Ctrl+Tab inside Remote offers the first matching gallery in the next parent;
- both Remote offer controls start or restart the configured timeout;
- Remote closes automatically after the displayed gallery starts successfully;
- failed execution retains the displayed offer and keeps Remote open.

Status: statically validated; Windows runtime still requires user confirmation.

## 0.58

Remote controls revised:

- single Tab moves to the next gallery after the system double-click interval;
- double Tab cancels that pending move and opens Remote;
- Ctrl+Tab moves directly to the next parent gallery;
- Tab inside Remote offers the next gallery and starts/restarts the timeout;
- timeout executes the exact displayed gallery;
- timeout is persistent and configurable from 1 through 60 seconds;
- 4000 ms remains the default;
- 0.57 Alt/Ctrl/Shift/Space Remote controls were retired.

Status: statically validated; Windows runtime still requires user confirmation.

## 0.57

Remote design introduced:

- preview window renamed/redefined as `Remote`;
- Tab opens Remote;
- initial display is current gallery;
- default mode Gallery;
- Alt toggles Gallery/Parent;
- Ctrl next;
- Shift previous;
- Space executes preview;
- existing 4000 ms timeout retained;
- slideshow hotkeys inactive outside Remote while open;
- old preview shortcuts removed.

Status: statically validated; Windows runtime still requires user confirmation.

## 0.56

Built from 0.52 behaviour with VLC fullscreen correction. Intended to preserve working 0.52 Tab behaviour and avoid 0.53–0.55 Tab changes.

## 0.55

Attempted Tab restoration using keyboard hook, elevation and IrfanView/VLC window group. Not accepted as the trusted Tab baseline.

## 0.54

VLC fullscreen work:

- launch fullscreen;
- verify and retry fullscreen;
- recover when fullscreen appears on wrong monitor.

Runtime not confirmed.

## 0.53

Random-slideshow work intended to store one exact random parent/gallery and use it for preview and execution. Later Tab regressions mean this is not a trusted Tab baseline.

## 0.52

Latest user-confirmed version with working Tab functionality.

Rule: use 0.52 when recovering original Tab behaviour. Do not substitute Tab implementations from 0.53–0.55.

## 0.46

Older broadly trusted manager baseline before a series of regressions.

## Permanent design decisions

### Random means random

Random mode never uses alphabetical, sorted or directory order as its effective navigation.

### Preview identity

The gallery displayed to the user is the exact gallery executed by timeout.

The image displayed in Remote belongs to that gallery whenever a directly
loadable gallery image is available.

### Remote is active control

Remote is not a passive preview. It controls the currently running slideshow while open.

### Minimal modification

Preserve working structure and change only the requested functionality.

### Runtime honesty

Syntax, marker and package checks do not prove Windows runtime behaviour.
