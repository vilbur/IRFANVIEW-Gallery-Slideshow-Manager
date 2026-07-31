# Gallery Slideshow Manager — Do Not Break Checklist

Review this before every release.

## Baselines

- [ ] 0.52 remains the latest confirmed working Tab baseline.
- [ ] 0.46 remains the older broadly trusted manager baseline.
- [ ] Do not treat 0.53–0.55 Tab changes as trusted.
- [ ] AutoHotkey remains v1-compatible.
- [ ] Working architecture is preserved unless redesign is explicitly requested.

## Manager

- [ ] Left click selects only.
- [ ] Double click starts slideshow.
- [ ] Right click opens context menu.
- [ ] Running gallery remains selected/focused.
- [ ] Missing thumbnail does not break manager.
- [ ] No redundant startup window.
- [ ] Dark UI remains usable.

## Slideshow

- [ ] Selected gallery starts first.
- [ ] Random Gallery is the default for gallery double-click and direct starts.
- [ ] Explicit SLIDESHOW still selects normal sequential navigation.
- [ ] Current gallery is tracked.
- [ ] Current parent is tracked.
- [ ] Only one managed slideshow session is active.
- [ ] Replacement does not leave stale processes/state.
- [ ] IrfanView fullscreen works.
- [ ] Hotkeys target main viewer only.
- [ ] T does not open thumbnail view.
- [ ] Ctrl+C copies current image.
- [ ] Auto-switch waits at least one second after user input.
- [ ] No double jumps.
- [ ] No permanent source-image deletion.

## Random slideshow

- [ ] Selected gallery starts first.
- [ ] Next parent is genuinely random.
- [ ] Next gallery is genuinely random.
- [ ] Alphabetical/folder/index order does not decide result.
- [ ] Random destination is selected once and stored.
- [ ] Preview shows the stored destination.
- [ ] Timeout executes the stored destination.
- [ ] Execution does not recalculate it.
- [ ] Current gallery is not immediately repeated when alternatives exist.
- [ ] Current parent is not immediately repeated when alternatives exist.
- [ ] Recent-history prevention remains active.
- [ ] Filters and exclusions are respected.
- [ ] UNIQUE is respected.
- [ ] Active UNIQUE rounds display only unshown parent galleries.
- [ ] UNIQUE never filters child galleries inside a visible parent.
- [ ] UNIQUE display filtering does not shrink the bridge's full filtered queue.
- [ ] The main UNIQUE count decreases for each newly shown parent gallery.
- [ ] A shown parent returns only after the other matching parents have been used.
- [ ] Child-gallery history never removes a matching parent from the parent round.
- [ ] The active random parent remains visible until a different parent becomes active.
- [ ] Escape never marks the last active parent shown.
- [ ] Escape preserves earlier completed parents and leaves the last parent available.
- [ ] Idle UNIQUE polling never continuously rebuilds or blinks parent thumbnails.
- [ ] UNIQUE enabled state persists across program launches.
- [ ] Completed UNIQUE parents remain filtered after the next program launch.
- [ ] Refreshing or toggling UNIQUE off/on resumes the same completed-parent round.
- [ ] Starting another slideshow does not clear completed UNIQUE parents.
- [ ] Preview and execution always refer to the same gallery.
- [ ] Filtered-navigation queue is never published as a partially written file.
- [ ] Missing/empty/corrupt queue falls back to direct library discovery.
- [ ] Valid zero-match queue never bypasses active filters.

## Remote

- [ ] A single Tab opens the next gallery after the system double-click interval.
- [ ] A double Tab opens Remote on the current gallery.
- [ ] In random mode, Tab never leaves the current parent.
- [ ] Ctrl+Tab moves to the next parent gallery.
- [ ] In random mode, only Ctrl+Tab chooses a random different parent.
- [ ] Ctrl+Tab never passes a missing gallery path to the launcher.
- [ ] A parent switch never resolves to the current parent.
- [ ] Remote initially shows current gallery.
- [ ] Tab inside Remote offers the next gallery.
- [ ] Ctrl+Tab inside Remote offers the first matching gallery in the next parent.
- [ ] Remote shows the first direct image of the displayed gallery when loadable.
- [ ] Parent `folder.jpg` remains the image fallback.
- [ ] Timeout defaults to 4000 ms.
- [ ] Timeout option persists and accepts only 1–60 seconds.
- [ ] Timeout changes save live without a separate save button.
- [ ] Opening Remote does not start timeout.
- [ ] Timer starts only after Tab or Ctrl+Tab offers a gallery inside Remote.
- [ ] Timer executes exact displayed gallery.
- [ ] Remote closes after successful execution.
- [ ] Failed execution keeps the same offer visible.
- [ ] Slideshow hotkeys are inactive outside Remote while open.
- [ ] Remote hotkeys work only while Remote has focus.
- [ ] Escape closes Remote and cancels its pending offer.
- [ ] A mouse click outside Remote closes it and cancels its pending offer.
- [ ] Closing restores IrfanView input.
- [ ] Closing restores VLC input.
- [ ] Closing cancels timer and clears preview state.

Obsolete controls remain absent:

- [ ] No Alt Gallery/Parent mode toggle.
- [ ] No standalone Ctrl next-preview control.
- [ ] No standalone Shift previous-preview control.
- [ ] No Space immediate execution.
- [ ] No Shift+Tab previous-parent shortcut.
- [ ] No obsolete preview footer text.

## VLC

- [ ] Associated video launches.
- [ ] VLC opens on configured monitor.
- [ ] VLC enters fullscreen.
- [ ] Fullscreen retry remains available.
- [ ] Remote does not stop playback.
- [ ] VLC input is isolated only while Remote is open.
- [ ] VLC input restores on Remote close.
- [ ] Unrelated VLC instances are untouched during slideshow replacement.
- [ ] Exiting Slideshow Manager closes all VLC instances.

## Ratings and keywords

- [ ] Manager Ctrl-click preserves a multi-selection and Ctrl+0…Ctrl+9 rates every selected parent.
- [ ] Ctrl+0…Ctrl+9 assign parent rating.
- [ ] Rating persists and displays.
- [ ] Keywords remain alphabetically sorted.
- [ ] Special-prefix keywords keep the same deterministic order on every keyword surface.
- [ ] Main special-prefix rows have left labels; keyword-window rows do not.
- [ ] All main keyword rows reserve the same prefix column and remain left-aligned.
- [ ] Keyword button captions omit prefixes while rename retains the complete bound name.
- [ ] Rename editing shows one prefix separator but saves the canonical bound name without it.
- [ ] Assignment affects selected parent only.
- [ ] Included keyword filters retain OR matching.
- [ ] ALL mode requires every included keyword; ANY mode retains OR matching.
- [ ] Excluded keyword filters veto matching parents.
- [ ] ALL/ANY mode persists and older presets default to ANY.
- [ ] Filter buttons have no checkbox: LMB is green include and RMB is red exclude.
- [ ] Filter and LMB/RMB helper labels stay absent; button tooltips retain that guidance.
- [ ] Older include-only keyword-filter presets still load unchanged.
- [ ] X shows the current slideshow gallery's parent keywords in a tray notification.
- [ ] IrfanView right-click opens a dedicated keyword HTA without activating or restoring the manager.
- [ ] The dedicated keyword window is owned by and displayed above the active IrfanView viewer.
- [ ] The keyword window starts beside the cursor and remains inside the cursor monitor's work area.
- [ ] The keyword window matches the manager keyword menu's order, captions, assignment state and rating display.
- [ ] Escape, focus loss and right-click dismissal close the slideshow keyword window.
- [ ] Keyword filters affect random gallery matching.
- [ ] No redundant `Keywords:` label.
- [ ] Existing keyword data remains intact.

## Prepared/session state

- [ ] Prepared path is validated.
- [ ] Prepared path is the path executed.
- [ ] Ctrl+Tab may recover from a validated prepared next-parent slot.
- [ ] Empty or nonexistent fallback paths never reach `startGallery`.
- [ ] Invalid navigation does not close the current slideshow.
- [ ] Stale slots are removed.
- [ ] Random prepared slot is never silently replaced.
- [ ] Session state updates after switch.
- [ ] Session clears when slideshow ends.
- [ ] No disabled IrfanView/VLC window is left behind.
- [ ] Errors do not corrupt current-gallery state.

## Package

- [ ] Contains exactly EXE, manager HTA, keyword HTA, Bridge AHK, Thumbnail PS1, ICO and README.
- [ ] HTA version updated.
- [ ] Bridge version updated.
- [ ] Visible status version updated.
- [ ] Launcher caption updated.
- [ ] README updated.
- [ ] CHANGELOG updated.
- [ ] JavaScript syntax passes.
- [ ] AHK v1 static checks pass.
- [ ] Required BOM/CRLF formatting preserved.
- [ ] Final ZIP reopened and verified.
- [ ] SHA-256 supplied.

## Delivery truthfulness

- [ ] Static checks are described as static checks.
- [ ] Runtime success is not claimed without user confirmation.
- [ ] Known uncertainty is stated.
- [ ] Full updated files are supplied when several code areas change.
- [ ] A single-file update is not unnecessarily zipped.
