# Ankit Chaudhary — Portfolio

A calm, 2D-first portfolio: eight sections over a fixed atmospheric backdrop that shifts from dawn
to night as you move through it, plus a plainly-scrolling classic mode with identical content.

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Zustand · Howler. No WebGL, no smooth-scroll
library, no colour library at runtime.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
```

| | |
|---|---|
| `npm run build` | production build |
| `npm test` | Vitest suite, including the WCAG contrast audit |
| `npm run lint` | ESLint |

`/` is the immersive route, `/classic` the plainly-scrolling one. Both read from the same content
layer and render against the same theme tokens.

## Where things are

| Path | What |
|---|---|
| `src/content/` | every word on the site; `sections.ts` is the section registry |
| `src/scenes/atmosphere/` | the backdrop — six hand-authored SVG moods, three depth planes each |
| `src/scenes/sections/` | the eight sections |
| `src/systems/theme/` | `palette.ts` (pure OKLCH maths) and `ThemeDriver.tsx` (the only file that touches `document`) |
| `src/systems/scroll/` | the observer that reads scroll, and the one function allowed to write it |
| `docs/` | the actual spec — read `00` through `08` before changing anything |

## Two rules worth knowing before you edit

**Nothing may move the page except the visitor.** Scrolling is native CSS scroll-snap. JS observes
scroll position; it sets it only in direct response to a click or keypress on a navigation control.

**The two colour systems are not interchangeable.** Atmosphere tokens drift continuously and must
never sit behind text. Surface and ink tokens take one of two discrete values and are swapped
atomically — interpolating them passes through mid-grey-on-mid-grey and fails WCAG for the whole
animation. `src/lib/contrast-audit.test.ts` enforces both halves.

Conventions live in [CLAUDE.md](./CLAUDE.md).
