# Research Summary & Stack Decision

Phase 1 output. This document records what was researched, why the stack differs from the
original brief in three places, and the final confirmed dependency list Phase 2 builds on.

## 1. Scroll + camera orchestration

**Finding:** The dominant 2025–2026 production pattern (confirmed against recent Codrops case
studies, e.g. the "Trionn" build breakdown) is Lenis for the smooth-scroll *feel* + GSAP
ScrollTrigger for *orchestration*, with a single normalized scroll-progress value written to a
**ref** and read inside R3F's `useFrame` — never pushed through React state or re-renders.
Native CSS `scroll-timeline` is real but currently a DOM/CSS-reveal tool, not a WebGL camera
driver. Framer Motion's `useScroll` is a DOM-parallax tool, not built for 3D camera paths.

**Decision:** Lenis drives the scrollable feel; GSAP ScrollTrigger reads Lenis's scroll position
and drives both DOM reveals and the R3F camera rig via a shared progress ref in the world-state
store. See [02-architecture.md](./02-architecture.md) `world/systems/scroll-camera`.

## 2. React Three Fiber performance at 60fps

**Finding:** Current stable versions are React Three Fiber v9 (9.7.0, React 19-compatible) and
Three.js r184. Confirmed current best practices: `frameloop="demand"` with manual `invalidate()`
calls during active camera transit (falling back to idle between scroll ticks), `InstancedMesh`
for repeated geometry (foliage, sanctuary creatures), drei's `<Detailed>` for LOD, KTX2/Basis
texture compression and Draco geometry compression, drei's `<PerformanceMonitor>` +
`<AdaptiveDpr>`/`<AdaptiveEvents>` for runtime quality scaling, and mutating via refs inside
`useFrame` rather than React state to avoid reconciler overhead. WebGPU is stable in Three.js
core since r171, but R3F/drei support is still catching up — **WebGLRenderer stays the target for
this build**, revisited post-launch.

**Decision:** All of the above adopted as the performance baseline. See
[06-animation-bible.md](./06-animation-bible.md) and the Phase 2 "performance governor" spec in
[08-roadmap.md](./08-roadmap.md).

## 3. Physics-based motion / spring easing

**Finding:** Framer Motion was spun off and rebranded **Motion** in 2025 — the npm package is
now `motion` (`import ... from "motion/react"`); the legacy `framer-motion` package still works
but no longer receives new features. GSAP has no built-in spring *solver*, but its (now free)
InertiaPlugin computes natural momentum/deceleration from velocity, which is the right tool for
scroll-release/drag-throw feel. react-spring (`@react-spring/three`) is a genuine continuous
spring simulator built for R3F scene graphs, at the cost of a fourth animation dependency.

**Decision — deliberately lean, not maximal:**
- **Motion** (`motion/react`) — DOM/UI micro-interactions (buttons, cards, classic mode, cursor).
  Native spring types (`stiffness`/`damping`/`mass`), tree-shakes to ~4.6KB with `LazyMotion`.
- **GSAP** (already required for scroll orchestration) — scene-transition timelines and, via
  InertiaPlugin, momentum/fling feel.
- **`maath`** (small `pmndrs` math/easing utility, already a transitive dependency in the R3F
  ecosystem) — frame-rate-independent exponential damping (`easing.damp`/`damp3`) for continuous
  3D object and camera motion inside `useFrame`.
- **react-spring was deliberately not added.** Three tools already cover every motion surface
  (DOM springs, timeline choreography + inertia, continuous 3D damping); a fourth motion library
  would be redundant weight against the brief's own "don't add abstractions beyond what's
  needed" instinct.

## 4. GSAP licensing

**Confirmed current.** Webflow acquired GreenSock in late 2024; as of the GSAP 3.13 release
(~April–May 2025) the entire toolset — including every former Club GreenSock plugin
(SplitText, MorphSVG, DrawSVG, ScrollSmoother, InertiaPlugin) — became 100% free for commercial
use. Current version installed: **3.15.0**, single public `gsap` package, no auth token or
private registry. `gsap.registerPlugin(...)` is still required in code to activate imported
plugins — that's a code step, not a licensing step.

## 5. Time-of-day lighting systems

**Finding:** Two established techniques exist. A **procedural sky shader** (three.js's
`Sky.js`, exposed via drei's `<Sky>`) is driven by a continuous `sunPosition` + atmospheric
uniforms, so it is naturally smooth across any scalar "time" value — well suited to a
scroll-driven journey. **HDRI blending** (drei's `<Environment>` with captured dawn/noon/
sunset/night maps, e.g. from Poly Haven) gives higher-fidelity reflections but the maps are
discrete photographed moments — cross-fading two unrelated HDRIs tends to ghost/muddy mid-blend
because sun-disc position and cloud shapes don't interpolate correctly.

**Decision — hybrid, procedural-primary:** A single scalar `timeOfDay` (0–1, tied to
scroll/journey progress) drives the procedural sky continuously, plus directional-light color
(`THREE.Color.lerpColors`) and intensity, ambient/hemisphere light, and fog color/density
(exponential falloff, not linear) — all smoothed per-frame with `maath`'s `easing.damp` so even
a scroll-jump (bookmark navigation) eases in rather than snapping. One supporting HDRI (or a
cubemap baked from the sky itself via `<Environment>`'s render-target mode) supplies ambient
specular/reflections only — never cross-faded. This is the literal mechanism behind the brief's
"smooth, gradual transitions — not toggle-switch jumps" rule.

## 6. Stack health check — and the one real swap

| Library | Status found | Verdict |
|---|---|---|
| **Theatre.js** | Public releases stopped ~Aug 2023. The README's "development temporarily moved to a private repo for 1.0" notice has been up, unfulfilled, since ~Sept 2022 (four years as of writing). Repo/Discord still exist but nothing has shipped. | **Dropped.** Betting critical-path scene-transition sequencing on a stalled tool is a real risk to a single-engineer, single-pass build. |
| **Lenis** | Renamed org: `studio-freight` → `darkroomengineering`; npm package renamed `@studio-freight/lenis` → `lenis`. v1.3.26, commits within weeks. | **Kept**, package name updated. |
| **Zustand** | ~3.2M weekly downloads, still the default lightweight React state manager in 2026 comparisons; its `getState`/`subscribe` transient-update pattern is also the standard way to drive `useFrame` mutations without React re-renders. | **Kept.** |
| **Howler.js** | 2.2.4, no release since Sept 2023 (~3 years). Web Audio surface it wraps is stable and the API surface needed here (layered loops, one-shot SFX, global mute/volume) is small. | **Kept, flagged.** Pragmatic choice, not an actively maintained one — see `ENGINEER_NOTES.md` for the fallback plan (drop to native `Audio`/`AudioContext` calls if a real bug surfaces). |
| **shadcn/ui** | CLI actively evolving (v4, "base-nova" preset used at init), still a copy-paste-into-repo model with no runtime version to track. | **Kept.** |
| **GSAP** | See §4. | **Kept**, now the busier of the two orchestration tools since it also absorbs Theatre.js's job. |

### What changed vs. the original brief

1. **Theatre.js removed.** Scene-transition sequencing (crossfades, light sweeps, fog moves,
   cinematic camera moves between chapters) is instead built as a reusable GSAP Timeline
   orchestration layer, driven by the navigation/scene state machine in Zustand. This is *less*
   surface area, not more — one orchestration tool (GSAP) instead of two, and it removes a
   single point of failure from an already ambitious single-pass build.
2. **Framer Motion → Motion.** Same authorship, same API family, new package name (`motion`,
   imported from `motion/react`). No behavior change, just current naming.
3. **`@studio-freight/lenis` → `lenis`.** Same library, current package name.
4. **`maath` added.** Small (~a few KB) utility already living in the R3F ecosystem; adopted
   explicitly instead of adding a fourth animation library (react-spring) for continuous 3D
   damping. See §3.

## 7. Final confirmed dependencies (installed)

| Category | Package | Version | Role |
|---|---|---|---|
| Framework | `next` | 16.3.1 | App Router, TypeScript, `src/` layout |
| | `react` / `react-dom` | 19.2.8 | — |
| Styling | `tailwindcss` / `@tailwindcss/postcss` | ^4 | CSS-first config (`@theme`, no `tailwind.config.js`) |
| | `shadcn` (CLI) | ^4.18 | Copy-in component source, `base-nova` preset, `@base-ui/react` primitives |
| 3D | `three` | ^0.185 (r185) | Renderer core |
| | `@react-three/fiber` | ^9.7 | React reconciler for three.js |
| | `@react-three/drei` | ^10.7 | Sky, Environment, Detailed, PerformanceMonitor, AdaptiveDpr/Events, Bvh, useKTX2 |
| | `maath` | ^0.10 | Frame-rate-independent damping/easing |
| Motion/orchestration | `gsap` | ^3.15 | ScrollTrigger, Timeline, InertiaPlugin — all free |
| | `lenis` | ^1.3 | Smooth virtual scroll |
| | `motion` | ^13.1 | DOM/UI spring micro-interactions |
| State | `zustand` | ^5.0 | World-time, scene/nav, interaction/progress, device-tier |
| Audio | `howler` | ^2.2 | Layered ambience + SFX (see health note above) |
| Icons | `lucide-react` | latest | Icon set (installed by shadcn init) |

Sources consulted are logged in `ENGINEER_NOTES.md` under "Research sources" for anyone who
wants to re-verify before Phase 2.
