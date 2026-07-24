# Agent Notes

## Project Overview

This repository contains a small static web app for planning a scaled Solar System walk on an interactive Leaflet map.

- `index.html` is the complete page shell and contains the page CSS.
- `planet-walk.js` contains the app logic.
- `leaflet*.js`, `leaflet*.css`, `leaflet*.map`, `jquery.min.js`, and `leaflet.zip` are vendored dependencies.
- `images/*.png` are the runtime marker assets.
- `images/*.xcf` are editable source files for the planet marker artwork.

There is no package manager, build step, or test runner configured.

## Running Locally

Because the app loads local JavaScript and image assets, serve it from the repo root:

```sh
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

Opening `index.html` directly may work for some browsers, but a local HTTP server is the safer default.

## Expected User Flow

1. The map starts centered on Southampton.
2. The first map click places the Sun.
3. The second map click places Earth and establishes the map scale.
4. Planet markers and orbit circles are positioned relative to the Sun/Earth scale.
5. Dragging any planet repositions the full model.
6. The URL hash stores Sun and Earth coordinates so a configured walk can be shared.

## Implementation Notes

- The code assumes global `L` from Leaflet and global `$` from jQuery.
- `planet-walk.js` is written as one `$(document).ready(...)` closure with function declarations inside it.
- Keep changes compatible with plain browser JavaScript unless a build step is intentionally introduced.
- Do not replace vendored Leaflet or jQuery files as part of unrelated changes.
- When changing `planet-walk.js`, bump the cache-busting query string on its script tag in `index.html`, for example from `planet-walk.js?v=1` to `planet-walk.js?v=2`.
- Planet distances are stored in AU in the `au` object.
- The `planets` array controls marker creation, table rows, and map layer ordering.
- The `extras` array only adds distance rows to the table.
- Marker icon filenames are derived from planet names, for example `images/Mars.png`.
- Saturn has custom icon sizing; preserve this if changing marker setup.

## Caution Areas

- `movePlanet` updates every planet based on the dragged planet's AU ratio. Any change here affects the core scaling behavior.
- Hash restore intentionally calls `movePlanet("Earth", ...)` twice so table distances are recalculated after positions settle.
- Mobile Safari duplicate click handling depends on `e.originalEvent._simulated`.
- Some variables in `planet-walk.js` are currently undeclared in places (`i`, `sunLL`, `earthLL`). Be careful when introducing stricter linting or `"use strict"`.
- The distance table formatting is custom and intentionally compact. Check small and very large distances after changing `humanDistance` or `makenum`.

## Validation Checklist

For behavior changes, manually verify:

- Initial page loads with a visible Leaflet map.
- Clicking once places the Sun and advances the instruction text.
- Clicking a second time places Earth and all other planet markers.
- Orbit circles appear and remain centered on the Sun.
- Dragging Earth and another planet updates all planet positions and table distances.
- Reset removes markers/circles and clears the URL hash.
- Loading a URL with a saved hash restores the configured walk.

For visual or asset changes, verify the relevant planet marker PNGs render at the expected size and alignment.
