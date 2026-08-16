> **SUPERSEDED — historical record only.**
> Written for the illustrated-mood build (six SVG moods, fantasy place names, scroll-driven
> time of day, scroll-snap). All of that was removed in the professional-portfolio overhaul.
> The current spec is [09-current-spec.md](./09-current-spec.md) plus `CLAUDE.md`. Do not
> implement from this file.

---

# Motion Rules

The brief's standard: *smooth, slow enough to feel premium, gradual, cinematic, controlled.* The
failure mode to design against is not "too little motion" — it is a page that feels restless.

## The rules

1. **Nothing moves the page except the visitor.** Scroll position may only be set in direct
   response to a click or keypress on a navigation control, via `scrollToSection`. Everything else
   observes.
2. **Ambient motion is slow and out of phase.** Nothing ambient cycles faster than ~5s, most run
   6–17s, and anything repeated (conduit nodes, stars, embers) carries a per-element delay.
   Elements pulsing in unison read as a blinking interface, not as a living place.
3. **Reveals happen once.** `useReveal` unobserves on first intersection. Re-animating on every
   scroll-back is the single biggest contributor to a page feeling cheap.
4. **Opacity and small translation only.** No scale-in, no rotation, no bounce, no spring
   overshoot, nothing entering from off-screen. The reveal is 18px of lift and a fade.
5. **Colour changes ease; they never jump.** Atmosphere damps continuously; the light/dark swap
   crossfades under a view transition.
6. **Two or three concurrently animating things per view.** Ambient motion counts as one budget
   item collectively, not per element.
7. **Everything is switchable, twice.** `prefers-reduced-motion` for the OS setting,
   `[data-motion="off"]` for the in-app toggle. Content never depends on an animation running.

## Timings

| Motion | Duration | Easing | Where |
|---|---|---|---|
| Mood crossfade | 1100ms | `ease-in-out` | `AtmosphereStage` |
| Haze / weather change | 1400ms | default | `AtmosphereStage` |
| Key-light travel | 1600ms | `ease-out` | `AtmosphereStage` |
| Atmosphere damping | λ = 3.2/s | exponential | `ThemeDriver` |
| Light ↔ dark crossfade | 620ms | `cubic-bezier(.4,0,.2,1)` | `::view-transition-*` |
| Content reveal | 900ms | `cubic-bezier(.22,.61,.36,1)` | `.reveal` |
| Card disclosure | 420ms | `cubic-bezier(.22,.61,.36,1)` | `::details-content` |
| Navigator show/hide | 500ms | default | `SideNavigator` |
| Navigator idle timeout | 2400ms | — | `SideNavigator` |
| Ambience crossfade | 2200ms | linear | `audioManager` |

Under reduced motion, every duration collapses to ~1ms and `.reveal` renders at full opacity with
no animation at all — the content is never trapped behind an effect that will not run.

## Ambient catalogue

Defined once in `globals.css`, applied by class in the mood SVGs.

| Class | Period | Motion | Used by |
|---|---|---|---|
| `sway-slow` | 13s | ±0.55° rotate | the meadow's lone tree |
| `sway-soft` | 9s | ±1.1° skew | grass, reeds, fern fronds |
| `sway-canopy` | 17s | 6px drop + ±0.25° | the Grove's canopy arch |
| `drift-slow` | 11s | ±6px translate | the river's inner current |
| `pulse-node` | 6s | opacity + radius | the Jungle's Aether nodes |
| `twinkle` | 5s | opacity 0.25→0.85 | the Observatory's stars |
| `ember` | 7s | rise 90px, fade out | the campfire's embers |
| `breathe` | 8s | opacity 0.82→1 | the campfire's light pool |

`breathe` is the one place a glow is allowed to change strength, because that is what fire
actually does. Anywhere else it would be a pulsing UI element.

## Parallax

Three planes, translated by a fraction of total page scroll: far 0.35, mid 0.7, near 1.15 — of a
**130px total range across the entire page**. That is a depth cue, not a ride. Beyond roughly
1.3× base, parallax stops reading as depth and starts reading as a web effect.

Driven by a single rAF-coalesced scroll listener writing one `--parallax` variable; the three
planes are pure CSS `translate3d` off it.

## Particles

One pass, one canvas, three variations on the same system — the world should read as the same
place in different conditions, not as three effects.

| Weather | Size | Alpha | Speed | Token |
|---|---|---|---|---|
| Clear | 1–2.4px | 0.18–0.5 | 6 px/s | `--aether` |
| Mist | 90–220px | 0.025–0.07 | 4 px/s | `--haze` |
| Rain | streaks | 0.1–0.26 | 340 px/s | `--haze` |

Particles are stamped from a pre-rendered soft radial sprite, rebuilt only when the token colour
actually changes. Hard-edged circles at mist's size read as floating bubbles — a real bug caught
in a browser, not in review.

Only `clear` uses the Aether. It is the site's one recurring motif; weather does not get to borrow
it. Count comes from device tier (`low` = 0), and the loop stops entirely on `visibilitychange`.