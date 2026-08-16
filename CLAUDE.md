# CLAUDE.md

Conventions for this project. Read this fully before starting any phase's work.

## What this is

A calm, premium, **2D-first** portfolio for a Software & AI/ML engineer. Clean, professional and
recruiter-legible first; atmospheric second. The content is the product — the design's job is to
get out of its way.

> **Two deletions, both deliberate.** The project was first a React Three Fiber world (six 3D
> biomes, Lenis camera). That was removed on `reboot/2d-portfolio`. It was then a 2D
> *storybook world* with six illustrated moods and fantasy place names — "Entrance Meadow",
> "Ancient Grove", "Mechanical Jungle", "Moonlit Observatory", "Campfire Terminal". **That was
> removed too.** If you find a reference to Three.js, R3F, drei, `maath`, Lenis, `src/world/`,
> `src/scenes/`, a `MoodId`, a `place` field, a `ParticleField`, a `creature` on a skill, a
> "Signals" section, or a WebGL fallback, it is stale. Git history is the only place any of it
> still lives. Do not reintroduce it.

**Non-negotiables (do not relitigate these mid-build):**
- **2D only, and barely that.** The backdrop is a base gradient, two off-canvas radial glows, a
  veil and a grain tile — see `src/backdrop/Backdrop.tsx`. No illustration, no canvas, no
  particles, no WebGL.
- **Professional section names only.** Home, About, Experience, SDE Projects, AI/ML Projects,
  Skills, Education, Contact. No invented place names, no poetic headings ("Systems that have to
  hold" was one, and it is gone).
- No generic scroll animations, pop-ins, spinning cards, bounce effects, or random floating
  elements. No blinding light effects — the dark family's `glow` stays dim for this reason.
- **Never move the page for the visitor.** Scrolling is plain and native; JS may only *observe*
  scroll position, never drive it. The one exception is an explicit click or keypress on a
  navigation control. No scroll-snap — sections are sized by their content.
- **The palette never depends on scroll position.** Time of day is a *setting*
  (`TimeMode`), not a function of how far down the page someone is.
- **A collapsed project card still shows the stack.** The cards are a native
  `<details name="…">` exclusive accordion, and what is collapsed is the *detail* — problem,
  contribution, metrics, links — never the title, year, summary or stack. The version that hid
  the stack behind the toggle was unscannable and had to be flattened; the fix was promoting the
  stack, not abandoning disclosure. Do not re-hide it, and do not replace the native `<details>`
  with JS state.
- **One content width, 1024px, for every section and the hero** — see `CONTENT_GRID`. Prose is
  capped *inside* it, never by narrowing the grid. Three competing widths is what put the section
  headings on three different left edges.
- Motion is slow, damped and gradual — a transition should read as light changing, not as a
  toggle flipping. Nothing jitters, nothing is random.
- **No career timeline anywhere.** Education and the internship are compact cards.
- `prefers-reduced-motion` is respected everywhere, *and* the in-app motion toggle must switch
  off the same animations (the media query cannot see it — see `[data-motion="off"]` in
  globals.css). Core content stays fully usable with every effect off.
- Content is grounded in the PDF in `resume/`, and the Resume button serves **that exact file**
  from `public/` — never a PDF generated from the content modules. No invented metrics,
  achievements, timelines or proficiency ratings; an empty `metrics` array is the honest
  representation of a project with no published numbers.
- Target 60 FPS, Lighthouse 95+, SEO-first, accessibility-first, in both modes.
- Research before deciding on any uncertain design/technical choice — compare real alternatives,
  don't default to the first idea.

The live spec is [docs/09-current-spec.md](./docs/09-current-spec.md). **`docs/00`–`docs/08`
predate this overhaul and are marked superseded** — they describe the mood system, the scene graph
and the place names. Do not implement from them.

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

## Confirmed stack

Next.js 16 (App Router, TypeScript, `src/`) · Tailwind CSS v4 (CSS-first `@theme`, no
`tailwind.config.js`) · shadcn/ui (`base-nova` preset, copy-in components) · Motion
(`motion/react`, available for DOM micro-interactions) · Zustand (preferences and navigation
state, slices pattern) · Howler.js (opt-in ambient beds) · `lucide-react` (UI icons; it has **no**
brand icons, so GitHub/LinkedIn are inlined in `components/shared/BrandIcons.tsx`) · `culori`
(dev-only, for the contrast audit — the runtime OKLCH lerp is hand-rolled in
`systems/theme/palette.ts` so no colour library ships to the browser).

**Removed, do not reintroduce:** `three`, `@react-three/fiber`, `@react-three/drei`, `maath`,
`lenis`, `tw-animate-css`, `gsap`, `@anthropic-ai/sdk`, `@react-pdf/renderer` (the resume is a
static file, not a generated document).

## Architecture at a glance

- `src/content/` — the single shared content layer, including `sections.ts`: the section registry
  (id + label only) that the navigator, the scroll observer and `/classic`'s anchors read from.
  **Both** modes read from here; never duplicate copy.
- `src/backdrop/Backdrop.tsx` — the whole fixed backdrop, as a server component with no state,
  no effects and no scroll listener.
- `src/sections/` — the eight content sections plus `SectionShell` (the shared frame) and
  `ProjectCard` (one card, one skin). All server components; interactivity is isolated into
  `components/shared/{Reveal,SectionJumpButton}.tsx`.
- `src/systems/` — `theme/` (OKLCH → CSS variables), `scroll/` (observer + jump), `audio/`,
  `easter-egg/`.
- `src/state/` — the Zustand store; only deliberate visitor choices are persisted.
- `src/app/` — routing only. `/` (full) and `/classic`. Both static; the build has no dynamic
  routes, so the whole site can be served from a CDN.
- `src/components/` — shadcn primitives, shared chrome, `classic/ClassicHeader`.
- **`/classic` renders the same section components as `/`**, with `data-plain` on `<main>`
  switching off the reveal. It is not a fork — an earlier version duplicated every section into
  `components/classic/*` and the two silently drifted apart.
- `scripts/axe-audit.mjs` (`npm run test:a11y`) — WCAG audit of both routes in both families.
  Needs a server on :3000.

## Design system quick reference

- Typography: Instrument Serif (display only) + Instrument Sans (body/UI) + JetBrains Mono
  (data-shaped content: metrics, eyebrows, stack pills).
- **Two token systems, and the split is structural, not a convention.**
  - *Atmosphere* tokens (`--sky-*`, `--glow`, `--aether`) are decorative and drift continuously
    in OKLCH. They must never be a text colour or sit behind text.
  - *Surface* tokens (`--surface*`, `--ink*`, `--border-soft`, `--focus-ring`) are
    contrast-critical, take exactly one of two discrete values, and are swapped atomically inside
    a view transition. **Never interpolate them** — a light↔dark lerp passes through
    mid-grey-on-mid-grey, which fails WCAG for the whole animation. `contrast-audit.test.ts`
    enforces this and also asserts the CSS defaults match `palette.ts`.
- Colour mode picks the palette *family*; time-of-day picks the position *within* it. That is what
  lets light mode, dark mode and time-of-day all be real controls without fighting.
- `--aether` is the one recurring accent hue (teal). It never changes hue across the ring, which
  is what keeps it reading as an identity rather than as lighting.
- **The two tracks share one card and one layout.** The SDE/AI-ML split is stated by the headings.
  Styling one track differently implies the other is the side interest.

## Phase status

Track current phase and what's done/pending in `SESSION.md`, not here — this file is
conventions, not a status log.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
