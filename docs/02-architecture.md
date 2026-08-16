> **SUPERSEDED — historical record only.**
> Written for the illustrated-mood build (six SVG moods, fantasy place names, scroll-driven
> time of day, scroll-snap). All of that was removed in the professional-portfolio overhaul.
> The current spec is [09-current-spec.md](./09-current-spec.md) plus `CLAUDE.md`. Do not
> implement from this file.

---

# Architecture

```
src/
  app/                    routing only
    page.tsx              immersive: eight sections over one fixed backdrop
    classic/              plainly-scrolling alternate entrance
    api/                  chat · github-stats · leetcode-stats · resume
    globals.css           both token systems, all ambient keyframes
  content/                the single content layer — the only source of copy
    sections.ts           the section registry + per-section copy
    projects/ skills.ts about.ts resume.ts certifications.ts blog.ts schema.ts
  scenes/
    atmosphere/           the fixed backdrop
      AtmosphereStage.tsx sky · key light · moods · haze · particles
      MoodSvg.tsx         shared frame, depth fills, parallax ratios
      ParticleField.tsx   the one ambient canvas pass
      moods/              six hand-authored SVG moods, three planes each
    sections/             the eight sections + SectionShell + ProjectCard
  systems/
    theme/                palette.ts (pure) + ThemeDriver.tsx (effects)
    scroll/               useSectionObserver (reads) + scrollToSection (writes)
    audio/                Howler wrapper + AmbienceBridge
    easter-egg/
  state/                  Zustand slices: ui · nav · device
  components/
    chrome/               SideNavigator · CommandFooter · ControlPanel · …
    classic/              classic-mode sections
    shared/               LiveStats (used by both modes)
    ui/                   shadcn primitives
  hooks/                  useReveal · useReducedMotion · useDeviceTier · useModalFocusTrap
  lib/                    person-schema · chatbot-context · resume-pdf · site · utils
```

## The boundaries that matter

**Content never lives in a component.** Both modes read `src/content/`. The previous build let
section copy live inside scene folders, which meant `/classic` imported from `world/scenes/*` and
the two modes could drift. `sections.ts` now holds both the registry and the copy.

**`palette.ts` is pure; `ThemeDriver.tsx` owns every effect.** All colour maths — the OKLCH lerp,
the family/ring resolution, the clock mapping — is side-effect-free and directly testable. The
driver is the only thing that touches `document`. `contrast-audit.test.ts` exercises the pure half
across every point on both rings, which is only possible because of this split.

**Scroll has a read side and a write side, and they are separate files.**
`useSectionObserver` may only read; `scrollToSection` is the only thing permitted to write, and
only in response to a deliberate visitor action. Keeping them apart makes the invariant reviewable
rather than a matter of discipline.

**State holds decisions, not frames.** No per-frame value goes into Zustand — the atmosphere's
damped `t` lives in a ref inside `ThemeDriver`, because putting it in the store would re-render
every subscriber sixty times a second. Persistence covers only deliberate choices (colour mode,
time mode, weather, sound, motion); navigation and device state always reflect the current visit.

**Chrome drives state, not rendering.** The navigator, footer and control panel read and write the
store; they know nothing about how the backdrop draws. This is why the reboot could delete the
entire rendering layer and keep most of the chrome.

## The two modes

| | `/` immersive | `/classic` |
|---|---|---|
| Backdrop | `AtmosphereStage` | none |
| Scroll | CSS snap + observer | plain document flow |
| Motion | ambient + reveals | none |
| Rendering | client (observers, rAF) | server-rendered |
| Content | `src/content/sections.ts` | *the same* |
| Theme tokens | shared | shared |

Classic is not a fallback. It is the same eight sections in the same order with the same copy and
the same SDE/AIML split, rendered without motion — and because both modes render against the same
CSS variables, a visitor's palette, time-of-day and weather choices survive the switch. What
classic drops is motion, not content.

## Root composition

`AppProviders` mounts once around every route: reduced-motion sync (which also mirrors the
effective value onto `<html data-motion>`), the device-tier seed, `ThemeDriver`, and the chat
widget. It is deliberately thin — anything immersive-only (`AtmosphereStage`, `AmbienceBridge`,
`KeyboardShortcuts`, `SideNavigator`, the easter egg) mounts in `app/page.tsx` so `/classic` never
pays for it.