# Design Specification

## 1. Visual direction

**The world in one sentence:** an enchanted forest at the exact moment nature and a gentle,
ancient intelligence notice each other — never a "tech demo with trees," never a "fantasy game
with a resume bolted on."

Concretely, that means:

- **Materiality over decoration.** Surfaces read as real: soft subsurface light through leaves,
  damp bark, mist that occludes rather than a flat fog plane. No neon-cyberpunk gradients, no
  glassmorphism-over-everything, no generic particle confetti.
- **One consistent "life force" motif — the Aether.** A single accent hue-family (teal→cyan)
  that appears *only* where the narrative earns it: the river's current, a creature's markings,
  a lab chamber's power conduits, embers rising from the campfire. It is the visual thread that
  answers "where does the AI live in this forest" without ever being labeled as such. Because
  it's rare and consistent, it reads as meaningful rather than decorative.
- **Restraint is a feature.** Most of a given view is still. A scene earns motion by narrative
  relevance (wind through canopy, a creature's idle breathing, river current) — not by default.
  Silence and negative space carry as much weight as animation.
- **Progression, not variety.** Entrance and Clearing are almost entirely organic and calm —
  wood, leaf, water, soft light. Lab and Observatory introduce geometry, structure, and the
  Aether's mechanical expression (crystalline instruments, lit panels grown *into* wood and
  stone rather than bolted onto it). The visitor should be able to feel, without reading a
  single word, that they are going somewhere.

**Explicitly avoided:** low-poly "game jam" foliage kits used undressed, stock HDRI skies with
no grading, generic glowing-particle "magic dust," cubic-bezier `ease-in-out` on everything,
scroll-jacking that fights the user's own scroll input, any UI chrome that looks like a
dashboard dropped on top of a 3D scene.

## 2. Typography

Two families, later joined by a third for the more "instrumented" chapters — the type system
itself evolves with the journey, the same way the visual language does.

| Role | Family | Source | Used from |
|---|---|---|---|
| Display / headlines | **Instrument Serif** | Google Fonts (OFL) | Entrance onward |
| Body / UI | **Instrument Sans** | Google Fonts (OFL) | Entrance onward |
| Data / metrics / code accents | **JetBrains Mono** | Google Fonts (OFL) | Lab, Observatory, Campfire (resume/contact data) only |

**Why this pairing:** Instrument Serif and Instrument Sans were designed as a matched family, so
they share proportions and never fight each other the way an arbitrary serif+sans pairing does.
The serif carries genuine editorial warmth (a slight organic irregularity in its curves) without
the "premium SaaS landing page" cliché that heavily-used display serifs have accumulated. Both
are free, variable-adjacent, and self-hostable via `next/font/google` with zero layout shift.

**Rules:**
- Instrument Serif is for **headlines and single memorable lines only** — never body copy, never
  UI labels. Large size (clamp-based, ~40–96px), generous leading, minimal tracking.
- Instrument Sans is the workhorse: body copy, nav, buttons, captions. Never below 15px for body
  text (accessibility floor).
- JetBrains Mono appears only where content is literally data-shaped — commit counts, LeetCode
  stats, certification dates, resume fields — reinforcing the brief's "later areas reveal more
  mechanical complexity" rule typographically, not just visually.
- No third display face, no script/handwriting font, no more than 3 families total anywhere in
  the product (immersive or classic).

## 3. Color system

Two parallel palettes, deliberately kept separate:

1. **World tokens** — sky, fog, directional/ambient light, and the Aether accent. These *do*
   shift continuously with time-of-day; they live in the R3F world, not in Tailwind.
2. **UI/chrome tokens** — text, buttons, focus rings, classic-mode surfaces. These stay fixed
   and high-contrast at all times. This split exists for accessibility reasons: if UI text color
   chased the pretty time-of-day palette, contrast would silently fail at some point in every
   cycle. Chrome text sits on a small adaptive scrim (a soft dark gradient/blur behind text,
   opacity responsive to the current scene's brightness) instead of changing color itself.

### 3.1 World tokens — time-of-day palette (OKLCH)

| Token | Dawn | Day | Sunset | Night |
|---|---|---|---|---|
| `--sky-top` | `oklch(0.55 0.06 280)` | `oklch(0.62 0.10 230)` | `oklch(0.45 0.08 290)` | `oklch(0.18 0.03 260)` |
| `--sky-horizon` | `oklch(0.78 0.09 55)` | `oklch(0.82 0.05 200)` | `oklch(0.68 0.16 40)` | `oklch(0.28 0.05 265)` |
| `--fog` | `oklch(0.85 0.03 70)` | `oklch(0.90 0.01 200)` | `oklch(0.72 0.08 40)` | `oklch(0.30 0.03 260)` |
| `--light-key` (sun/moon) | `oklch(0.88 0.08 70)` | `oklch(0.95 0.05 95)` | `oklch(0.75 0.18 45)` | `oklch(0.55 0.03 250)` |
| `--foliage-ambient` | `oklch(0.45 0.07 150)` | `oklch(0.50 0.09 145)` | `oklch(0.40 0.08 130)` | `oklch(0.22 0.04 200)` |
| `--ground` | `oklch(0.35 0.03 60)` | `oklch(0.38 0.03 60)` | `oklch(0.30 0.04 40)` | `oklch(0.15 0.02 260)` |
| `--aether` (life-force accent) | `oklch(0.80 0.09 195)` | `oklch(0.72 0.14 195)` | `oklch(0.68 0.17 165)` | `oklch(0.75 0.18 205)` |

The Aether deliberately stays in one hue family (teal→cyan) across all four states instead of
jumping hue — it warms/cools and shifts chroma with the light, but always reads as "the same
thing," which is what makes it legible as a recurring symbol rather than mood lighting.

Interpolation is a single scalar `timeOfDay: 0–1` (0 = dawn, 0.25 = day, 0.5 = sunset, 0.75 =
night, wrapping) with each token computed via `THREE.Color.lerpColors` between adjacent anchor
states and smoothed with `maath`'s `easing.damp` — see [00-research-and-stack.md](./00-research-and-stack.md)
§5 and [06-animation-bible.md](./06-animation-bible.md).

### 3.2 UI/chrome tokens (fixed, Tailwind `@theme`)

| Token | Value | Use |
|---|---|---|
| `--ink` | `oklch(0.16 0.01 260)` | Primary text (classic mode light surfaces) |
| `--paper` | `oklch(0.98 0.005 90)` | Primary surface (classic mode) |
| `--ink-inverse` | `oklch(0.97 0.005 90)` | Text over the immersive scene / dark surfaces |
| `--scrim` | `oklch(0.1 0.02 260 / 0.55)` | Adaptive backing behind immersive-mode text |
| `--accent` | maps to `--aether` at the *current* time-of-day, clamped for AA contrast | Interactive accents, focus rings, links |
| `--focus-ring` | `oklch(0.75 0.18 205)` fixed | Never varies — focus visibility must never depend on scene state |

All pairs are checked against WCAG AA (4.5:1 body / 3:1 large text) at every one of the four
`--accent`-over-`--scrim` combinations; see [07-accessibility-and-testing.md](./07-accessibility-and-testing.md).

## 4. Composition rules

- **Three depth layers, always.** Foreground (parallax fastest, sharpest focus, occasional
  interactive element), midground (the scene's actual subject — creature, artifact, river bend),
  background (slowest parallax, softened by fog/depth-of-field, sky). A view missing one of the
  three layers reads as flat and is not shipped.
- **Fog is a compositional tool, not a performance crutch.** Exponential fog density is tuned
  per-scene to push the background layer back and hide LOD/pop-in seams — it's chosen because it
  serves the shot, and the performance benefit is a bonus, not the justification.
- **One focal point per view.** Camera framing follows a loose rule-of-thirds; when the Aether
  accent is present it *is* the focal point (nothing else competes with it in saturation).
- **Parallax ratios stay subtle:** foreground ≈1.15–1.3×, midground 1×, background ≈0.6–0.75× of
  base scroll-driven camera translation. Beyond that range parallax starts reading as a "web
  effect" rather than depth — which is exactly the cheap-effect feeling the brief prohibits.
- **Motion budget per view:** no more than 2–3 concurrently animating elements at rest (idle
  creature breathing, leaf sway, river current counts as one "ambient" budget item); anything
  beyond that is reserved for a deliberate narrative beat (a transition, a reveal) and settles
  back to budget within a few seconds.
- **Earlier = calmer, later = denser**, applied to composition specifically: Entrance/Clearing
  favor wide, empty, single-subject framing; Lab/Observatory allow busier framing with more
  simultaneous readable detail, mirroring the narrative's "revealed complexity" rule.
