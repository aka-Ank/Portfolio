# Research & Stack

Every decision below was taken against a real alternative, not chosen by default. Where a choice
reverses an earlier one, the reversal and its reason are stated rather than quietly dropped.

## 0. The reboot

This project began as a React Three Fiber world: six 3D biome scenes, a scroll-driven camera rig
on Lenis + GSAP ScrollTrigger, `maath` damping, a WebGL fallback path and a preloader. It worked.
It was deleted anyway, because the brief it was built against is not the brief this project now
has: a calm, premium, **2D-first** interactive storybook, not a 3D demo.

That reframing invalidates the 3D stack at the root, not at the margins, so the rest of this
document re-derives the stack from the current brief rather than patching the old one.

## 1. Rendering: hand-authored inline SVG, not WebGL

**Option A — keep Three.js, render flat layers through an orthographic camera.** Preserves the
existing scene-composition work and the time-of-day system. But it keeps every cost the 2D brief
exists to remove: ~600 KB of runtime, a GPU dependency, a WebGL-unavailable fallback path to
maintain, an SSR-unsafe canvas, and a scene graph to reason about — all to draw shapes that never
move in Z.

**Option B — inline SVG layers + CSS, with one small 2D canvas for particles.** SVG is
theme-aware through CSS custom properties (a mood re-colours itself when the palette drifts, with
no re-render), costs kilobytes, animates via compositor-friendly transforms, is server-rendered,
and is inspectable. Its one genuine weakness is many independently-moving elements, which is
exactly what the particle canvas is for.

**Chosen: B.** Backgrounds are hand-authored per mood in `src/scenes/atmosphere/moods/`, each
exporting three depth planes. Ambient particles use a plain `CanvasRenderingContext2D` — no
library — stamping a pre-rendered soft sprite.

*Rejected along the way:* Haikei-generated wave/blob SVGs. Fast to adopt, but they read as
generated, and every portfolio using them looks like every other one. Bespoke shapes are the
difference between "a template" and "his site".

*Rejected:* Lottie. It would mean authoring in After Effects and shipping a JSON runtime for
motion that CSS already expresses in a line.

## 2. Scroll: native CSS scroll-snap, not a smooth-scroll library

**Option A — Lenis (the previous choice).** Continuous inertial scrolling. It is well-built, but
it is also literally the "page dragging itself around" the brief rules out, and it overrides the
visitor's own input device — a real accessibility problem, not a stylistic one.

**Option B — native `scroll-snap-type: y mandatory` with `snap-start` per section.** The browser
owns the movement, so it honours OS scroll settings, trackpad momentum, keyboard paging, screen
readers and reduced-motion for free, and cannot jank or fight input. JS is reduced to an
`IntersectionObserver` that only *reports* which section arrived.

**Chosen: B.** `src/systems/scroll/`. The invariant worth stating: **nothing in this codebase may
set scroll position except in direct response to a click or keypress on a navigation control**
(`scrollToSection`). Sections are `min-h-dvh` and may grow past the viewport — a section that
clipped its own content to protect a snap point would be choosing the effect over the content.

GSAP remains a dependency but is no longer used; it was kept only for scroll orchestration.

## 3. Theme: two token systems, two different mechanisms

The requirement is genuinely three-dimensional: a polished light mode, a polished dark mode, a
time-of-day that shifts gradually, and never an instant palette swap.

The naive implementation — interpolate every token — is unsafe. Lerping light ink (L 0.18) on
light paper (L 0.99) toward dark ink (L 0.96) on dark paper (L 0.18) passes through roughly
L 0.57 on L 0.57: a contrast ratio near 1:1, held for the entire animation.

**Chosen: split by risk.**
- *Atmosphere* tokens are decorative and never sit behind text, so they damp continuously in
  OKLCH via one rAF loop writing CSS variables (`ThemeDriver`).
- *Surface/ink* tokens take exactly one of two discrete values and are swapped atomically inside
  `document.startViewTransition()`. The crossfade is a compositor-level blend of two states that
  each pass WCAG, so no frame is ever unreadable — and it still reads as a dissolve. Browsers
  without view transitions get an instant, still-correct swap.

**Colour mode picks the family; time-of-day picks the position within it.** Light mode walks
dawn → golden hour, dark mode walks dusk → deep night. This is what lets all three controls be
real without any of them contradicting another.

*Rejected:* shipping `culori` to the browser. It is a fine library, but the runtime needs one
shortest-arc OKLCH lerp, which is twenty lines. It stays a devDependency for the contrast audit,
where its correctness matters and its size does not.

## 4. Motion: CSS first, Motion for interaction

Ambient motion (sway, drift, twinkle, embers, the fire's breath) is CSS keyframes — declarative,
off the main thread, and switchable in one place. `motion/react` is kept for DOM interaction where
CSS is genuinely awkward. Content reveals are one-shot `IntersectionObserver` + CSS, never
re-triggered on scroll-back: re-animating on every pass is what makes a page feel restless.

Reduced motion is gated twice, because the two signals are different: `prefers-reduced-motion`
covers the OS setting, and `[data-motion="off"]` on `<html>` covers the in-app toggle, which the
media query cannot see.

## 5. Everything else

- **Next.js 16 App Router / TypeScript / Tailwind v4** — unchanged, and unaffected by the reboot.
- **shadcn/ui (`base-nova`)** — kept, but its tokens are now mapped onto the two systems above in
  `@theme` rather than kept as a third palette.
- **Zustand** — kept. The slices were always rendering-agnostic; only their contents changed.
  Persistence is limited to deliberate visitor choices, so navigation state never comes back stale.
- **Howler.js** — kept, opt-in only. Four ambient beds selected from the same resolved time value
  the palette uses, so what a visitor hears and what they see can never disagree.
- **Cut features:** voice navigation (a microphone-permission prompt earning almost nothing in a
  calm portfolio), the preloader (nothing heavy left to preload), the WebGL error boundary and
  fallback (nothing left to fall back from).
