# Phased Implementation Roadmap

Four remaining phases, each a single continuous-pass session per `CLAUDE.md` conventions. Each
phase only starts once the previous one's acceptance criteria are met — no phase ships partial
scenes or partial systems "to come back to later."

## Phase 2 — Engine, World Foundation & Motion System

**Builds:** the systems every scene will run on top of. No final story content — a minimal test
scene proves the systems work together.

**Deliverables**
- Next.js app shell: `/` (immersive) and `/classic` routes, shared layout, design tokens from
  [01-design-specification.md](./01-design-specification.md) wired into Tailwind `@theme`.
- `world/state/` — the Zustand store and all four slices from
  [04-state-machines.md](./04-state-machines.md).
- `world/systems/time-of-day/` — continuous sky/light/fog interpolation.
- `world/systems/scroll-camera/` — Lenis + GSAP ScrollTrigger + damped camera rig.
- `world/systems/transitions/` — the reusable GSAP Timeline orchestration module.
- `world/systems/audio/` — Howler wrapper keyed off world-state, global mute + volume.
- `world/engine/PerformanceGovernor.tsx` — device-tier detection, adaptive quality, honors
  `prefers-reduced-motion`.
- One minimal test/proof scene exercising every system above.

**Acceptance criteria**
- [ ] Scrolling the test scene produces a damped, inertial camera move with no snap points.
- [ ] Time-of-day scalar animates continuously and every dependent token (sky, light, fog, audio
      mix) updates in sync — verified by scrubbing the scalar directly, not just via scroll.
- [ ] A scene transition (even a placeholder one) runs through the GSAP Timeline module, not
      one-off scene code.
- [ ] PerformanceGovernor visibly changes quality (DPR, particle count, or similar) when forced
      into a low-tier profile in dev tools.
- [ ] `prefers-reduced-motion: reduce` measurably changes the test scene's behavior.
- [ ] Reduced-motion and WebGL-unavailable fallback paths both render usable content.

## Phase 3 — Story World: All Seven Scenes

**Builds:** all seven locations from [03-scene-graph.md](./03-scene-graph.md) on the Phase 2
engine, one at a time, in narrative order.

**Deliverables**
- Entrance, Clearing, Knowledge River, Animal Sanctuary, Lab/Project Chamber, Observatory,
  Campfire — each with foreground/midground/background composition, scene-specific content
  wired from `src/content/`, and hooked into the shared systems (no one-off logic per scene).
- Sanctuary creature instancing/rig pattern; Lab project deep-dive + case-study mode; Observatory
  ceremonial timeline.
- Dynamic skybox reading live time-of-day state in every scene.
- Hidden lore objects (subtle, optional) and at least one easter egg beyond text.
- Per-scene documentation and basic tests, added as each scene is finished — not batched at the
  end.

**Acceptance criteria (per scene, checked before moving to the next)**
- [ ] Reads as a story chapter with its own mood, not a reskinned template section.
- [ ] Passes the composition rule check (three depth layers, one focal point, motion budget
      respected) from [01-design-specification.md](./01-design-specification.md) §4.
- [ ] Still legible and navigable with reduced motion / WebGL fallback active.
- [ ] Works at tablet/mobile viewport.
- [ ] Has at least a smoke test verifying it mounts and its content loads from `src/content/`.

**Acceptance criteria (whole phase)**
- [ ] Full journey walkthrough, Entrance → Campfire, has no jarring transition and no chapter
      that "still needs work" — the self-check from the brief's Phase 3 prompt applies literally.

## Phase 4 — Features, Integrations & Classic Mode

**Builds:** (A) supporting features, each held to the "does it improve understanding, memory, or
emotional connection" bar, and (B) the classic mode as a genuine second experience.

**Deliverables — Features**
- Manual day/night control (gradual, per [06-animation-bible.md](./06-animation-bible.md) theme
  transition spec).
- Ambient soundtrack + layered SFX with mute/volume surfaced in chrome (system already exists
  from Phase 2; this phase adds the UI).
- Voice navigation (intent → existing scene/nav state, no new navigation model).
- Grounded chatbot (resume/projects/structure), with a defined, verifiable grounding approach
  (retrieval over `src/content/`, not open-ended).
- Live GitHub activity, LeetCode stats, latest-blog-posts area.
- Certification timeline wired with real data (Observatory scene already built in Phase 3).
- Animated skill tree tied into the Sanctuary scene.
- Keyboard shortcuts (P, R, G, C, `/`) with visible hints and accessible help overlay.
- Scene bookmarks.
- Resume PDF export, reachable from both modes.
- Fast, tasteful preloader.
- Any newly sourced external asset checked against [05-asset-list.md](./05-asset-list.md)'s
  license rules before inclusion, logged in `ENGINEER_NOTES.md`.

**Deliverables — Classic mode**
- `/classic`: semantic HTML/CSS, minimal JS, same copy/structure as immersive (reading from the
  same `src/content/` layer), fast by default.
- Visible mode toggle, offered on first visit, preserves the visitor's place in the content when
  switching.

**Acceptance criteria**
- [ ] Every feature above can be justified in one sentence against the "improves understanding/
      memory/emotional connection" bar; anything that can't is cut, not shipped anyway.
- [ ] Classic mode independently passes its own walkthrough — someone who only ever sees
      `/classic` gets the complete story, not a degraded stub.
- [ ] Switching modes mid-visit preserves content position.
- [ ] Chatbot and voice features fail gracefully (clear message, no dead-end) if unavailable.

## Phase 5 — Optimization, Accessibility, SEO & Launch QA

**Builds:** nothing new-feature-shaped. Makes everything fast, discoverable, accessible, and
launch-ready, then runs the final quality gate honestly.

**Deliverables**
- Full pass against [07-accessibility-and-testing.md](./07-accessibility-and-testing.md)'s
  checklist and testing plan — fixed, not just logged.
- Instancing/LOD/lazy-loading/code-splitting audit; KTX2 texture + Draco model compression
  confirmed in the production build (not just planned).
- Semantic HTML, full metadata, OG tags + dynamic OG images, JSON-LD Person schema, sitemap,
  robots.txt, canonical URLs, structured blog — verified in a realistic production build.
- Zero layout shift; 60fps sustained in immersive mode; Lighthouse 95+ on both routes.
- Release checklist: verified vs. not-yet-verified vs. known follow-ups, stated plainly.

**Final quality gate (from the brief, answered honestly, fixed before calling it done)**
- [ ] Would a recruiter remember this site after leaving it?
- [ ] Does the motion feel premium and calm, never jittery or excessive?
- [ ] Does it feel like a story rather than a UI template?
- [ ] Does it still work with the fancy layers removed (reduced motion / WebGL failure)?
- [ ] Is the classic version polished enough to stand alone?
- [ ] Does it load fast enough to feel serious and professional?
