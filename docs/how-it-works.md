# How it works

Technical notes on color generation, swatch matching, locking, and export. For setup and everyday use, see the [README](../README.md).

## Why this exists

You often start with one brand color — a logo blue, a product orange — and need a full set of lighter and darker shades for a UI. Material Design calls this a **tonal ramp**: steps like 100, 200, … 900.

The catch: if you generate a ramp from your color, your exact hex might not land on any named step. This tool shows you where it sits, lets you pin it to a step, and exports code you can paste into a Flutter theme.

## Scope

The app builds **one primary ramp at a time**. It does not generate a full Material theme (secondary, tertiary, neutral, error) or write files back to your project.

## Color generation (HCT)

Ramps use `TonalPalette` from [@material/material-color-utilities](https://www.npmjs.com/package/@material/material-color-utilities) — the same HCT (hue, chroma, tone) engine as [Material Theme Builder](https://material-foundation.github.io/material-theme-builder/).

| Phase | API | Behavior |
|-------|-----|----------|
| Initial | `TonalPalette.fromInt(seedArgb)` | Seed color defines hue and chroma; each step gets a tone from the palette |
| After lock | Rebuild from locked color's hue and chroma | Other steps shift around the pinned swatch |
| Locked swatch | Hard override | The locked step always uses your **exact** input hex |

We do not use RGB interpolation toward white/black (the older `MaterialColor` swatch trick) because it drifts hue on lighter and darker steps. HCT keeps hue stable across the ramp.

We also do not use `ColorScheme.fromSeed()` — that produces a full theme but does not guarantee your seed appears at any named swatch step.

## Swatch labels and tone mapping

Swatch labels follow a 100–900 scale in steps of 100, plus optional extensions:

| Label | HCT tone | Notes |
|-------|----------|-------|
| 100 | 10 | Lightest base step |
| 200 | 20 | |
| … | … | `tone = label / 10` |
| 900 | 90 | Darkest base step |
| 50 | 5 | Dark extension (optional) |
| 950 | 95 | Light extension (optional) |
| 980 | 98 | Light extension (optional) |

With extensions enabled, steps are sorted dark → light: `50 → 100 → … → 900 → 950 → 980`.

All three extensions are toggled by a single checkbox — they are assumed to be wanted together.

You can also add custom steps (e.g. 350) via the swatch grid. Custom steps are merged into the active step list and regenerated like any other swatch.

## Closest swatch: virtual step

Early versions compared swatches using CIE76 Delta E. That was dropped because ΔE is hard to interpret in the UI.

Instead the app uses a **virtual step** — where your input color naturally sits on the scale:

```
virtualStep = round(Hct.fromInt(input).tone × 10)
```

The **nearest discrete swatch** is the active step with the smallest `|step - virtualStep|`.

Display format:

- `Closest 388 (400)` — your color sits around **388** on the scale; nearest swatch is **400**
- `Closest 400` — exact alignment (virtual step equals swatch step)

The lock button always shows the discrete swatch number (`Lock to 400`), since that is what gets pinned.

## Lock and unlock

- **Lock** saves your exact input hex and the nearest swatch step, then regenerates all other steps from the locked color's hue and chroma.
- **Unlock** returns to seed-based generation (`TonalPalette.fromInt`).
- Changing the seed color or toggling extensions **auto-unlocks** to avoid stale locked state.

## History

Palette changes are debounced (500 ms) before being added to history. Dragging the color picker only records the settled color, not every intermediate value. Selecting an entry from history does not create a duplicate.

## Flutter export

Two formats are available:

**MaterialColor** — a single `const MaterialColor` block with a map of step → `Color`.

**Color constants** — one `const Color` per step (e.g. `PRIMARY_40`).

Export details:

- Primary value = locked hex if locked, otherwise the current seed hex
- Map keys = only the active swatch steps (base + extensions + any custom steps)
- Constant name is editable in the UI (default `PRIMARY`); must be a valid Dart identifier

Export is plain text for manual paste — it does not validate against or update any Flutter project.

## Stack

- Vue 3 + Vite + TypeScript
- [@material/material-color-utilities](https://www.npmjs.com/package/@material/material-color-utilities)
