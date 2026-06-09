# Color Ramp Builder

Generate a Material Design tonal ramp from a seed color using the same HCT engine as [Material Theme Builder](https://material-foundation.github.io/material-theme-builder/). Find where your brand color sits on the scale, lock it to a swatch, and export Flutter `MaterialColor` code.

## Features

- Enter a seed hex color and generate a primary tonal ramp (0–900, step 100)
- Optionally include extended swatches (20, 50, 950, 980) via a single checkbox
- Show where your color falls on the scale vs the nearest swatch, e.g. `Closest 388 (400)`
- Lock your exact color to the nearest swatch and regenerate lighter/darker steps
- Export a Flutter `MaterialColor` snippet with copy button

## Setup

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (default `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Stack

- Vue 3 + Vite + TypeScript
- [@material/material-color-utilities](https://www.npmjs.com/package/@material/material-color-utilities)

---

## Design decisions

This section documents choices made while building the tool, so the next person understands *why* it works the way it does.

### Why this project exists

The tool was built to solve a practical problem when defining Flutter theme colors: you have a single brand hex (e.g. `#04567D`) and need a full tonal ramp for `MaterialColor`, but a pre-made palette may not contain your exact color at any step. This app lets you:

1. Generate a ramp from your color using Material's algorithm
2. See which discrete swatch your color is closest to
3. Lock your exact hex to that swatch and regenerate the rest
4. Copy the result into Dart (e.g. `color_tokens.dart`)

### Standalone repo, not inside invoicery-flutter

The app lives in `~/Code/color-ramp-builder` as its own project. It is intentionally **not** part of the Flutter monorepo — no shared code, no automatic sync to theme files. Export is copy-paste only.

### Scope: primary ramp only

We generate **one tonal palette at a time** (primary). Out of scope for now:

- Full Material Theme Builder scheme (secondary, tertiary, neutral, error)
- Direct write-back to Flutter repos
- Per-swatch manual editing

### Color generation: HCT via Material Color Utilities

Ramps are generated with `TonalPalette` from `@material/material-color-utilities` — the same HCT (hue, chroma, tone) engine used by Material Theme Builder.

| Phase | API | Behavior |
|-------|-----|----------|
| Initial | `TonalPalette.fromInt(seedArgb)` | Seed color defines hue/chroma; each step gets a tone from the palette |
| After lock | `TonalPalette.fromHueAndChroma(hue, chroma)` | Rebuild ramp from locked color's hue/chroma |
| Locked swatch | Hard override | The locked step always uses your **exact** input hex, even if HCT would produce a slightly different value at that tone |

We did **not** use RGB interpolation toward white/black (the older MaterialColor swatch trick) because it drifts hue on lighter/darker steps. HCT keeps hue stable across the ramp.

We also did **not** use `ColorScheme.fromSeed()` — that produces a full theme but does not guarantee your seed appears at any named swatch step.

### Swatch labels and HCT tone mapping

Swatch labels follow a 0–900 scale in steps of 100, plus optional extensions:

| Label | HCT tone | Notes |
|-------|----------|-------|
| 0 | 0 | Darkest |
| 100 | 10 | |
| … | … | `tone = label / 10` |
| 900 | 90 | |
| 20, 50 | 2, 5 | Dark extensions (optional) |
| 950, 980 | 95, 98 | Light extensions (optional) |

**List order** when extensions are enabled (sorted dark → light by step label):

`0 → 20 → 50 → 100 → … → 900 → 950 → 980`

Step 0 is darker than 20 and 50 (tone 0 vs 2 vs 5), so it always comes first. Light extensions come after 900. All four extensions are toggled by a **single checkbox** — we assumed they are always wanted together.

### Closest swatch: virtual step, not Delta E

Early versions compared swatches using CIE76 Delta E (perceptual color distance). That was dropped because ΔE is hard to interpret in UI.

Instead we use the **virtual step** — where your input color naturally sits on the 0–900 scale:

```
virtualStep = round(Hct.fromInt(input).tone × 10)
```

The **nearest discrete swatch** is the active step with the smallest `|step - virtualStep|`.

Display format:

- `Closest 388 (400)` — your color sits around **388** on the scale; nearest swatch is **400**
- `Closest 400` — exact alignment (virtual step equals swatch step)

The lock button always shows the discrete swatch number (`Lock to 400`), since that is what gets pinned.

### Lock / unlock behavior

- **Lock** saves your exact input hex and the nearest swatch step, then regenerates all other steps from the locked color's hue/chroma.
- **Unlock** returns to seed-based generation (`TonalPalette.fromInt`).
- Changing the seed color or toggling extensions **auto-unlocks** — simpler than prompting, and avoids stale locked state.

### Flutter export

Export produces a `const MaterialColor` block:

- First argument (primary value) = locked hex if locked, otherwise the current seed hex
- Map keys = only the active swatch steps (base + extensions if enabled)
- Constant name is editable in the UI (default `PRIMARY`); must be a valid Dart identifier (`PRIMARY`, `BRAND_BLUE`, etc.)

The export is plain text for manual paste — it does not validate against or update any Flutter project.

### Reference case: `#04567D`

When testing, this brand blue is a useful sanity check:

- Virtual step is typically around **380–400**
- Nearest base swatch is usually **400**
- After locking to 400, that row is exactly `#04567D` and surrounding steps shift

This case came from defining `PRIMARY` in invoicery-flutter's `color_tokens.dart`, where a hand-picked ramp did not include the original brand hex at any step.
