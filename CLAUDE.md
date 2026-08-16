# CLAUDE.md

Conventions for this project. Read this fully before starting any phase's work.

## What this is

A calm, premium, **2D-first** portfolio: an interactive storybook world where each section carries
its own atmosphere. Studio Ghibli × Horizon Zero Dawn in *mood*, never a literal 3D imitation.
The working decisions live in `docs/` — read
[docs/00-research-and-stack.md](./docs/00-research-and-stack.md) through
[docs/08-roadmap.md](./docs/08-roadmap.md) before touching code; they are the actual spec.

> **This project was rebooted from a 3D build.** An earlier version was a React Three Fiber
> world with six 3D biome scenes and a Lenis-driven camera. It was deliberately deleted, not
> deprecated. If you find a reference to Three.js, R3F, drei, `maath`, Lenis, `src/world/`, a
> WebGL fallback, a preloader, voice navigation, or "chapters", it is stale — the git history
> before `reboot/2d-portfolio` is the only place any of it still lives. Do not reintroduce it.

**Non-negotiables (do not relitigate these mid-build):**
- **2D only.** Layered SVG, CSS gradients and one small 2D canvas for ambient particles. No WebGL,
  no 3D scene graph, no camera rig.
- No generic scroll animations, pop-ins, spinning cards, cheap bounce effects, chaotic scroll
  surprises, or random flying components. No blinding light effects, no sudden transitions.
- **Never move the page for the visitor.** Scrolling is native CSS scroll-snap; JS may only
  *observe* scroll position, never drive it. The one exception is an explicit click or keypress
  on a navigation control.
- Every section must have narrative meaning; every component must justify its existence.
- Motion is slow, damped and gradual — a transition should read as light changing, not as a
  toggle flipping. Nothing jitters, nothing is random.
- **No career timeline anywhere.** Education and the internship are two compact cards.
- `prefers-reduced-motion` is respected everywhere, *and* the in-app motion toggle must switch
  off the same animations (the media query cannot see it — see `[data-motion="off"]` in
  globals.css). Core content stays fully usable with every effect off.
- Content is grounded in the real resume. No invented metrics, achievements or timelines; an
  empty `metrics` array is the honest representation of a project with no published numbers.
- Target 60 FPS, Lighthouse 95+, SEO-first, accessibility-first, in both modes.
- Research before deciding on any uncertain design/technical choice — compare real alternatives,
  don't default to the first idea.

## Working conventions

- **`SESSION.md`** is a running log of what was built, decided, and deferred. Update it
  continuously while working, not only at the end of a session.
- **`ENGINEER_NOTES.md`** is a technical scratchpad — open questions, TODOs, gotchas, research
  sources worth re-checking. Update it continuously.
- Both files are **gitignored and must never be committed or pushed** — they're private working
  files. This was set up in `.gitignore` before the first commit and must stay that way.
- **Build in continuous single-pass sessions.** Don't artificially pace work across days/weeks;
  work through a phase's deliverables in one continuous pass unless genuinely blocked on
  something only the project owner can decide.
- **No AI co-author attribution in commits.** No `Co-Authored-By: Claude` trailer or similar —
  commit messages read as written by the engineer alone.
- Each phase has a defined acceptance gate in
  [docs/08-roadmap.md](./docs/08-roadmap.md) — don't start the next phase until the current
  one's gate is honestly met. "Honestly" means fixing what fails the gate, not noting it as a
  future TODO.

## Confirmed stack (see docs/00 for full reasoning)

Next.js 16 (App Router, TypeScript, `src/`) · Tailwind CSS v4 (CSS-first `@theme`, no
`tailwind.config.js`) · shadcn/ui (`base-nova` preset, copy-in components) · Motion
(`motion/react` — DOM micro-interactions) · GSAP (available; currently unused after the reboot
removed scroll orchestration — do not add it back for scrolling) · Zustand (preferences and
navigation state, slices pattern) · Howler.js (opt-in ambient beds) · `culori` (dev-only, for the
contrast audit — the runtime OKLCH lerp is hand-rolled in `systems/theme/palette.ts` so no colour
library ships to the browser).

**Removed in the reboot, do not reintroduce:** `three`, `@react-three/fiber`, `@react-three/drei`,
`maath`, `lenis`, `tw-animate-css`.

## Architecture at a glance (see docs/02 for full detail)

- `src/content/` — the single shared content layer, including `sections.ts`: the section registry
  (id, label, place, mood, time-of-day) that the navigator, the scroll observer, the theme driver
  and `/classic`'s anchors all read from. **Both** modes read from here; never duplicate copy.
- `src/scenes/atmosphere/` — the fixed backdrop. `AtmosphereStage` composes sky, key light, the
  six hand-authored SVG moods (crossfaded), the haze band and `ParticleField`. Each mood renders
  three depth planes (`far`/`mid`/`near`); a mood missing one reads flat and is not shipped.
- `src/scenes/sections/` — the eight content sections plus `SectionShell` (the shared frame) and
  `ProjectCard` (one card, two skins).
- `src/systems/` — `theme/` (OKLCH → CSS variables), `scroll/` (observer + jump), `audio/`,
  `easter-egg/`.
- `src/state/` — the Zustand store; only deliberate visitor choices are persisted.
- `src/app/` — routing only. `/` (immersive), `/classic`, `/api/*`.
- `src/components/` — shadcn primitives, shared chrome, classic-mode components.
- `docs/` — the living spec. If a later change legitimately supersedes a decision, update the doc
  and say why; don't silently drift from it.

## Design system quick reference (see docs/01 for full detail)

- Typography: Instrument Serif (display only) + Instrument Sans (body/UI) + JetBrains Mono
  (data-shaped content: metrics, eyebrows, the AI/ML track).
- **Two token systems, and the split is structural, not a convention.**
  - *Atmosphere* tokens (`--sky-*`, `--haze`, `--layer-*`, `--glow`, `--aether`) are decorative
    and drift continuously in OKLCH. They must never be a text colour or sit behind text.
  - *Surface* tokens (`--surface*`, `--ink*`, `--border-soft`, `--focus-ring`) are
    contrast-critical, take exactly one of two discrete values, and are swapped atomically inside
    a view transition. **Never interpolate them** — a light↔dark lerp passes through
    mid-grey-on-mid-grey, which fails WCAG for the whole animation. `contrast-audit.test.ts`
    enforces this and also asserts the CSS defaults match `palette.ts`.
- Colour mode picks the palette *family*; time-of-day picks the position *within* it. That is what
  lets light mode, dark mode and time-of-day all be real controls without fighting.
- The "Aether" is the one recurring accent motif (teal→cyan: the river's current, the Jungle's
  conduits, the Observatory's dome slit, the campfire's embers). It never changes hue, and
  weather never borrows it — that is what keeps it reading as a symbol rather than as lighting.
- Sections are *moods*, not places. Six moods across eight sections; SDE is organic (Ancient
  Grove), AI/ML is instrumented (Mechanical Jungle) — same card, two skins.

## Phase status

Track current phase and what's done/pending in `SESSION.md`, not here — this file is
conventions, not a status log.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
