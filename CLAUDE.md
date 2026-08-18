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
> `src/scenes/`, a `MoodId`, a `place` field, a `creature` on a skill, a "Signals" section, or a
> WebGL fallback, it is stale. Git history is the only place any of it still lives. Do not
> reintroduce it.
>
> **Three deletions now.** Per-section biomes were built, at the owner's explicit request and
> against advice, then removed one pass later: eight cross-faded scenes read as *switching*, and a
> dissolve is still a cut with a ramp on it. The replacement is one continuous landscape per depth
> plane that slides horizontally — see `src/backdrop/world.tsx`. If you find `biomes/`,
> `BiomeStack`, `biomeOpacity`, `--b0`…`--b7` or a `--play` custom property, it is stale.
>
> **Wildlife and visible weather came back one pass later**, as an *ecosystem* rather than as
> effects — see `ecosystem.ts` and `terrain.ts`.
>
> **Sky life was then asked for by name and built**: fireflies (`ParticleField.tsx`) and a
> twinkling star field with two rare meteors (`Sky.tsx`), on top of the birds that were already
> wildlife. All four are gated by `deriveScene` and proved by `scene-plausibility.test.ts`. Canopy
> drips are still gone and should stay gone without being asked.

**Non-negotiables (do not relitigate these mid-build):**
- **2D only.** The backdrop is a layered illustrated forest — sky, stars, sun/moon, cloud band,
  four silhouette depth planes, light shafts, and one small canvas carrying dust, drifting leaves,
  precipitation *and* fireflies. See `src/backdrop/`. No WebGL, no 3D, no video, no Lottie.
- **One canvas, not one per effect.** Fireflies draw as a second pass inside `ParticleField`'s
  existing rAF loop. Anything else that is "many small moving points" belongs there too; a second
  canvas would be a second loop for two passes that run back to back.
- **One continuous world, not a set of scenes.** Each depth plane is a single wide strip generated
  along its length from `shapes.tsx`; scroll slides them horizontally at per-depth rates. Sections
  are *viewpoints* onto it, never owners of it. There is no transition to tune because there is no
  transition.
- **`terrain.ts` is the story.** Six continuous functions of world position — elevation, canopy,
  openness, understory, water, engineered — describe the journey (valley → trail → old forest →
  engineered wood → stream → lake → hills → viewpoint). Every generator samples them. Never add a
  place; change a curve.
- **One animated node per animal, and timing is what makes species distinct.** The animation
  budget is **measured, not asserted** — count it with `document.getAnimations()` scoped to the
  stage rather than trusting this number, which has been wrong three times:

  | | loops |
  |---|---|
  | base (cloud 3, canopy 6, mist 4, frond 5, grass 2) | 20 |
  | water reflection bands | 6–9 |
  | day only: light shafts | 2 |
  | night only: star groups 3 + meteors 0–2 | ≤5 |
  | creatures, capped by `MAX_CONCURRENT` (a bird event is 3 nodes) | ≤5 |

  Day and night sky life are mutually exclusive, so the ceiling is ~37 and the **measured** range
  is 26 (night/snowy) to 34 (dusk/breeze). Adding a second gesture to a species doubles its cost
  for a second reading of the same idea. Fireflies are canvas, so they cost **zero** loops.
- **Stars live in `Sky.tsx`, birds in `ecosystem.ts`, fireflies in `ParticleField.tsx`.** Birds are
  wildlife and get their rarity, rain-sheltering and day-gating from the scheduler for free — do
  not add a second bird system for the sky. Stars are three nodes for the whole field (thirds on
  coprime periods, which is what makes the twinkle look irregular without one node per star),
  faded continuously by sun altitude.
- **Rise and dip are geometry, not animation.** The bird's flight path undulates because `poseAt`
  returns a `y`, not because anything animates. Wind reaction rides on `bird-flap`'s `--sway` term,
  where it scales the *depth of the downstroke*. Both were free; a wrapper carrying a vertical loop
  would have made a bird 4 nodes. **`bird-flap` must never translate Y** — it did, and a flock that
  bobs while its wings squash reads as falling debris rather than as anything flying.
- **Birds fly above the hero card, in `--layer-fore`.** Two rules that both exist because the birds
  were invisible for a whole pass: `GROUND_Y.bird` is 88 of 900 because the hero panel spans
  roughly 12–57% of the viewport and a bird at 210 spent every crossing behind a 0.88-alpha
  surface; and anything drawn against the *sky* needs the darkest plane token, because
  `--layer-mid` is a pale blue-grey against a near-white daytime sky.
- **The flock and the flight are both generated per appearance, not fixed.** Two to five birds on a
  jittered diagonal skein, and `flightOf` seeds the entry height, slope, amplitude, wavelength and
  span. A fixed arrangement on a fixed line is a logo. `flightOf`'s ranges sum to a **bounded
  envelope** — widen any of them and redo the sum, or birds start dropping onto the hero card.
- **Wildlife renders at 1Hz, so anything that travels carries a CSS transition.** `EVENT_HZ = 1` is
  right; re-rendering React at 60fps to move a silhouette would not be. But a bird crosses ~1900
  units in 34s, so a static transform recomputed once a second jumps ~56 units at a time — which is
  what "hopping" was. `transition: transform 1000ms linear` interpolates between the samples on the
  compositor. It needs `transform-box: view-box; transform-origin: 0 0` to match the attribute's
  coordinate semantics.
- **Wildlife is a pure function of the world clock, never a simulation.** `ecosystem.ts`. That is
  what makes the world persist across scroll and reload for free: a position that was never stored
  cannot be lost. Habitats are predicates over the terrain, so animals follow the landscape.
- **Weather reaches everything at once** — haze, cloud, wind, water chop, which animals shelter,
  and the soundscape. Six scalars in `WEATHER` (veil, cloud, gust,
  drops, flakes, chop), one source.
- **Wind is one number.** `--sway`, written 4×/sec, modulating CSS loop *amplitude*; every shape
  multiplies it by its own `--stiff`. Trunks barely move, reeds whip. The ordering is the point.
- **The forest is quiet or it is wrong.** Scene detail begins below `SCENE_HORIZON` (66% of the
  frame); above that is open sky, which is where the content sits. Every animation is
  `transform`/`opacity` only (compositor-only — nothing else may be animated here), amplitudes
  are fractions of a degree, and loop durations are **coprime** so the scene never visibly
  repeats. See `src/backdrop/scene.ts`.
- **Artwork supplies shape, the palette supplies colour.** Planes render as flat fills of
  `--layer-*`, so one silhouette serves all five times of day and both colour modes. Never bake
  colour into a plane — see [docs/10-scene-assets.md](./docs/10-scene-assets.md).
- **Persisted preferences are untrusted input.** They can have been written by an older build.
  `useAppStore` versions and migrates them, and `resolveTheme`/`atmosphereAt` degrade rather than
  throw — a stale `timeMode` once crashed ThemeDriver and left the whole site unstyled.
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
- **A collapsed project card still shows the stack.** What is collapsed is the *detail* —
  problem, contribution, metrics, links — never the title, year, summary or stack. The version
  that hid the stack behind the toggle was unscannable and had to be flattened; the fix was
  promoting the stack, not abandoning disclosure. Do not re-hide it, and do not replace the
  native `<details>` with JS state.
- **The cards are independent panels, not an exclusive accordion.** They were `<details name="…">`
  — one open per track — through several passes, and the owner reversed it deliberately: any
  number may now be open at once. **Do not reinstate the `name` attribute.** A single shared
  `DisclosureToggle` per track opens or closes all of them, and is progressive enhancement over
  markup that already works without it.
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
- `src/backdrop/` — the forest. `scene.ts` is its one config file (depth planes, drift and
  parallax rates, loop durations, phase offsets, celestial arc) and holds `deriveScene`;
  `shapes.tsx` is the shape vocabulary every mark comes from; `world.tsx` generates the four
  strips along their length; `Layer.tsx` is the slot each strip plugs into and sizes its box to
  match; `Celestial.tsx` is the sun and moon; `ParticleField.tsx` is the single canvas.
  `terrain.ts` is the world's shape, `ecosystem.ts` its wildlife, `wind.ts` its weather-in-motion,
  `Water.tsx` the lake and its banded reflection, `Wildlife.tsx` the animal silhouettes.
  `useSceneScroll.ts` is the scene's **only** connection to scroll position and writes exactly one
  variable; `useWorldClock.ts` owns the world clock and the wind.
- `src/sections/` — the eight content sections plus `SectionShell` (the shared frame) and
  `ProjectCard` (one card, one skin). All server components; interactivity is isolated into
  `components/shared/{Reveal,SectionJumpButton}.tsx`.
- `src/systems/` — `theme/` (OKLCH → CSS variables), `scroll/` (observer + jump), `audio/`,
  `easter-egg/`.
- `src/state/` — the Zustand store; only deliberate visitor choices are persisted.
- `src/app/` — routing only. `/` (full) and `/classic`, plus `opengraph-image`/`twitter-image`,
  which are two-line re-exports of `lib/og-card.tsx`. Everything is prerendered; the build has no
  dynamic routes, so the whole site can be served from a CDN.
- `src/components/` — shadcn primitives, shared chrome, `classic/ClassicHeader`.
- `assets/fonts/` — three OFL `.woff` files, for the OG card only. They are **not** the site's
  fonts (those come from `next/font/google`); satori cannot read `woff2`, so the card needs its
  own copies. Build-time only, never served.
- **`/classic` renders the same section components as `/`**, with `data-plain` on `<main>`
  switching off the reveal. It is not a fork — an earlier version duplicated every section into
  `components/classic/*` and the two silently drifted apart.
- `scripts/axe-audit.mjs` (`npm run test:a11y`) — WCAG audit of both routes in both families.
  Needs a server on :3000.
- `scripts/encode-audio.mjs` (`npm run audio:encode`) — derives `public/audio/*.m4a` from the
  originals in `tracks/`. **`tracks/` is the archive and is gitignored; `public/audio/` is the
  artifact and is committed.** Basenames are preserved exactly, space and all, so `night .mp3`
  becomes `night .m4a` and resolves as `night%20.m4a`. Never hand-copy a file into `public/audio`
  — a test fails if an `.mp3` appears there.

## Design system quick reference

- Typography: Instrument Serif (display only) + Instrument Sans (body/UI) + JetBrains Mono
  (data-shaped content: metrics, eyebrows, stack pills).
- **Two token systems, and the split is structural, not a convention.**
  - *Atmosphere* tokens (`--sky-*`, `--glow`, `--aether`, `--layer-*`) are decorative and drift
    continuously in OKLCH. They must never be a text colour. They *are* sampled by the contrast
    audit, because the page scrolls and a panel genuinely passes over the forest planes.
  - *Surface* tokens (`--surface*`, `--ink*`, `--border-soft`, `--focus-ring`) are
    contrast-critical, take exactly one of two discrete values, and are swapped atomically inside
    a view transition. **Never interpolate them** — a light↔dark lerp passes through
    mid-grey-on-mid-grey, which fails WCAG for the whole animation. `contrast-audit.test.ts`
    enforces this and also asserts the CSS defaults match `palette.ts`.
- **The sun's altitude decides both the family and the position within it.** Light *is* the sun's
  arc and dark *is* the moon's, so colour mode and time of day are two views of one quantity, not
  two independent controls — `uiSlice` keeps the pair consistent and `systems/theme/sky.ts` is the
  only thing in the codebase that reads the clock. They used to be orthogonal, which is what let a
  visitor pin "night" inside the light family and get a palette that was neither.
- **Nothing in the scene branches on time or weather except `deriveScene`.** It is pure, it keys
  off sun altitude rather than named times, and `scene-plausibility.test.ts` sweeps every ten
  minutes of a day against every weather in both families to prove the forbidden combinations —
  fireflies in rain, stars through falling snow, god rays after dark, a meteor over a cloud —
  cannot be expressed. Add a new scene element by adding a rule there, never by branching in a
  component. **Every gate is a continuous 0–1 scalar wherever the eye could catch the transition**;
  a boolean snaps, and a snap reads as an effect switching on rather than as evening arriving.
- **Check a new sky rule against the *presets*, not just the clock.** `dusk` anchors at 18.1h,
  which is +6.0° of altitude against an 18:30 sunset, and `dawn` at 6.6h is +9.0°. A firefly ramp
  keyed to the horizon looked right across a swept day and gave the one setting named "dusk" no
  fireflies at all.
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
