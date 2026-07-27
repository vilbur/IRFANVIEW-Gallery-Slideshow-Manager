# Gallery Slideshow Manager — Feature Specification

This is the functional source of truth.

## Manager interface

### Gallery item controls

- Left click: select only, focus and scroll thumbnail into view.
- Double click: start slideshow.
- Right click: open context menu.
- Do not automatically open detail view on single click.

### Selection and preview

- Running gallery remains selected in the manager.
- Starting a slideshow browses to its parent and gallery.
- Selected gallery shows its first available image.
- Parent preview uses `folder.jpg` when available.
- Missing images show a safe placeholder.
- Thumbnail work must not block the UI.

### UI

- Dark interface.
- No redundant startup window.
- Preserve user data and saved layout/settings.
- Tray messages only for useful errors or explicit status.

## Slideshow

### Purpose

Run the selected gallery in IrfanView and control it through the bridge.

### Start

- The selected gallery always starts first.
- Double-click starts the selected gallery in Random Gallery mode.
- Random Gallery is the default mode for direct gallery starts.
- The explicit `SLIDESHOW` action starts normal sequential navigation.
- Remote can execute the gallery currently shown in preview.
- Normal slideshow mode must not substitute another gallery before start.

### Core rules

- Only one managed slideshow session is active.
- Track current gallery and current parent.
- Starting another gallery replaces the current slideshow cleanly.
- IrfanView opens on the configured monitor and in the expected fullscreen mode.
- Session state clears when managed IrfanView exits.

### Slideshow input

- Do not auto-switch images less than one second after keyboard or mouse input.
- Avoid double jumps.
- `T` must not open IrfanView thumbnail view.
- `Ctrl+C` copies the current image.
- Hotkeys target only the main IrfanView viewer, not dialogs.
- Source images are never permanently deleted by normal slideshow controls.

### Remote interaction

- Single Tab moves to the next gallery after the double-press interval.
- Double Tab opens Remote without first moving galleries.
- Ctrl+Tab moves to the next parent gallery.
- Tab inside Remote offers the next gallery and starts its timeout.
- Ctrl+Tab inside Remote offers the first eligible gallery in the next parent and starts its timeout.
- A next-parent candidate must exist and belong to a different parent.
- Invalid live and prepared parent candidates leave the current slideshow running.
- While Remote is open, slideshow hotkeys are inactive outside Remote.
- Remote closes after its displayed gallery starts successfully.
- Closing Remote restores slideshow input.

## Random Slideshow

### Purpose

Run galleries in genuinely random order.

### Start

- User-selected gallery starts first.
- Random selection starts only when choosing the following destination.
- Random is the default navigation mode unless the user explicitly starts the normal `SLIDESHOW` action.

### Random selection

- Choose the next eligible parent randomly.
- Then choose one eligible gallery from that parent.
- Alphabetical, sorted or directory order must not decide the result.
- Avoid immediately repeating the current parent when alternatives exist.
- Avoid immediately repeating the current gallery when alternatives exist.
- Use recent-history avoidance where possible.
- Reset history only when all eligible options have been exhausted.
- A missing or corrupt manager queue falls back to direct gallery-tree discovery.
- A valid queue with zero filter matches must not fall back or bypass filters.

### Mandatory stored-destination workflow

```text
Choose random parent
→ Choose random gallery
→ Store exact parent/gallery
→ Preview that exact destination
→ Execute that exact destination
→ Clear it
→ Choose another only afterwards
```

Rules:

- preview never recalculates the random destination;
- timeout never recalculates it;
- execution uses exactly what Remote displays;
- redraws do not generate a replacement;
- explicit skip may clear the stored offer and generate one new destination.

### Eligibility

Random mode must respect:

- active keyword filters;
- hidden and excluded galleries;
- selected root/group;
- rating filters;
- skip state;
- UNIQUE mode;
- all other active manager filters.

UNIQUE filtering occurs before random selection and must not turn random navigation into alphabetical navigation.

### Correctness definition

Random mode is correct only when the next destination cannot be predicted from alphabet, folder order, queue index or sorted list order.

## Remote window

### Purpose

Remote-control the currently running slideshow while Remote is open.

### Open and initial state

- Window title: `Remote`.
- Double Tab opens it from the managed slideshow.
- Initially displays the currently running gallery.

### Controls

```text
Single Tab outside Remote  Next gallery
Double Tab outside Remote  Open Remote
Ctrl+Tab outside Remote    Next parent gallery
Tab inside Remote          Offer next gallery and start/restart timeout
Ctrl+Tab inside Remote     Offer next parent gallery and start/restart timeout
```

### Timeout

- Default timeout: **4000 ms**.
- The manager exposes a persistent timeout option from 1 through 60 seconds.
- Opening Remote on the current gallery does not start the timer.
- Timer starts or restarts after Tab or Ctrl+Tab offers a gallery inside Remote.
- Timer executes the exact displayed gallery.

### Focus and isolation

- Remote receives focus.
- Remote controls work only inside Remote.
- While Remote is open, managed IrfanView and VLC do not receive slideshow hotkeys.
- Playback may continue.
- Closing Remote restores input.

### Execution

- Timeout executes the displayed preview.
- Current gallery and parent update.
- Remote closes automatically after a successful start.
- Failed execution keeps Remote open on the same offered gallery.

### Close

- Close with the title-bar close button.
- Cancel pending timeout.
- Clear temporary preview state.
- Restore IrfanView/VLC input.
- Restore slideshow focus where possible.

### Retired Remote controls

These must remain removed:

- Alt Gallery/Parent mode toggle;
- standalone Ctrl next-preview control;
- standalone Shift previous-preview control;
- Space immediate execution;
- Shift+Tab previous-parent shortcut;
- Esc cancellation shortcut;
- old shortcut footer text.

## IrfanView integration

- Configurable executable path.
- Expected known path may be `D:\GoogleDrive\TotalComander\_Utilities\IrfanView\i_view64.exe`.
- Launch selected gallery.
- Track only the managed instance.
- Target only the main viewer window.
- Detect process exit and clear state.
- Preserve fullscreen and configured monitor placement.
- Do not close unrelated IrfanView instances.

## VLC integration

- Detect associated video.
- Launch controlled VLC instance.
- Track managed VLC window/process.
- Move to configured monitor.
- Enter fullscreen.
- Retry fullscreen when necessary.
- Recover from fullscreen on the wrong monitor where possible.
- While Remote is open, playback continues but VLC input is isolated.
- Restore VLC input when Remote closes.
- Do not close unrelated VLC instances.

## Ratings

- Rating belongs to the parent gallery.
- Range: 0–9.
- `Ctrl+0` through `Ctrl+9` assign rating in the valid slideshow context.
- Rating persists and is visible in manager/Remote where applicable.
- Rating shortcuts must not conflict with Remote controls.

## Keywords

- Assign keywords to selected parent gallery.
- Sort keywords alphabetically on startup.
- Display plain keywords without redundant `Keywords:` label.
- Empty keyword state displays nothing.
- Keyword filters affect normal and random eligibility.
- Preserve existing keyword data.

## UNIQUE mode

- Apply UNIQUE to the eligible queue before navigation.
- Affect both normal and random mode.
- Do not make random mode alphabetical.
- Keep current-gallery tracking valid.

## Prepared navigation

Prepared slots may include next gallery, previous gallery, next parent, previous parent and Remote preview.

Rules:

- each slot has one purpose;
- validate path before execution;
- use a verified prepared destination when live resolution is temporarily unavailable;
- never pass an empty or nonexistent fallback path to the gallery starter;
- leave the current slideshow running when navigation has no valid destination;
- clear stale slots;
- execute exactly the prepared gallery;
- do not silently substitute another gallery;
- random slots preserve stored destination identity.
- the manager publishes complete filtered queues through a temporary file;
- a missing or zero-byte queue is republished even when membership is unchanged.

## Remote preview image

- Use the alphabetically first direct image of the displayed gallery.
- Fall back to parent `folder.jpg` when the gallery image cannot be loaded.
- Show a gallery-name placeholder when neither image can be loaded.
- Missing image must not block Remote controls.
- Fit preview to the slideshow monitor.

## Video pairing

- Pair intended gallery/video using configured naming rules.
- A leading meaningful integer may be used.
- Do not mistake resolution labels such as `1080` for the pairing number.
- Missing video must not block image slideshow.

## Skip state

- Skip state belongs to parent gallery.
- Persist it.
- Random eligibility may respect it.
- Explicit user action can clear/change it.
- Skip state must not silently reorder normal mode.

## Safety

- Never permanently delete original images through normal controls.
- Use safe destinations such as `_DELETE` or `_CROP` when enabled.
- Do not overwrite `folder.jpg` without explicit action.
- Stop only manager-owned processes.
- Never leave managed windows disabled after Remote closes or errors.

## Error handling

- Missing gallery: show error, keep manager running.
- Missing IrfanView: show path error, preserve state.
- Missing VLC: continue image slideshow where possible.
- Missing thumbnail/folder image: show placeholder.
- Failed prepared slot: retry/fall back only to the same intended gallery.
- Failed Remote execution: keep same preview and Remote open.

## Feature ownership

```text
HTA:
- UI, gallery list, selection, filters, keywords, visible ratings, thumbnails

Bridge:
- slideshow, IrfanView, VLC, Remote, hotkeys, random selection, session state

PowerShell:
- thumbnail generation only
```
