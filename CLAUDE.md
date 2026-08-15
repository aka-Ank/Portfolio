# CLAUDE.md

Conventions for this project. Read this fully before starting any phase's work.

## What this is

A cinematic, narrative portfolio site — an explorable enchanted forest where AI and nature
coexist gently. Full mission, non-negotiable rules, and narrative structure are in the original
brief; the working decisions derived from it live in `docs/`. Read
[docs/00-research-and-stack.md](./docs/00-research-and-stack.md) through
[docs/08-roadmap.md](./docs/08-roadmap.md) before touching code in any later phase — they are
the actual spec, not background reading.

**Non-negotiables (do not relitigate these mid-build):**
- No generic scroll animations, pop-ins, spinning cards, cheap bounce effects, chaotic scroll
  surprises, or random flying components.
- Every scene must have narrative meaning; every component must justify its existence.
- Motion follows physics — spring, inertia, damping — never jitter or randomness.
- `prefers-reduced-motion` is respected everywhere; core content stays usable with effects off.
- Target 60 FPS, Lighthouse 95+, SEO-first, accessibility-first, including in immersive mode.
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
`tailwind.config.js`) · shadcn/ui (`base-nova` preset, copy-in components) · Three.js + React
Three Fiber v9 + drei · `maath` for damping/easing · GSAP (ScrollTrigger, Timeline, InertiaPlugin
— scroll orchestration AND scene-transition sequencing) · Lenis (smooth scroll) · Motion
(`motion/react`, formerly Framer Motion — DOM/UI micro-interactions) · Zustand (world state,
slices pattern) · Howler.js (layered ambience + SFX).

**Theatre.js from the original brief was dropped** — it's been effectively unmaintained since
2023. Scene-transition sequencing is a GSAP Timeline module instead. Don't reintroduce it without
re-checking its status first.

## Architecture at a glance (see docs/02 for full detail)

- `src/world/` — the immersive 3D engine (engine, state, systems, scenes, shared primitives).
  Framework-thin; `app/page.tsx` just mounts it.
- `src/content/` — the single shared content layer. **Both** the immersive experience and
  `/classic` read from here. Never duplicate content between the two modes.
- `src/app/` — routing only. `/` (immersive), `/classic`, `/blog`, `/api/*`.
- `src/components/` — shadcn primitives, shared chrome, classic-mode-only components.
- `docs/` — this phase's planning deliverables; treat as the living spec, update it if a later
  phase legitimately changes a decision (note the change and why, don't silently drift from it).

## Design system quick reference (see docs/01 for full detail)

- Typography: Instrument Serif (display only) + Instrument Sans (body/UI) + JetBrains Mono
  (data/metrics accents, Lab/Observatory/Campfire only).
- Color: two separate token systems — **world tokens** (sky/fog/light/Aether accent) shift
  continuously with time-of-day; **UI/chrome tokens** stay fixed for accessibility. Never merge
  these two systems.
- The "Aether" is the one recurring accent motif (teal→cyan life-force thread: river current,
  creature markings, lab conduits, campfire embers) — it appears only where narratively earned.

## Phase status

Track current phase and what's done/pending in `SESSION.md`, not here — this file is
conventions, not a status log.
