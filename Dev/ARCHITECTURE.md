# Gallery Slideshow Manager — Architecture

## Purpose

Windows gallery manager built from:

- `Gallery-Slideshow-Manager.exe` — launcher only.
- `Gallery-Slideshow-Manager.hta` — manager UI.
- `Gallery-Slideshow-Manager-Keywords.hta` — dedicated IrfanView keyword overlay.
- `Gallery-Slideshow-Manager-Bridge.ahk` — AutoHotkey v1 slideshow controller.
- `Gallery-Slideshow-Manager-Thumbnails.ps1` — thumbnail worker.
- IrfanView — image slideshow engine.
- VLC — associated-video player.
- INI/session files — persistent state.
- Remote window — active control surface for the running slideshow.

The working structure must be preserved. Changes should be local and must not rewrite unrelated systems.

## Component ownership

### HTA manager

Owns:

- gallery tree and thumbnails;
- selection, filtering, keywords, ratings and visible controls;
- left-click selection, double-click slideshow start, right-click menu;
- communication with the bridge;
- visible version and status.

Does not directly own IrfanView, VLC, slideshow hotkeys, Remote logic or random destination selection.

### Slideshow keyword overlay

Owns only the lightweight right-click assignment surface displayed during an
IrfanView slideshow. It reads and writes the root library's keyword/rating INI
files, mirrors the manager menu's grouping and styling, and notifies the bridge
after a keyword change. It must not initialize, restore or activate the main
manager window.

### AutoHotkey bridge

Owns:

- slideshow start and replacement;
- single-instance IrfanView lifecycle and VLC process/window tracking;
- fullscreen and monitor placement;
- current gallery and parent state;
- slideshow hotkeys;
- launching, owning and closing the separate slideshow keyword overlay;
- Remote window and timeout;
- prepared next/previous destinations;
- genuinely random parent/gallery selection;
- session persistence and cleanup;
- conflict prevention with slideshow-assistant.

Requirements:

- AutoHotkey v1 only;
- no AHK v2 syntax;
- no `then` after `if`;
- preserve working functions and structure;
- return the complete updated file when several areas change.

### Thumbnail worker

Owns only thumbnail generation and caching. It must not modify slideshow state or source gallery files.

### Launcher

Starts the HTA from the application directory. No slideshow logic belongs in the launcher.

## Gallery hierarchy

```text
ROOT
└── Group or A-Z category
    └── Parent gallery
        ├── Gallery/subgallery 1
        ├── Gallery/subgallery 2
        ├── folder.jpg
        └── optional associated video
```

Definitions:

- **Current gallery** — gallery currently running in IrfanView.
- **Current parent** — parent directory of the current gallery.
- **Prepared destination** — exact gallery generated before execution.
- **Remote preview** — exact destination displayed in Remote.
- **Stored random destination** — exact random parent/gallery pair that preview and execution must share.

## Authoritative runtime state

The bridge should have one authoritative value for each concept:

```text
current_gallery
current_parent
current_irfan_pid
current_vlc_window_id
slideshow_mode
random_mode
remote_open
remote_preview_gallery
remote_preview_parent
remote_preview_direction
remote_timeout_ms
tab_press_pending
prepared_next_gallery
prepared_previous_gallery
stored_random_gallery
stored_random_parent
```

Rules:

- preview and execution always use the same stored path;
- execution never recalculates a destination already previewed;
- prepared navigation may recover a temporarily unavailable live path only after validating the prepared gallery and requested destination type;
- empty navigation paths never reach slideshow startup;
- replacing a slideshow updates state atomically;
- stale prepared slots are cleared;
- managed process exit clears session state;
- errors must not leave IrfanView or VLC disabled.

### Filtered-navigation queue

- The HTA publishes a complete queue through a temporary file before replacing the shared INI.
- Signature caching may skip a rewrite only while the shared queue exists and is non-empty.
- A valid queue, including a valid zero-match queue, is authoritative for filters.
- A missing, empty or corrupt queue allows the bridge to discover candidates directly from the gallery tree so navigation remains operational.

## Main flows

### Start manager

```text
Start EXE
→ Open HTA
→ Start/connect bridge
→ Load settings and state
→ Scan galleries
→ Load ratings and keywords
→ Load/generate thumbnails
→ Restore valid current session
```

### Start slideshow

```text
Select gallery
→ Double-click or Start command
→ Select random navigation by default, or normal for explicit SLIDESHOW
→ Bridge validates path
→ Stop/replace current managed slideshow
→ Start IrfanView
→ Record current gallery and parent
→ Prepare navigation
→ Update manager selection/status
```

### Associated video

```text
Gallery starts
→ Detect associated video
→ Start VLC
→ Move to configured monitor
→ Enter fullscreen
→ Track VLC window
```

### Remote

```text
Single Tab outside Remote → Open next gallery after the double-click interval
Double Tab outside Remote → Open Remote on the current gallery
Ctrl+Tab outside Remote   → Next parent gallery
Tab inside Remote         → Offer next gallery and start/restart timer
Ctrl+Tab inside Remote    → Offer first gallery in next parent and restart timer
Timer                     → Execute exact preview
```

Random mode maintains separate prepared destinations: Tab is constrained to a
matching gallery in the current parent, while Ctrl+Tab selects a gallery from a
random different parent.

Remote previews the first direct image of its displayed gallery, falling back
to the parent `folder.jpg`. After successful execution, Remote closes and focus
returns to the newly running slideshow. Closing Remote before execution cancels
the timer, clears temporary preview state, restores slideshow-window input and
returns focus where possible.

Before a next-parent launch, both the live candidate and any prepared fallback
are validated. The destination must exist, differ from the current gallery and
belong to a different parent. Failure leaves the running slideshow untouched.

## Hotkey ownership

The bridge is the only owner of manager slideshow-navigation hotkeys.

- no duplicate Tab handling in slideshow-assistant;
- while Remote is closed, valid slideshow hotkeys may work in IrfanView/VLC;
- while Remote is open, slideshow hotkeys are inactive outside Remote;
- Remote controls work only while Remote has focus.

## Trusted baselines

- **0.46** — older broadly trusted manager baseline.
- **0.52** — latest user-confirmed working Tab behaviour.
- **0.53–0.55** — not trusted for Tab implementation.
- **0.57** — Remote design introduced; Windows runtime still requires user confirmation.
- **0.58** — historical single/double Tab control model and configurable Remote timeout; Windows runtime still requires user confirmation.
- **0.59** — gallery-image Remote preview, Ctrl+Tab parent offers and close-on-start; Windows runtime still requires user confirmation.
- **0.60** — guarded Ctrl+Tab parent switching with validated prepared-slot recovery; Windows runtime still requires user confirmation.
- **0.61** — Random Gallery default and strict next-parent destination validation; Windows runtime still requires user confirmation.
- **0.62** — atomic queue publishing and direct-library recovery for corrupt random-navigation queues; Windows runtime still requires user confirmation.
- **0.63** — automatic manager restart after a complete, stable newer HTA/bridge version pair appears; Windows runtime still requires user confirmation.
- **0.64** — system-wide single IrfanView enforcement and last-manager-window lifecycle cleanup; Windows runtime still requires user confirmation.

Static validation is not runtime validation.

## Release workflow

Before delivery:

1. Read `FEATURES.md`.
2. Read `DO_NOT_BREAK.md`.
3. Identify the owning component.
4. Modify only required areas.
5. Update version in HTA, bridge, visible status, launcher and README.
6. Update `CHANGELOG.md`.
7. Run JavaScript syntax validation.
8. Run AHK v1 static regression checks.
9. Verify protected feature markers.
10. Reopen and verify the final ZIP.
11. Provide SHA-256.
12. Never claim Windows runtime success without user confirmation.
