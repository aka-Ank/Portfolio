> **SUPERSEDED — historical record only.**
> Written for the illustrated-mood build (six SVG moods, fantasy place names, scroll-driven
> time of day, scroll-snap). All of that was removed in the professional-portfolio overhaul.
> The current spec is [09-current-spec.md](./09-current-spec.md) plus `CLAUDE.md`. Do not
> implement from this file.

---

# Assets

The brief's standard: *specific, well-chosen assets only — no random stock-looking art, no
mismatched sets, no vague placeholders.* The strongest way to meet it turned out to be owning the
art rather than sourcing it.

## Backgrounds — hand-authored, in-repo

All six moods are inline SVG written by hand in `src/scenes/atmosphere/moods/`. Nothing is
downloaded, licensed or generated.

**Why not a generator (Haikei and similar).** They produce good-looking layered waves and blobs in
seconds, and every site using them looks like every other site using them. They also cannot do
what these moods need: silhouettes that mean something specific (a lone tree, a dome's lit slit, a
lean-to of logs), and shapes that recolour themselves from CSS variables as the palette drifts.

**Why not sourced illustration.** Matching six scenes across two palette families from separate
illustration sets is a losing battle, and licensing constrains derivative edits exactly where the
most tuning is needed.

**The cost is real and accepted:** hand-authored paths take longer and cannot be swapped out
casually. In exchange, every mood is a few kilobytes, theme-aware for free, server-rendered,
inspectable, and unlike anything else on the web.

### Conventions

- 1440×900 viewBox, `preserveAspectRatio="xMidYMax slice"` — cropped, never letterboxed.
- Three depth planes per mood, filled from `--layer-far` / `--layer-mid` / `--layer-near`.
- `aria-hidden="true"` and `role="presentation"` on every SVG — it is atmosphere, not content.
- Repeated elements (grass, reeds, stars, pylons, embers) are **hand-placed arrays with irregular
  spacing**, exported as named constants. Evenly spaced elements read as a pattern; randomised
  ones change on every render and read as noise.
- An element drawn on top of a plane must not use that plane's own fill — the campfire's logs were
  invisible until they became a darker `color-mix` of the ground they sit on.

## Particles — procedural

No sprite sheet, no texture file. `ParticleField` builds a 128px soft radial sprite in an
offscreen canvas at runtime, tinted from the current atmosphere token, and stamps it. Rebuilt only
when the token colour changes.

## Typography

| Family | Source | Licence |
|---|---|---|
| Instrument Serif | Google Fonts via `next/font/google` | OFL |
| Instrument Sans | Google Fonts via `next/font/google` | OFL |
| JetBrains Mono | Google Fonts via `next/font/google` | OFL |

Self-hosted by `next/font`, subset to latin, `display: swap`, zero layout shift. No CDN request at
runtime.

## Icons

None as an asset. The few glyphs used (`+`, `✕`, `↗`, the navigator's dots and rules) are text or
CSS shapes. An icon library would be ~40KB to draw four marks.

## Audio — placeholder, and flagged as such

`public/audio/` holds four synthesized ambient beds (dawn / day / sunset / night) plus one
confirmation tone. They are **deliberately placeholders**: four distinct tones so the crossfade is
audible and testable. They are not finished sound design, and [08](./08-roadmap.md) tracks
replacing them. The crossfade mechanics will not change when they do.

## Images

None. The site ships no raster image at all — no hero photograph, no project screenshots, no OG
image yet. That is why there is nothing to compress, lazy-load or serve responsively, and it is a
large part of why the pages are as light as they are.

*Open follow-up:* a static OG image for link previews, tracked in [08](./08-roadmap.md).

## Licence rule

Any newly sourced asset must have its licence checked and recorded in `ENGINEER_NOTES.md` before
it lands. Nothing currently in the repo required this — everything is either hand-authored,
procedural, or OFL-licensed through `next/font`.