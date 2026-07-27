# Gallery Slideshow Manager — Design Changelog

This records design milestones and trusted baselines, not every code edit.

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

### Remote is active control

Remote is not a passive preview. It controls the currently running slideshow while open.

### Minimal modification

Preserve working structure and change only the requested functionality.

### Runtime honesty

Syntax, marker and package checks do not prove Windows runtime behaviour.
