# Roadmap

Five phases, following the reboot brief. Each phase's gate must be honestly met — "honestly"
meaning the failure is fixed, not logged as a future TODO — before the next begins.

## Phase 1 — Audit & direction ✅

Audit the 3D build, identify what conflicts with the 2D brief, define the visual system, content
structure, motion rules and asset strategy.

- [x] 3D build audited; the reusable layers (content, state, most chrome) identified as such
- [x] Rendering, scroll and theme decisions each taken against a stated alternative — [00](./00-research-and-stack.md)
- [x] Visual system defined — [01](./01-design-specification.md)
- [x] Eight-section structure and six moods defined — [03](./03-scene-graph.md)
- [x] Motion rules defined — [06](./06-animation-bible.md)
- [x] Asset strategy defined — [05](./05-asset-list.md)

## Phase 2 — Structure & sections ✅

- [x] 3D layer deleted; `three`, `@react-three/fiber`, `drei`, `maath`, `lenis` removed
- [x] `src/content/sections.ts` as the single registry; scene-folder copy migrated
- [x] Eight sections built on `SectionShell`, reading only from `src/content/`
- [x] SDE and AI/ML visually distinct through two skins of one `ProjectCard`

**Gate:** every section is finished — no placeholder copy, no invented metric, no half-built
block. Met.

## Phase 3 — Motion & atmosphere ✅

- [x] Six hand-authored SVG moods, three depth planes each, crossfaded
- [x] Native CSS scroll-snap; `IntersectionObserver` reports, never drives
- [x] Two-mechanism theme system (damped atmosphere, view-transitioned surfaces)
- [x] Time-of-day: journey / live clock / four manual anchors
- [x] Weather: clear / mist / rain, as haze strength plus a particle pass
- [x] Idle-hiding side navigator, command footer, compact control panel

**Gate:** no motion is sudden, random or repeated on scroll-back; nothing moves the page except
the visitor. Met.

## Phase 4 — Classic mode ✅

- [x] `/classic` rebuilt on the same registry: same eight sections, same order, same copy
- [x] The SDE/AIML split mirrored, not collapsed into one "Projects" block
- [x] Renders against the same tokens, so theme choices survive the mode switch
- [x] Server-rendered, no observers, no rAF, no ambient motion

**Gate:** someone who only ever sees `/classic` gets the complete story, not a degraded stub. Met.

## Phase 5 — Optimisation, accessibility, SEO, QA

Partially done; the remainder is the live work.

- [x] `contrast-audit.test.ts` rewritten against the new palette — both families, both surface
      variants, every point on both rings, plus a CSS/TS drift assertion
- [x] Typecheck, lint and the 30-test suite green; production build clean
- [x] Both routes walked in a real browser at 1440×900; two visual defects found and fixed (the
      campfire's sawtooth horizon and logs drawn in their own ground colour; mist rendering as
      hard discs)
- [ ] Full keyboard-only pass on both routes — every control reachable, visible focus, no trap
- [ ] Mobile and tablet viewports walked (the navigator's bottom-edge layout is untested in a
      real browser)
- [ ] Axe pass on both routes
- [ ] Lighthouse on both routes, targeting 95+, with `three`/`lenis` confirmed absent from the
      production bundle
- [ ] Metadata refresh — the root layout's title and description still describe the 3D world
- [ ] Real ambient audio to replace the four synthesized placeholder beds

**Final gate (answer honestly, fix before calling it done)**
- [ ] Would a recruiter remember this after leaving it?
- [ ] Does the motion feel premium and calm, never restless?
- [ ] Does it read as a journey rather than a template?
- [ ] Does it still work with every effect off?
- [ ] Is `/classic` polished enough to stand alone?
- [ ] Does it load fast enough to feel serious?
