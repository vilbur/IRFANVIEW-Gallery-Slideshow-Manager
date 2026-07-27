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
- [ ] Preview and execution always refer to the same gallery.

## Remote

- [ ] Single Tab moves to the next gallery.
- [ ] Single Tab waits for the system double-click interval before execution.
- [ ] Double Tab cancels the pending single-Tab move and opens Remote.
- [ ] Ctrl+Tab moves to the next parent gallery.
- [ ] Remote initially shows current gallery.
- [ ] Tab inside Remote offers the next gallery.
- [ ] Ctrl+Tab inside Remote offers the first eligible gallery in the next parent.
- [ ] Remote shows the first direct image of the displayed gallery when loadable.
- [ ] Parent `folder.jpg` remains the image fallback.
- [ ] Timeout defaults to 4000 ms.
- [ ] Timeout option persists and accepts only 1–60 seconds.
- [ ] Opening Remote does not start timeout.
- [ ] Timer starts only after Tab or Ctrl+Tab offers a gallery inside Remote.
- [ ] Timer executes exact displayed gallery.
- [ ] Remote closes after successful execution.
- [ ] Failed execution keeps the same offer visible.
- [ ] Slideshow hotkeys are inactive outside Remote while open.
- [ ] Remote hotkeys work only while Remote has focus.
- [ ] Closing restores IrfanView input.
- [ ] Closing restores VLC input.
- [ ] Closing cancels timer and clears preview state.

Obsolete controls remain absent:

- [ ] No Alt Gallery/Parent mode toggle.
- [ ] No standalone Ctrl next-preview control.
- [ ] No standalone Shift previous-preview control.
- [ ] No Space immediate execution.
- [ ] No Shift+Tab previous-parent shortcut.
- [ ] No Esc preview-cancel shortcut.
- [ ] No obsolete preview footer text.

## VLC

- [ ] Associated video launches.
- [ ] VLC opens on configured monitor.
- [ ] VLC enters fullscreen.
- [ ] Fullscreen retry remains available.
- [ ] Remote does not stop playback.
- [ ] VLC input is isolated only while Remote is open.
- [ ] VLC input restores on Remote close.
- [ ] Unrelated VLC instances are untouched.

## Ratings and keywords

- [ ] Ctrl+0…Ctrl+9 assign parent rating.
- [ ] Rating persists and displays.
- [ ] Keywords remain alphabetically sorted.
- [ ] Assignment affects selected parent only.
- [ ] Keyword filters affect random eligibility.
- [ ] No redundant `Keywords:` label.
- [ ] Existing keyword data remains intact.

## Prepared/session state

- [ ] Prepared path is validated.
- [ ] Prepared path is the path executed.
- [ ] Stale slots are removed.
- [ ] Random prepared slot is never silently replaced.
- [ ] Session state updates after switch.
- [ ] Session clears when slideshow ends.
- [ ] No disabled IrfanView/VLC window is left behind.
- [ ] Errors do not corrupt current-gallery state.

## Package

- [ ] Contains exactly EXE, HTA, Bridge AHK, Thumbnail PS1, ICO and README.
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
