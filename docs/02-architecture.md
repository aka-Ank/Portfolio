# File/Folder Architecture

Principle: the immersive 3D experience, the classic lightweight experience, and the content they
both read from are three separable concerns. Neither experience should ever hold content the
other doesn't also have access to — see Phase 4's "keep content consistent across both modes."

```
Portfolio/
├── CLAUDE.md                     conventions — read by every session
├── SESSION.md                    gitignored — running build log
├── ENGINEER_NOTES.md             gitignored — technical scratchpad
├── docs/                         this phase's planning deliverables
│
├── public/
│   ├── models/                   optimized .glb (Draco-compressed)
│   ├── textures/                 KTX2/Basis-compressed
│   ├── audio/                    ambience loops + SFX (see 05-asset-list.md)
│   └── fonts/                    fallback self-hosted woff2 (next/font handles the primary path)
│
└── src/
    ├── app/                                     Next.js App Router — routing only, no logic
    │   ├── layout.tsx                           root layout: fonts, providers, <a11y skip link>
    │   ├── globals.css                          Tailwind v4 @theme tokens (from 01-design-spec)
    │   ├── page.tsx                              "/" — mounts the immersive experience
    │   ├── classic/
    │   │   ├── layout.tsx
    │   │   └── page.tsx                          "/classic" — semantic HTML/CSS experience
    │   ├── blog/
    │   │   ├── page.tsx                          index, reads content/blog
    │   │   └── [slug]/page.tsx
    │   ├── api/
    │   │   ├── chat/route.ts                     grounded chatbot endpoint (Phase 4)
    │   │   ├── github-stats/route.ts             cached proxy to GitHub API
    │   │   ├── leetcode-stats/route.ts            cached proxy
    │   │   ├── contact/route.ts
    │   │   └── resume/route.ts                    serves generated PDF
    │   ├── sitemap.ts
    │   ├── robots.ts
    │   └── opengraph-image.tsx                    dynamic OG image
    │
    ├── content/                                  SHARED content layer — both modes read only from here
    │   ├── about.ts                               who-I-am / themes (Clearing)
    │   ├── skills.ts                               skill → symbolic creature mapping (Sanctuary)
    │   ├── projects/                               one file per project (Lab)
    │   │   └── <project-slug>.ts
    │   ├── certifications.ts                       Observatory wall
    │   ├── blog/                                   MDX posts
    │   │   └── <post-slug>.mdx
    │   ├── resume.ts                                structured resume data → PDF export
    │   └── schema.ts                                shared TS types/zod schemas for all of the above
    │
    ├── world/                                     the immersive 3D engine — framework-agnostic-ish, no Next.js imports
    │   ├── engine/
    │   │   ├── WorldCanvas.tsx                      <Canvas> root, frameloop config, renderer setup
    │   │   ├── CameraRig.tsx                        reads scroll progress → camera transform
    │   │   └── PerformanceGovernor.tsx               device-tier detection + adaptive quality
    │   ├── state/                                    Zustand store, slices pattern (see 04-state-machines.md)
    │   │   ├── useWorldStore.ts                      combined store
    │   │   ├── timeSlice.ts                          time-of-day state machine
    │   │   ├── navigationSlice.ts                    scene/nav state machine
    │   │   ├── progressSlice.ts                      interaction/progress (viewed/unlocked, lore found)
    │   │   └── deviceSlice.ts                         capability/performance tier
    │   ├── systems/
    │   │   ├── scroll-camera/                        Lenis + GSAP ScrollTrigger orchestration
    │   │   ├── time-of-day/                           Sky shader + light/fog interpolation (§5 of 00-research)
    │   │   ├── transitions/                           reusable GSAP Timeline library for chapter transitions
    │   │   └── audio/                                 Howler wrapper, keyed off world-state
    │   ├── scenes/                                    one folder per story location, same internal shape
    │   │   ├── entrance/
    │   │   ├── clearing/
    │   │   ├── river/
    │   │   ├── sanctuary/
    │   │   ├── lab/
    │   │   ├── observatory/
    │   │   └── campfire/
    │   │       ├── index.tsx                          scene root, composes layers below
    │   │       ├── Foreground.tsx
    │   │       ├── Midground.tsx
    │   │       ├── Background.tsx
    │   │       └── content.ts                          scene-specific narrative copy (imports from src/content)
    │   └── shared/                                     reusable 3D primitives
    │       ├── InstancedFoliage.tsx
    │       ├── CreatureRig.tsx                         base rig all Sanctuary creatures extend
    │       ├── Particles.tsx
    │       └── materials/
    │
    ├── components/
    │   ├── ui/                                        shadcn-generated primitives (button, dialog, ...)
    │   ├── chrome/                                     shared overlay UI (progress dots, mute toggle,
    │   │                                                mode switch, keyboard-shortcut help, preloader)
    │   └── classic/                                    classic-mode-only presentational components
    │
    ├── hooks/
    │   ├── useReducedMotion.ts
    │   ├── useDeviceTier.ts
    │   └── useScrollProgress.ts
    │
    ├── lib/
    │   ├── cn.ts                                        shadcn's class-merge helper
    │   ├── seo.ts                                        metadata helpers, JSON-LD builders
    │   └── content-loaders.ts                            typed accessors over src/content
    │
    └── types/
        └── world.ts                                      shared TS types for world-state
```

**Why `world/` is not inside `app/`:** the immersive engine has its own internal composition
rules (engine → state → systems → scenes → shared) that have nothing to do with Next.js routing.
Keeping it as a sibling of `app/` means `app/page.tsx` stays a thin mount point
(`<WorldCanvas><EntranceScene/>...</WorldCanvas>`), the 3D engine is testable without spinning up
Next.js routing, and a future non-Next.js host (unlikely, but it's the right invariant to hold)
wouldn't require restructuring.

**Why `content/` is separate from both `world/` and `components/`:** this is the layer that
makes Phase 4's "classic mode reads the same copy and structure as immersive" achievable by
construction rather than by discipline — there is only one place project descriptions, skills,
and certifications live, and both experiences import from it.

**Why scenes share one internal shape (`Foreground`/`Midground`/`Background`/`content.ts`):**
enforces the composition rule from [01-design-specification.md](./01-design-specification.md) §4
structurally — a scene physically cannot skip a depth layer without an empty file being obvious
in review.
