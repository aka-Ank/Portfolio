# Animation Bible

Every motion type below states the **feel** first (how it should read to the visitor) and the
**technique** second (which tool, which parameters) — feel is the requirement, technique is the
implementation detail. Every technique here uses physical motion (spring/damping/inertia) per
the brief's non-negotiable rule; nothing below uses a raw linear or default-`ease` tween.

## Camera

**Feel:** a patient, physically-grounded observer moving through the world — never a drone shot,
never a snap-to-target. The visitor should feel *guided*, not *dragged*.

**Technique:** camera position/target are never set directly. Target values come from the
scroll-camera system (Lenis progress → GSAP ScrollTrigger → per-chapter camera keyframes); the
rendered camera transform is the *damped* pursuit of that target, computed every frame with
`maath`'s `easing.damp3` (position) and `easing.dampE`/quaternion slerp-damp (rotation), each
with its own time-constant tuned per chapter (slower/heavier in Entrance and Clearing, slightly
quicker and more responsive by Lab/Observatory — mirroring the narrative's calm→complex
progression). Fast scroll flicks never produce camera velocity spikes; the damping function
inherently caps how fast the camera can catch up.

## Scroll

**Feel:** buttery, weighted, like scrolling through something with real inertia — not the raw
browser scrollbar, not a scroll-jacked "the page ignores your input" feeling.

**Technique:** Lenis owns the virtual scroll (custom easing, wheel/touch normalization). GSAP
ScrollTrigger reads Lenis's position as its source of truth (via `lenis.on('scroll', ScrollTrigger.update)`
+ `gsap.ticker`) and drives both DOM reveals and the world-store's scroll-progress value. Scroll
is **never fully hijacked** — the visitor's own scroll delta always maps to *some* forward
progress; only the last-mile easing is smoothed, not the input itself.

## Hover / focus (micro-interactions)

**Feel:** a small, confident, springy response — an object that feels physically present and
slightly reactive, not a color-swap or a linear scale-up.

**Technique:** Motion (`motion/react`) spring transitions (`type: "spring"`, tuned
`stiffness`/`damping`/`mass` per element size — smaller UI elements get snappier/higher-stiffness
springs, larger surfaces get softer/lower-stiffness ones so nothing overshoots visibly).
Keyboard `:focus-visible` uses the same spring on the fixed `--focus-ring` token (see
[01-design-specification.md](./01-design-specification.md) §3.2) — focus feedback must never be
weaker than hover feedback.

## Scene transition (between chapters)

**Feel:** a held breath, then a clean cut into the next chapter's mood — crossfade, light sweep,
or fog movement, chosen per chapter-pair to match the narrative beat (e.g. Entrance→Clearing is
a literal "pass through" camera move; Lab→Observatory is a rising light sweep as the canopy opens
to sky).

**Technique:** a single reusable GSAP Timeline orchestration module (per
[00-research-and-stack.md](./00-research-and-stack.md) §6 — this is the layer that replaces
Theatre.js). Each chapter-pair registers a timeline with named phases (`exit`, `hold`, `enter`)
so the module stays declarative and inspectable rather than copy-pasted per scene. Triggered by
the navigation state machine entering `Transitioning` (see
[04-state-machines.md](./04-state-machines.md) §2).

## Object motion (idle/ambient — foliage sway, creature breathing, river current, embers)

**Feel:** alive but unhurried — the kind of motion you'd only consciously notice if you stared
at it, present enough to read as "not a still image."

**Technique:** per-object sine/noise-driven offsets computed inside `useFrame` (no per-frame
React state), amplitude and frequency kept small and tuned per the motion-budget rule
([01-design-specification.md](./01-design-specification.md) §4: 2–3 concurrent ambient elements
per view). Where an idle loop needs a directional "settle" (a creature finishing a glance, a
branch recovering from wind), `maath`'s `easing.damp` handles the return-to-rest so it never
looks robotically looped.

## Theme transition (time-of-day shift, including the Phase 4 manual dark/light control)

**Feel:** the sky and light genuinely *change*, gradually, over on the order of tens of
seconds to a couple of minutes for the automatic story-driven shift, or a few seconds for a
manual override — never an instant palette swap, never feels like a CSS class toggling.

**Technique:** see [04-state-machines.md](./04-state-machines.md) §1 — a single damped scalar
(`timeOfDay`) drives every color/light/fog token in
[01-design-specification.md](./01-design-specification.md) §3.1 simultaneously via
`THREE.Color.lerpColors` + `maath` damping. Sky, shadow behavior, fog density, and ambient audio
mix (Howler crossfade between time-of-day ambience layers) all key off the same scalar so nothing
shifts out of sync with anything else.

## UI motion (classic mode, chrome overlays, deep-dive panels)

**Feel:** restrained, premium, editorial — motion confirms an action happened, it doesn't
perform for its own sake. No bounce-for-bounce's-sake, no staggered pop-in grids.

**Technique:** Motion spring transitions for enter/exit (short distance, moderate stiffness,
critically-damped or slightly under-damped only — never a bouncy overshoot on content panels,
reserved at most for tiny UI accents like a toggle). Panel enter/exit uses opacity + a small
(≤12px) position delta, never a scale-from-zero "pop." Lists/grids (project list, cert wall)
reveal via a very short, subtle stagger (40–60ms) driven by Motion's stagger children — kept
short enough that it reads as "settling into place," not "items flying in one by one."

## Reduced motion

Every technique above has a defined reduced-motion behavior, not a blanket "disable everything":
camera transitions become instant cuts with a brief cross-fade (no spring interpolation), ambient
object motion drops to near-zero amplitude (not necessarily exactly zero — see the Campfire
ember exception in [03-scene-graph.md](./03-scene-graph.md)), scene transitions become simple
opacity crossfades (no camera move, no light sweep), theme transitions still occur but instantly
per anchor rather than damped, and UI motion collapses to opacity-only. Full checklist in
[07-accessibility-and-testing.md](./07-accessibility-and-testing.md).
