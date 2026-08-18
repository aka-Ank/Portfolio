> **SUPERSEDED — historical record only.**
> Written for the illustrated-mood build (six SVG moods, fantasy place names, scroll-driven
> time of day, scroll-snap). All of that was removed in the professional-portfolio overhaul.
> The current spec is [09-current-spec.md](./09-current-spec.md) plus `CLAUDE.md`. Do not
> implement from this file.

---

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
- [x] Keyboard behaviour verified on `/`: focus pins the navigator visible, the control panel
      traps Tab and restores focus to its trigger on `Escape`
- [x] `/classic` Tab sweep, with real key presses rather than programmatic `.focus()` — the
      latter does not set `:focus-visible` on a button, so it measures the wrong thing and reports
      every control as having no focus ring. 34 stops, all with a 2px solid ring at 2px offset,
      order is skip link → header nav → hero → sections in document order → footer chrome, no
      trap, exits cleanly to browser chrome. Elements measured out of view mid-sweep are an
      artefact of `scroll-behavior: smooth`, not a defect — they are in view once the scroll
      settles. A VoiceOver pass is still outstanding
- [x] Mobile walked at 390×844; the navigator/command-strip collision found and fixed
- [x] Tablet (768×1024, 1024×768) and a WCAG 2.5.8 touch-target sweep on both routes, computing
      the spacing exception rather than only the 24×24 minimum. Everything undersized passed by
      spacing, but the sound popover's caret was 18×22 — the smallest thing on the page to hit on
      a phone, inside the guideline only on a technicality. Its box is now 24×32; the caret itself
      did not move. The remaining sub-24px targets are inline links inside running text, which the
      inline exception covers
- [x] Axe (via Lighthouse) on both routes: 100. One real failure found and fixed — the footer's
      state summary used `text-[var(--ink-muted)]/70`, measuring 3.57:1. The contrast audit works
      on token *pairs*, so an opacity modifier in a className is exactly what it cannot see
- [x] Lighthouse against a production build. `three`/`lenis` confirmed absent from the bundle

      **Desktop preset** — which is what the earlier 92/96 in this file were, though it did not
      say so:

      | Route | Perf | A11y | Best practices | SEO | CLS | TBT | LCP |
      |---|---|---|---|---|---|---|---|
      | `/` | 99 | 100 | 100 | 100 | 0 | 80ms | 0.8s |
      | `/classic` | 100 | 100 | 100 | 100 | 0 | 30ms | 0.6s |

      **Mobile preset** (4× CPU throttle), measured for the first time and worth stating plainly:

      | Route | Perf | TBT | LCP |
      |---|---|---|---|
      | `/` | 67 | 860ms | 3.9s |
      | `/classic` | 89 | 290ms | 2.9s |

      `/` started at 80 on desktop. Two structural fixes got it there: `page.tsx` was
      `"use client"`, which pulled all eight sections into the client bundle even though six are
      pure markup — it is now a server component with the observer isolated in
      `<SectionObserver>` and the reveal in `<Reveal>`; and the chat widget (the only thing
      importing `motion/react`) is now lazy
- [ ] The real remaining performance lever is **mobile `/`**, not desktop. Bootup is 2.0s, of
      which 2.1s of CPU is the 229KB react-dom chunk and 0.96s the app chunk; the prerendered HTML
      is only 250KB and ~650 SVG nodes, so this is hydration cost, not DOM size. `/classic` scores
      89 on the same framework, which is the measure of what the backdrop's client components add.
      (The lever this file used to name — "render only the moods that have been visited" — is
      stale; moods were removed two rebuilds ago)
- [x] Metadata refreshed — the root title and description now describe the engineer, not a forest
- [x] A static OG image. `src/lib/og-card.tsx`, shared by `opengraph-image` and `twitter-image`,
      prerendered to PNG at build time. The skyline is sampled from `groundY()` — the same
      function the live backdrop draws from — so it cannot fall out of date when `terrain.ts`
      changes. Dusk rather than night because the dark family's four layer colours run #050914 →
      #000204 against a #0a0f1c sky, which would be four blacks on black. Colours are sRGB
      literals because satori cannot parse `oklch()`, and `og-card.test.ts` converts the real
      tokens with culori and asserts every one matches
- [x] Real ambient audio, replacing the four synthesized placeholder beds. Ten recordings, wired
      as a bed plus N concurrent weather layers with independent gains. `scripts/encode-audio.mjs`
      derives `public/audio/` from the untouched originals in `tracks/` at AAC-LC 64 kbps: 21.1MB
      → 6.7MB, and nothing is fetched at all until sound is switched on

**Final gate (answer honestly, fix before calling it done)**

Three of these are questions of taste and belong to the project owner, not to whoever last
touched the code. They are left open deliberately rather than self-certified.

- [ ] Would a recruiter remember this after leaving it? — *owner's call*
- [ ] Does the motion feel premium and calm, never restless? — *owner's call*
- [ ] Does it read as a journey rather than a template? — *owner's call*
- [x] Does it still work with every effect off? **Yes, measured.** Under
      `prefers-reduced-motion: reduce` the root carries `data-motion="off"`, `getAnimations()`
      reports **zero** running animations anywhere in the document, all seven section headings
      render, and no revealed element is stuck at opacity 0
- [x] Is `/classic` polished enough to stand alone? **Yes.** Lighthouse 100/100/100/100 desktop,
      axe clean in both families, 34 keyboard stops all with a visible focus ring, and it renders
      the same section components as `/` rather than a fork that can drift
- [x] Does it load fast enough to feel serious? **On desktop, yes** — 99 and 100, LCP under a
      second. **On a throttled phone, `/` is 67 with 860ms of blocking time**, and that is the one
      number in this document that is not where it should be. It is hydration of the backdrop's
      client components, not payload; see the open lever above