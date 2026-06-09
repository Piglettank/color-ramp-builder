# Color Ramp Builder

You have one brand color. You need a full palette of lighter and darker shades for your app. This tool builds that palette using the same color engine as Google's [Material Theme Builder](https://material-foundation.github.io/material-theme-builder/), shows you where your color lands on the scale, and lets you copy Flutter-ready code.

## What you can do

1. **Pick a seed color** — type a hex or use the color picker.
2. **See the ramp** — get steps from 100 to 900 (plus optional 50, 950, 980).
3. **Find your spot** — the app marks which swatch your color is closest to, e.g. "Closest 388 (400)".
4. **Lock your exact shade** — pin your hex to a swatch so the rest of the ramp is built around it.
5. **Export** — copy a `MaterialColor` block or individual `Color` constants into your Flutter theme.

You can also add custom steps (like 350) and browse recent palettes in the history panel.

## Quick start

```bash
npm install
npm run dev
```

Open the URL in your terminal (usually `http://localhost:5173`).

## Using the app

**Enter your color** in the seed field. The swatch grid updates immediately.

**Check the closest swatch** — a badge on the nearest row tells you where your color sits. If it says `Closest 388 (400)`, your color is between steps 400 and 500, closer to 400.

**Lock if you need your exact hex on the ramp** — click "Lock to …" to pin your color to that swatch. The other steps regenerate around it. Click "Unlock" to go back to seed-based generation.

**Toggle extensions** if you want the extra dark and light steps (50, 950, 980).

**Export** — choose MaterialColor or separate constants, name your variable (default `PRIMARY`), and copy the Dart code.

## How it works

The app uses Material's HCT color space to keep hues stable as shades get lighter or darker — not simple RGB fade-to-white. When you lock a swatch, your exact hex is preserved at that step and the rest of the ramp adjusts around it.

For the full technical breakdown — tone mapping, virtual step matching, lock behavior, export formats — see [How it works](docs/how-it-works.md).

## Build

```bash
npm run build
npm run preview
```
