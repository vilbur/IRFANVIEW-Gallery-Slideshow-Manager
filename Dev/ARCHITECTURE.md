# Gallery Slideshow Manager — Architecture

## Purpose

Windows gallery manager built from:

- `Gallery-Slideshow-Manager.exe` — launcher only.
- `Gallery-Slideshow-Manager.hta` — manager UI.
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

### AutoHotkey bridge

Owns:

- slideshow start and replacement;
- IrfanView and VLC process/window tracking;
- fullscreen and monitor placement;
- current gallery and parent state;
- slideshow hotkeys;
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
remote_mode
remote_preview_gallery
remote_preview_parent
remote_preview_direction
prepared_next_gallery
prepared_previous_gallery
stored_random_gallery
stored_random_parent
```

Rules:

- preview and execution always use the same stored path;
- execution never recalculates a destination already previewed;
- replacing a slideshow updates state atomically;
- stale prepared slots are cleared;
- managed process exit clears session state;
- errors must not leave IrfanView or VLC disabled.

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
Tab in managed slideshow
→ Open Remote
→ Show current gallery
→ Default mode = Gallery
→ Disable slideshow-window input
→ Remote receives controls
```

```text
Alt   → Toggle Gallery/Parent mode
Ctrl  → Preview next
Shift → Preview previous
Space → Execute exact preview
Timer → Execute exact preview
```

After execution, Remote remains open and shows the newly running gallery. Closing Remote cancels the timer, clears temporary preview state, restores slideshow-window input and returns focus where possible.

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
