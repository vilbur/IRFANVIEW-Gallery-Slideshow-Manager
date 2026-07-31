# Gallery Slideshow Manager — Design Changelog

This records design milestones and trusted baselines, not every code edit.

## 0.90

Color-only keyword assignment state:

- removed the checkbox square and checkmark from keyword buttons in the
  manager right-click menu and the dedicated slideshow overlay;
- assigned keywords retain only the blue active-color accent;
- `X` now toggles the dedicated slideshow keyword window instead of showing a
  tray-only keyword notification;
- keyword ordering, captions, click behavior, rating display and slideshow
  overlay lifecycle remain unchanged.

Status: JavaScript syntax/behavior, AutoHotkey v1 syntax-load, static regression
and package checks required; live Windows appearance requires user confirmation.

## 0.89

Dedicated slideshow Keywords window:

- IrfanView right-click launches a separate lightweight HTA instead of asking
  the manager process to create its popup;
- the new window is owned by IrfanView and kept above it without restoring or
  activating the manager;
- cursor placement flips and clamps against the active monitor work area, with
  a bounded scroll region for keyword sets that still cannot fit;
- the overlay mirrors the manager keyword menu's dark controls, deterministic
  groups, prefix-free captions, assigned states and numeric/star rating;
- assignments update the existing gallery-keywords.ini and publish a revision
  so an open manager refreshes;
- Escape, right-click and focus loss dismiss the overlay, while slideshow
  auto-navigation remains paused until it closes.

Status: JavaScript syntax/behavior, AutoHotkey v1 syntax-load, static regression
and package checks required; live IrfanView focus/placement requires user confirmation.

## 0.88

UNIQUE pause/resume persistence:

- refreshing UNIQUE no longer starts a fresh parent round;
- switching UNIQUE off temporarily shows all parents without deleting which
  parents were already completed;
- switching UNIQUE back on restores the same hidden-parent set;
- starting another slideshow and reopening the manager resume that set;
- an explicit durable empty-round marker prevents missing INI values from
  becoming `ERROR` history entries.

Status: JavaScript syntax/behavior, AutoHotkey v1 syntax-load and package
checks required; live Windows restart behavior requires user confirmation.

## 0.87

Persistent UNIQUE rounds:

- the UNIQUE enabled preference and completed-parent set are stored in the
  durable manager settings file;
- the bridge restores UNIQUE progress from durable settings when temporary
  session state is absent on the next program launch;
- restored progress is republished to the live session channel for the manager;
- missing session values no longer become a literal `ERROR` history entry.

Status: syntax, behavior, static regression and package validation required;
live Windows restart behavior requires user confirmation.

## 0.86

Idle UNIQUE refresh stabilization:

- an enabled UNIQUE session with no current slideshow parent is retained as
  active after Escape;
- repeated unchanged session polls no longer report a false state change;
- the parent thumbnail grid is therefore rebuilt only for real availability
  changes, eliminating continuous thumbnail blinking.

Status: JavaScript syntax/behavior, AutoHotkey v1 syntax-load, static regression
and package checks pass.

## 0.85

Completed-parent UNIQUE lifecycle:

- the active parent stays visible for the duration of its slideshow;
- only a confirmed transition to a different parent marks and hides the
  previous parent;
- Escape preserves completed parents without marking the last active parent,
  allowing the same parent round to resume;
- completing every filtered parent clears the completed set for the next round.

This supersedes the start-time hiding behavior in 0.83 and 0.84.

Status: JavaScript syntax/behavior, AutoHotkey v1 syntax-load, static regression
and package checks pass; live Windows interaction requires user confirmation.

## 0.84

UNIQUE parent refresh-race fix:

- a parent hidden immediately at random-slideshow start is retained as a
  pending local mark;
- stale session snapshots cannot restore it during the next one-second poll;
- the pending mark is released only when the bridge reports the same current
  parent in its shown-parent round list.

Status: JavaScript syntax/behavior, AutoHotkey v1 syntax-load, static regression
and package checks pass; live Windows interaction requires user confirmation.

## 0.83

Parent-only UNIQUE display semantics:

- random UNIQUE visits mark the current parent gallery as shown;
- the main manager displays only unshown parent tiles;
- child galleries inside a visible parent are not filtered;
- shown parents remain hidden until the bridge resets its parent round after
  every other matching parent has been used;
- child-gallery history cannot prematurely remove a parent from that round;
- the main shown count now decreases directly with parent visits.

This replaces the child-gallery interpretation attempted in 0.81 and 0.82.

Status: JavaScript syntax/behavior, AutoHotkey v1 syntax-load, static regression
and package checks pass; live Windows interaction requires user confirmation.

## 0.82

Live UNIQUE progress correction:

- the main summary reports remaining child galleries instead of only the
  parent-tile count;
- current-gallery observations are accumulated within the active UNIQUE round,
  preventing a recent-only bridge snapshot from restoring already shown cards;
- the bridge publishes a persistent full-cycle identifier;
- a genuine full-cycle reset changes that identifier so the manager starts the
  new round with the correct availability set.

Status: JavaScript syntax/behavior, AutoHotkey v1 syntax-load, static regression
and package checks pass; live Windows interaction requires user confirmation.

## 0.81

UNIQUE round availability in the manager:

- the manager reads the bridge's persisted `RandomUniqueSeen` paths;
- only unseen child galleries are displayed during an active random UNIQUE
  round, and parents disappear after their last unseen child is shown;
- parent and detail-window counts use the remaining child-gallery pool;
- direct and random starts choose only galleries still available this round;
- the bridge retains the complete filtered pool for cycle detection and
  republishes UNIQUE progress after next-destination preparation resets a round.

Status: JavaScript syntax/behavior, AutoHotkey v1 syntax-load, static regression
and package checks pass; live Windows interaction requires user confirmation.

## 0.80

ALL/ANY included-keyword matching:

- prepended one `ALL \ ANY` toggle to the keyword controls row;
- `ANY` preserves OR matching across green included keywords;
- `ALL` requires every green included keyword;
- red exclusions remain vetoes in either mode;
- the global setting persists and named presets retain their own mode while
  older presets continue to load as `ANY`.

Status: JavaScript syntax/behavior, keyword and rating regression, AHK v1
syntax-load and package checks pass; live Windows interaction requires user confirmation.

## 0.79

Main keyword-row alignment:

- every keyword group reserves the same fixed-width prefix column;
- special groups display their prefix there while ordinary groups use a blank
  placeholder;
- all keyword button rows now begin on one consistent left-aligned edge.

Status: JavaScript syntax/behavior, keyword and rating regression, AHK v1
syntax-load and package checks pass; live Windows interaction requires user confirmation.

## 0.78

Keyword-filter guidance cleanup:

- removed the visible `Filter` label;
- removed the visible `LMB include · RMB exclude` helper;
- each keyword filter button now carries that guidance in its tooltip;
- readable prefix-bound rename text remains included in the same tooltip.

Status: JavaScript syntax/behavior, keyword and rating regression, AHK v1
syntax-load and package checks pass; live Windows interaction requires user confirmation.

## 0.77

Readable prefix-bound rename editing:

- special-prefix keywords display one separator space while being edited;
- stored `~Travel` is presented as `~ Travel` in the keyword field and rename
  prompt;
- the separator is removed on save, preserving canonical keyword identities;
- changing both prefix and name in one rename remains supported and migrates
  assignments, active filters and saved presets.

Status: JavaScript syntax/behavior, keyword and rating regression, AHK v1
syntax-load and package checks pass; live Windows interaction requires user confirmation.

## 0.76

Prefix labels and bound keyword names:

- each special character produces one main filter row with its prefix aligned
  as a label on the left;
- main filter buttons and keyword-window assignment buttons omit that prefix
  from their visible captions;
- keyword-window rows do not display separate prefix labels;
- filtering, assignment and rename handlers retain the complete stored keyword;
- double-click rename exposes the full prefix-bound name so both parts can be
  changed together.

Status: JavaScript syntax/behavior, keyword and rating regression, AHK v1
syntax-load and package checks pass; live Windows interaction requires user confirmation.

## 0.75

Stable special-prefix keyword order:

- all keyword surfaces use one symbol-first grouping function;
- the fixed preferred sequence is `~`, `@`, `!`, `#`, `$`, `%`, `&`;
- any other leading symbols follow in deterministic character order;
- case priority and case-insensitive sorting remain stable inside each exact
  symbol group.

Status: JavaScript syntax/behavior, keyword and rating regression, AHK v1
syntax-load and package checks pass; live Windows interaction requires user confirmation.

## 0.74

Manager parent-rating shortcuts:

- Ctrl-click adds or removes parent thumbnails from a multi-selection;
- Ctrl+0 through Ctrl+9 assign one rating to every selected parent;
- Ctrl+0 clears the saved rating for every selected parent;
- normal click, double-click, remembered selection and slideshow behavior remain single-parent operations.

Status: JavaScript syntax/behavior, existing keyword regression and package checks pass;
live Windows interaction requires user confirmation.

## 0.73

Direct keyword include/exclude controls:

- keyword filter buttons no longer display checkboxes;
- left-click toggles the green include state;
- right-click toggles the red exclude state;
- clicking with the opposite mouse button switches directly between states;
- include OR matching, exclusion vetoes and compatible presets remain intact.

Status: JavaScript syntax/behavior, AHK v1 syntax-load, static regression and
package checks pass; live Windows interaction requires user confirmation.

## 0.72

Keyword include/exclude filtering:

- keyword filter buttons cycle through include, exclude and clear states;
- included keywords use the existing OR behavior, while any excluded keyword
  vetoes a parent;
- filter presets preserve both included and excluded keywords without changing
  the existing include-only preset format;
- keyword renames update both halves of saved presets.

Status: JavaScript syntax/behavior, AHK v1 syntax-load, static regression and
package checks pass; live Windows interaction requires user confirmation.

## 0.71

Backup layout cleanup:

- Browse, Save backup path, Back up now and Revert from backup are aligned on
  the right side of the shared backup-directory row.

Status: syntax and static regression validation required; live Windows interaction requires user confirmation.

## 0.70

Options cleanup:

- Remote timeout changes save live with inline validation;
- the separate Save timeout button is removed;
- database and configuration backups now share one backup-directory control;
- legacy database/configuration backup paths migrate to the shared setting.

Status: syntax and static regression validation required; live Windows interaction requires user confirmation.

## 0.69

Manager convenience, persistence and backup controls:

- exiting Slideshow Manager closes all running VLC processes;
- `X` displays the current slideshow gallery's parent keywords in a tray notification;
- the selected parent gallery is persisted and restored after restart;
- separate database and configuration backup directories can be saved;
- Back up now copies the library cache, keyword/rating data and manager settings;
- Revert from backup validates matching database/configuration snapshots before restoring;
- the slideshow keyword popup prefers an app-style modeless dialog without browser chrome.

Status: syntax and static regression validation required; live Windows interaction requires user confirmation.

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
