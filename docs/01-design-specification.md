> **SUPERSEDED — historical record only.**
> Written for the illustrated-mood build (six SVG moods, fantasy place names, scroll-driven
> time of day, scroll-snap). All of that was removed in the professional-portfolio overhaul.
> The current spec is [09-current-spec.md](./09-current-spec.md) plus `CLAUDE.md`. Do not
> implement from this file.

---

# Design Specification

## 1. Visual direction

**In one sentence:** a beautifully directed game menu crossed with a premium editorial page —
composed scenes a reader moves *through*, never a dashboard they scan.

- **Restraint is the feature.** Most of any view is still. A section earns motion by narrative
  relevance — wind through grass, a river's current, embers over a fire — never by default.
  Negative space carries as much weight as anything drawn.
- **One recurring motif, the Aether.** A teal→cyan accent that appears only where the narrative
  earns it: the river's current, the Jungle's conduits, the Observatory's dome slit, the
  campfire's embers. It never changes hue across the whole palette range, and weather never
  borrows it. Rarity and consistency are what make it read as a symbol rather than as lighting.
- **Progression, not variety.** The meadow and the valley are organic and calm. The Jungle
  introduces geometry and structure. The Observatory opens the sky. The campfire closes in. A
  visitor should feel they are going somewhere without reading a word.

**Explicitly avoided:** generated background-shape packs used undressed, glassmorphism over
everything, glowing-particle "magic dust", scroll-jacking, full-screen flashes, anything that
blinks, and UI chrome that looks like a settings panel dropped on top of a scene.

## 2. Typography

| Role | Family | Used for |
|---|---|---|
| Display | **Instrument Serif** | Section headings and the name. Nothing else. |
| Body / UI | **Instrument Sans** | Everything readable. |
| Data | **JetBrains Mono** | Metrics, eyebrows, place names, the AI/ML track's titles |

Instrument Serif and Sans were designed as a matched pair, so they share proportions instead of
fighting. Both are OFL, self-hosted through `next/font/google`, zero layout shift.

**Rules.** The serif is headline-only — never body copy, never UI. Body text never goes below
15px. Mono appears only where content is literally data-shaped, which is also how the AI/ML track
signals that it is the more instrumented of the two.

## 3. Colour

Two systems, kept apart *structurally* — see [00](./00-research-and-stack.md) §3 for why the naive
single-system approach fails WCAG mid-animation.

### 3.1 Atmosphere tokens (decorative, continuous)

`--sky-top` · `--sky-mid` · `--sky-horizon` · `--haze` · `--layer-far` · `--layer-mid` ·
`--layer-near` · `--glow` · `--aether`

Two families of four OKLCH stops each, in `src/systems/theme/palette.ts`:

| Family | Stops |
|---|---|
| Light | dawn → morning → midday → golden hour |
| Dark | dusk → early night → night → deep night |

Colour mode selects the family; `timeOfDay` (0–1) selects the position within it, interpolated
with shortest-arc hue lerp and damped at λ = 3.2/s. **These are never a text colour and never sit
behind text**, which is precisely what licenses them to drift freely.

### 3.2 Surface tokens (contrast-critical, discrete)

`--surface` · `--surface-solid` · `--surface-raised` · `--border-soft` · `--ink` · `--ink-muted` ·
`--accent-ink` · `--focus-ring`

Exactly two value sets, light and dark, swapped atomically inside a view transition. Never
interpolated. `--surface` is translucent, so its effective colour depends on the atmosphere
behind it — `contrast-audit.test.ts` composites it over every point on both rings and asserts
4.5:1 for text and 3:1 for the focus ring at every one.

The same test asserts that `globals.css`'s first-paint defaults match `palette.ts`, so the
pre-hydration paint can never disagree with the runtime.

## 4. Composition rules

- **Three depth planes, always.** Far (0.35× parallax, lightest, closest to the sky), mid (0.7×,
  the subject), near (1.15×, darkest, breaks the lower edge). A mood missing one reads flat and is
  not shipped.
- **One focal point per view.** Where the Aether is present it *is* the focal point; nothing else
  competes with it in saturation.
- **Consistent horizon.** Every mood draws into 1440×900 and is cropped, not letterboxed. An
  inconsistent horizon turns a crossfade into a jump cut.
- **The content column never fights the art.** Focal elements sit on the left or right third — the
  lone tree at x≈1064, the dome at x≈390, the pylons at the edges — so the centre stays readable.
- **Parallax stays inside 0.35–1.15× of a 130px total range.** Beyond that it reads as a web
  effect rather than as depth.
- **Panels are one material.** A single surface — `rounded-xl`, `--border-soft`, `--surface`,
  `backdrop-blur-md` — used by every card, list and callout, so the page reads as one system
  rather than as a pile of card styles.
- **Earlier is calmer, later is denser**, in composition as well as content: the meadow is wide
  and near-empty; the Jungle allows a visible structural grid behind the cards.

## 5. Chrome

- **Side navigator** — right edge on desktop, bottom on mobile. Appears on scroll, pointer
  movement or keypress; hides after 2.4s idle. Pins open on hover *and* on focus, because an
  element that vanishes while holding focus is a trap.
- **Command footer** — the stable strip: copyright, an atmosphere summary that reads current state
  without being opened, the mode switch, and shortcuts. Identical in both modes.
- **Control panel** — one dialog, five grouped controls (appearance, time of day, weather, sound,
  motion). Real radio groups and checkboxes, not `aria-pressed` buttons, so arrow-key navigation
  and screen-reader semantics come for free.