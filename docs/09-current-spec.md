# 09 — Current specification

The live spec. `docs/00`–`08` describe the previous illustrated-mood build and are historical
only. Where this file and `CLAUDE.md` disagree, `CLAUDE.md` wins.

## Intent

A calm, premium, professional portfolio for a Software & AI/ML engineer. It is read by recruiters
and engineers, usually in a hurry, often on a phone. Every decision below follows from that: the
content is the product, and the design's job is to be legible and stay out of the way.

Explicitly **not**: a game, a storybook, a 3D demo, or a scroll-driven experience.

## Structure

Eight sections, one order, shared by both routes. `src/content/sections.ts` is the registry.

| id | Nav label | Content |
|---|---|---|
| `hero` | Home | Profile card — name, role, tagline, location, email, GitHub, LinkedIn, resume, status pill |
| `about` | About | Two-line summary plus a one-line fact row, on a panel |
| `experience` | Experience | Multitech Support & Development, ML Intern, May–Jul 2026 |
| `sde` | SDE Projects | Hamro Vanshavali · Smart Hostel Management |
| `aiml` | AI/ML Projects | AML Detection · Flood STGCN · Smart Traffic PySpark · House Price |
| `skills` | Skills | Six grouped lists, no ratings |
| `education` | Education | PDEU B.Tech CE + coursework + NPTEL certification |
| `contact` | Contact | Email CTA, GitHub, LinkedIn, resume |

A **motto** closes the page after Contact — a personal principle, centred, in the display face,
quieter than any section heading. It is deliberately not in the hero and not in the Person schema:
`tagline` is the concrete line that says what he builds and doubles as the schema's `description`,
and replacing that with a principle would leave both the hero and the structured data saying how he
feels about the work rather than what it is. `CLAUDE.md` records that poetic *headings* were
removed once already; this is careful not to become one.

There is no timeline, no blog, no "signals"/"achievements" section, and no live-stats widget.

## Content rules

The source of truth is the PDF in `resume/`.

**The Resume button serves that exact file**, copied to
`public/Ankit-Chaudhary-Resume.pdf` and linked statically — not a PDF generated from these
content modules. A generated resume is a second layout of the same facts that has to be kept
looking right forever, and it is not the document that gets attached to an application, so a
recruiter downloading from the site would receive something the applicant had never seen.
To update: replace the file in `resume/`, copy it to `public/`, done. Removing the generator also
made every route static — there is no longer a dynamic route in the build.

- No invented metrics, dates, achievements, or proficiency ratings.
- An empty `metrics` array is the correct representation of a project with no published numbers.
- The certification list stays at its true length (currently one).
- The two SDE projects are not in the AI/ML resume PDF; their detail comes from the repositories.
  If an SDE resume is added to `resume/`, reconcile against it.

## Backdrop — the living forest

`src/backdrop/`. Composed back to front: sky wash, sun or moon, cloud band, four silhouette depth
planes (`far`/`mid`/`near`/`fore`) of one continuous landscape, light shafts, one particle canvas,
haze, grain.

**One continuous world.** `src/backdrop/world.tsx` — each depth plane is a single wide strip
(1,613 / 1,843 / 2,188 / 2,590 units), generated along its length from the shape vocabulary in
`shapes.tsx`. Scroll slides them horizontally at `DEPTH_DRIFT` × 1,150px, so the foreground
travels a hair under 0.3px per pixel of scroll — an ordinary calm parallax rate. A different part
of the wood comes into frame because the viewer *moved*.

Strip length is derived, not chosen: a plane needs exactly the viewport plus its own drift
distance, and `Layer` sizes its DOM box to the same number, so one SVG user unit maps to one pixel
and `preserveAspectRatio="none"` distorts nothing at desktop width. On narrower screens the strip
is compressed horizontally against its vertical scale, which sharpens the silhouettes; a `slice`
fix for that was built and then reverted on request.

Sections feel like different *areas* through the terrain profile below — continuous functions of
position along the strip. Because they are functions rather than a set of states, there is nothing
to transition between.

This replaced eight per-section biomes that cross-faded. They read as switching: a dissolve is
still a cut with a ramp on it. The replacement removed ~1,400 lines and the entire crossfade
machinery — `BiomeStack`, the opacity maths, the per-biome `--play` gating, seventeen of the
eighteen custom properties the scroll hook used to write.

**Environmental storytelling.** `terrain.ts` holds six continuous functions of world position —
elevation, canopy, openness, understory, water, engineered — sampled by every generator. They
describe one journey: open valley → forest trail → old forest → engineered wood → stream → lake →
rolling hills → viewpoint. "The trees thin, more light reaches the ground, the grass thickens, a
stream appears and widens into a lake" is literally `canopy` falling while `openness`, `understory`
and `water` rise. There are no seams because there are no boundaries.

**Creature motion.** One animated node per animal, and the gesture is the most characteristic thing
that species does: birds flap in bursts and then glide, a deer flicks an ear, a squirrel's tail
never settles, an owl turns its head once every twenty-nine seconds, a rabbit twitches, a duck rides
its own wake, a fox sweeps its tail. Giving a deer breathing *and* an ear flick would double the
node count for a second reading of the same idea.

`GESTURE` in `Wildlife.tsx` is the single source of truth for which gesture and which period belong
to which species — bird 4s, squirrel 2.3s, rabbit 3.1s, duck 7s, fox 11s, deer 13s, owl 29s. It
used to be split between a class name in JSX and a duration in CSS, which is how two species
quietly end up sharing a period.

The periods are deliberately unlike each other *and* deliberately not round: 2.3s and 3.1s never
land on the same frame twice, where 2s and 3s would meet every six seconds. Tests assert no two
species share a period, no adjacent pair is a clean integer multiple, and no two share a gesture.

**Phase offsets alone are not enough**, and this is the part that is easy to get wrong. Two deer on
an identical 13s period stay in *permanent* lockstep: the gap between their ear flicks never
changes, which over a minute reads as two halves of one clock rather than two animals. Each
individual therefore varies its **period** by ±9% as well as its phase, both seeded from its own
appearance. Within a flock, the three birds are spaced by a third of that individual's own
wingbeat, so the offsets scale with it rather than assuming a nominal 4s.

`dragonfly` and `fish` have no idle loop: a dragonfly darts and a fish is a spreading ring, so both
are already entirely motion.

Only the birds react to weather: their vertical bob scales with `--sway`, so a bird in wind drifts
further than one on a still day.

**The ecosystem.** `ecosystem.ts`. Every wildlife event is a pure function of the world clock: a
seeded schedule decides whether something is out, and `progress = elapsed / duration` says where it
has got to. Scrolling away and back puts the deer exactly where it would be — not because anything
simulated it, but because its position was never stored anywhere to lose. Off-screen costs nothing;
nothing resets on scroll or reload. Habitats are **predicates over the terrain** (ducks where
`water > 0.7`, squirrels where `canopy > 0.65`, foxes at the forest edge where understory and
canopy overlap), so moving the lake moves the ducks. Nine species; the fox is the rarest at one
possible appearance per 320s and is crepuscular. Capped at
**three concurrent** animals, ties broken by start time so the cap never evicts something mid-walk.
Behaviour arcs begin and end outside the frame, so nothing appears or vanishes in view; the deer
spends most of its visit standing still, which is what makes it read as alive.

**The sky layer.** `Sky.tsx` — a twinkling star field and two rare meteors.

> **Both of this layer's keyframes were missing for several passes.** `.star-twinkle` and `.meteor`
> named `star-twinkle` and `meteor-fall`; neither was defined in `globals.css`. A CSS animation
> naming a keyframe that does not exist is **silently inert** — no error, no warning — so the field
> never twinkled and the meteor, whose whole design is that it is hidden for most of its cycle,
> rendered as a static diagonal bar parked in the top-left of every clear night sky. Nothing in the
> build can catch this; if either name is renamed, rename it in both files at once.

Forty-eight stars are painted as stacks of radial gradients across **three elements**, so they cost
three nodes and three paints rather than forty-eight of each. The field is split into thirds and
each third breathes on its own coprime period (41s, 47s, 59s) from its own phase, so stars go soft
and bright out of step with one another — which is what irregular twinkling looks like — while no
individual star carries an animation. One group would pulse the whole sky at once; forty-eight
would be a screensaver.

Brightness follows a **magnitude distribution**: a squared random roll, so the sky is mostly stars
you can barely see and a handful you can. The first version used a uniform 0.6–1.55px radius with a
single gradient stop, which averaged out to almost nothing across a sub-pixel disc — the field
measured 0.70 opacity and was still invisible. Each star now holds full colour to 40% of its radius
before falling away. Positions come from a fixed seed, so the field is identical on the server, in
the browser and between reloads.

Density is continuous in sun altitude — first stars around −8°, full field by −18° — so they emerge
through dusk and fade through dawn rather than switching at a boundary. Cloud and haze take them
away (`cloudy` measured at 0.14 opacity); rain and snow take them entirely, because a star field
over falling snow is exactly the impossible combination the scene is built to prevent.

**Two meteors**, on 89s and 127s, each drawn for about 2% of its cycle and hidden for the rest — so
the period is the upper bound on frequency, not the frequency. Two rather than one because a streak
that always falls from the same corner on the same diagonal stops reading as an event and starts
reading as a loop. Both are gated on `stars > 0.55`, `cloud < 0.35` and no precipitation, which in
practice means clear nights only: measured live, `night/misty`, `night/cloudy`, `night/rain` and
`night/snowy` all render **zero**.

**Fireflies** are on the particle canvas, not here — see below.

**Birds** are not part of this layer either — they are wildlife, scheduled by `ecosystem.ts` like
everything else alive, which is what already gives them rarity, rain-sheltering, `alt > -4` day
gating and deterministic staggering. Adding a second bird system for the sky would have been two
things to keep in agreement. Their flight path rises and dips through two sines on unrelated rates
(±22 and ±7 viewBox units, plus a slight net climb), and that is **geometry inside `poseAt`, not an
animation** — measured live at 25 units of vertical swing over 11 seconds. Wind reaction rides on
`bird-flap`'s existing `--sway` term, so both came free of the node budget.

**Fireflies.** A second pass inside `ParticleField`'s existing rAF loop, so the scene still has one
canvas and one loop, and they cost **zero** animated nodes.

Sixteen at most, and never more than three or four lit at any instant: cubing a half-wave sine
leaves a short bright peak and a long dark trough, so each one is off for most of its cycle. Each
has its own 2.6–6.4s period and phase, so no two ever pulse together, and each has a **threshold**
— the density at which it comes out — so they arrive a few at a time as the light goes rather than
the whole population fading up together at 10% brightness.

They are confined between `SCENE_HORIZON + 0.02` and 0.97 of the frame, which makes drifting up
over the hero card or a section heading structurally impossible rather than merely unlikely
(measured band at night: 0.79–0.85). Their light is **emitted, not reflected**, so like snow they
are a literal colour — `oklch(0.88 0.17 116)` — in both families and every palette.

Density comes from `deriveScene` and multiplies three independent facts about the insect: they fly
at dusk and tail off through the night, they need still air (`breeze` empties it), and mist is
their *best* night rather than their worst. Rain and snow are a hard zero.

**Mist.** Two layers doing two jobs, which is the distinction that matters.

*Aerial haze* is the flat gradient wash at the bottom of the frame. It reads as **distance**, not as
weather, and is deliberately weak.

*Ground mist* (`MistLayer`) is the fog. It pools where fog actually pools: `mistBanks` samples the
same horizon curve everything else uses and places banks by how low the ground is and whether there
is water under it — water wins, because a lake steams at dawn whether or not it is the lowest point
around. Banks sit *on* the ground and stand taller as they thicken. A single band across the frame,
which is all this used to be, reads as a wash over the picture rather than as something in the
landscape, because it ignores the landscape completely.

Soft edges come from a radial-gradient fill, **not** a blur filter: `feGaussianBlur` over thirty
banks is re-rasterised on the CPU every frame. Three ranks drift on coprime loops with different
amplitudes, so the near bank slides past the one behind it — that parallax is what gives fog depth,
where one layer moving as a piece reads as tracing paper.

Mist is the one weather layer that also answers to **time of day**: fog forms overnight and burns
off through the morning, so the first stretch of the light family carries a boost. Measured, a misty
dawn is 0.87 against a misty afternoon's 0.58 — without it they were the same picture.

**Wind.** One number. `windAt(t)` is three sines on 61/89/149-second periods, so gusts never
develop a rhythm. It is written to `--sway` four times a second — registered with `@property` so
the browser interpolates between writes — and modulates the *amplitude* of CSS loops that are
already running. Every shape multiplies it by its own `--stiff`: trunk 0.12, canopy 0.45, frond
0.85, grass 1.15, reed 1.5. Getting that ordering right is most of what sells wind.

**Water.** `Water.tsx`. A mirrored copy of the treeline, gradient-masked and sliced into six
horizontal bands that each drift on their own coprime loop. Banded horizontal displacement *is*
what a rippled reflection looks like, at a coarser resolution than physics. `feTurbulence` +
`feDisplacementMap` was rejected: animated SVG filters re-rasterise on the CPU and would cost the
60 FPS target. Weather's `chop` breaks the reflection up and fades it, which is what makes rain
read as wet rather than just dark. It is not a real-time reflection of the scene — it is the same
shapes, mirrored and tinted toward sky.

**Weather reaches everything at once**: `veil` (haze), `cloud`, `gust` (wind), `drops` (rain, and
the flag every sheltering animal reads), `chop` (water). Plus the soundscape. `ecosystem.test.ts`
sweeps a full day at every weather and asserts nothing is ever out in the rain, no diurnal animal
is out in the dark, and nothing stands anywhere its habitat does not suit.

**Technique.** Hybrid SVG + one canvas. SVG is retained-mode — every node stays in memory — which
is right for a handful of large shapes and wrong for sixty drifting motes; canvas is the reverse.
So the structure is SVG (server-rendered, themeable by CSS variable, crisp at any size) and only
the particles are canvas. Lottie was rejected outright: a baked animation cannot be recoloured by
`--layer-*`, so time-of-day would need five exports per layer.

**Bare text over the backdrop.** Section headings are `--ink` with no panel behind them, so the
atmosphere *is* their background. That was safe while only sky and distant planes were up there
and stopped being safe once the sun and moon crossed the same band — the night moon at lightness
0.62 put a heading at 3.24:1. Two rules now hold it: `--ink` is audited against every raw
atmosphere colour (which is what caps the moon at 0.53), and **running `--ink-muted` prose always
sits on a surface**, because muted text cannot clear 4.5:1 against a mid-tone disc at any
lightness the disc would still read as a moon. The only bare muted text left is the two project
section blurbs.

**Readability.** Two mechanisms, and they do different jobs:
- `SCENE_HORIZON` (0.66) keeps *detail* out of the upper two-thirds; `LANDFORM_HORIZON` (0.50)
  lets hills, the far shore and the reflection reach the upper half, because a landscape confined
  to the lower third is a letterbox. High birds are the one deliberate exception above both — the
  brief asks for them by name, they are three specks, and they appear about once every two minutes.
- `contrast-audit.test.ts` samples ink against `--surface` composited over **every plane colour**
  at eleven points around both rings — the actual *guarantee*. It has to be, because the page
  scrolls and cards genuinely travel over the foreground plane.

**Motion.** Every animation is `transform`/`opacity` only, so it runs on the compositor without
layout or paint. Durations are coprime (7/11/13/17/19/23/29/31/37/41/43/97/163s) so the combined
cycle never visibly repeats, and each element carries a negative `animation-delay` so nothing
starts in phase on load. Budget: ≤24 animated nodes (currently 14–19), ≤60 particles desktop / 25
mobile. The ceiling is **derived rather than asserted**: the base scene runs ~26 loops (clouds,
shafts, mist, canopy, understory, water bands, star field), and creatures add at most 5 — capped by
`MAX_CONCURRENT = 3`, where a bird *event* is three nodes because the three birds in it beat on
different offsets — plus 3 for the ground-mist ranks. That bounds the worst case at **34**, and
measured peak matches.

This number has moved twice (24 → 28 → 31 → 34) and it is worth being straight about why: each
move was a layer being added, not a limit being relaxed to fit. It is a *derivation* now rather
than a target, so the honest reading is "the scene runs about thirty compositor animations" — and
if that ever needs to come down, the mist ranks and the vegetation cap are where the slack is. Every one is a
`transform`/`opacity` animation on the compositor. The sun and moon add **zero** animated nodes — they move on the one-minute clock tick with
a CSS transition, because the real sun travels about 1.4px a minute across this arc and does not
need a rAF loop.

The strips are far longer than a single plate, so their generators place shapes at whatever
spacing looks right and then animate only the first few — six canopy masses and seven understory
plants. The rest are static, which costs nothing and reads as depth rather than as stillness,
because something in front of them is moving. Measured live: **19 running animations**.

**Scroll drift.** `Layer` translates each plane on both axes from the single `--parallax` variable
`useSceneScroll` publishes: vertical at `DEPTH_PARALLAX` × 90px, horizontal at `DEPTH_DRIFT`
(far 0.15 → fore 1.0) × **1,150px**. The horizontal component is no longer a garnish on a fixed
scene — it *is* how the visitor travels through the world. Each plane's box is overscanned on the
**right only**, by exactly its own drift distance: drift is one-directional, so padding the left
edge would carry artwork that never comes into frame.

**Weather** is four scalars (`veil`, `cloud`, `sway`, `drops`), never a separate scene — so it
crossfades and can never introduce a shape the clear scene lacked. `breeze` adds no overlay at
all; it only raises `--sway`, which is what wind actually is.

**Artwork** plugs into `Layer` as an alpha mask, tinted by the plane's palette token — one file
per plane rather than one per plane per time of day. See
[10-scene-assets.md](./10-scene-assets.md).

## Theme

**One quantity drives everything: the sun's altitude.** `systems/theme/sky.ts` is the source of
truth, and nothing else in the codebase branches on the clock.

- `ColorMode` = `light | dark | auto`. Light **is** the sun's arc; dark **is** the moon's. This is
  no longer independent of the time of day — choosing a side of the horizon chooses where the sun
  sits, and choosing a named time chooses a side of the horizon. `uiSlice` reconciles the pair in
  its setters, so the store can never hold a combination the renderer has to fix up. The old
  arrangement let the two disagree, which is what produced the half-day/half-night palette.
- `TimeMode` = `sync | dawn | morning | afternoon | dusk | night`, each defined as an **hour**
  (`TIME_ANCHOR_HOUR`) rather than a ring position. **Never derived from scroll.** The four daytime
  anchors resolve to a positive altitude and therefore to the light family; `night` resolves to
  −46°. Dawn and dusk sit at +9° and +6°, inside golden hour.
- Five stops per family, and they are now the two arcs rather than two moods: light walks
  dawn → morning → noon → afternoon → dusk, dark walks nightfall → early night → midnight →
  late night → first light. Every stop is somewhere the sun actually goes.
- `Weather` = `clear | breeze | misty | rain | cloudy | snowy`, labelled Clear / Windy / Misty /
  Rainy / Cloudy / Snowy. The ids are **not** renamed to match: they are persisted, so renaming
  would strand every returning visitor's setting for no gain.
- Six scalars in `WEATHER` reach everything at once: `veil` (haze), `cloud`, `gust` (wind),
  `drops` (rain — also the flag sheltering animals read), `flakes` (snow), `chop` (water). Rain and
  snow are separate scalars rather than one "precipitation" number because they behave nothing
  alike: rain falls fast, roughens water and empties the wood; snow drifts, settles the water flat,
  and is calm enough that the animals stay out. One number could not say both.
- **Snow is the calmest state in the set**, and every scalar says so — its `gust` is *below* clear
  (snowfall damps wind rather than adding it) and its `chop` is the lowest of all six, so the lake
  is at its most mirror-like. Its `veil` sits between clear and misty: cool and muted without fog's
  visibility loss. `ecosystem.test.ts` pins each of those relationships.
- The control lives in **Settings**, with the other world controls. It was briefly in the sound
  popover while weather was audio-only; now that it changes the scene too, one home is right.
- The sun and moon are positioned from the same model. `--celestial` is the disc's own token,
  separate from `--glow`, and is sampled by the contrast audit because the arc's apex is at 14vh —
  a panel genuinely scrolls in front of the moon. At night the disc separates from the sky by
  lightness; in daylight it cannot (the sky is already at 0.95), so it separates by **chroma**
  instead. A near-white disc on a near-white sky was the first attempt and was invisible.
- The moon's rising time is idealised to sunset→sunrise, and its thinnest phase is clamped to a
  crescent. Both are deliberate: a real moon is absent or invisible on roughly half of all nights,
  and the moon is meant to be the night's light source. Its **illumination is genuinely computed**
  from the synodic month, so the shape is right for the night someone visits.
- **Persisted preferences are untrusted.** They may come from an older build, so the store is
  versioned with a `migrate`, and `resolveTheme`/`atmosphereAt` degrade instead of throwing. A
  stale `timeMode: "golden"` used to index `stops[NaN]`, throw inside ThemeDriver before it wrote
  a single surface token, and leave the entire site unstyled.
- Atmosphere tokens are damped continuously in OKLCH; surface tokens are swapped atomically
  inside a view transition. See `CLAUDE.md` for why the second must never be interpolated.

## Layout

**One content column, 1024px (`CONTENT_GRID` in `sections/SectionShell.tsx`), used by every
section and by the hero.** This is the single most load-bearing layout rule in the project. An
earlier version let each section choose — 768px hero, 672px prose, 1024px grids, each centred
independently — which put section headings on three different left edges and moved the heading
176px sideways twice per scroll-through.

- Running prose is capped at `PROSE_MEASURE` (672px) **inside** the grid, never by narrowing the
  grid, so the readable measure never costs the shared left edge.
- Cards are inset from that edge by their own padding. The card *border* is what aligns.
- Vertical rhythm: `py-10 sm:py-12` on every section — **96px** between content blocks at desktop.
  This has been cut twice against a measurement rather than a feeling: 224px (24% of the page),
  then 128px (27.5%, because the page had also got shorter), now 96px (23.6%). Below about 80px
  the headings stop reading as section breaks and the page becomes one long column.
- The hero has `min-h-[70svh]`, not 80: at 80 it carried 292px of dead space around 428px of
  content. A minimum is kept at all because the About heading appearing just below the fold is
  what tells a visitor there is more.
- Columns inside a card are **top-aligned and full-height**, never vertically centred. Centred,
  Contact's two blocks floated at unrelated heights and the divider rule between them spanned
  neither.

## Motion

- One reveal, once, on entry: opacity + a 14px lift. Never re-triggered, never a slide from
  off-screen, never a bounce.
- Project cards are native `<details>` **without** a shared `name`, so they open and close
  independently and any number may be open at once. Collapsed shows title, year, summary **and
  stack**; expanded adds problem, contribution, metrics and links. Zero JavaScript in the card.
  They were an exclusive accordion for several passes; that was reversed on request, and the only
  change was dropping `name`.
- `DisclosureToggle` is one button per track that opens or closes every card in it, reflecting
  the current state rather than offering two controls of which one always does nothing. It listens
  for `toggle` in the **capture** phase, because `toggle` does not bubble — a plain listener on
  the container never fires. The easing is the pure-CSS `::details-content` transition,
  which must be gated for reduced motion **by name** — the blanket `*, *::before, *::after` rule
  does not match that pseudo-element.
- The side navigator does not exist above half a viewport of scroll, and uses `visibility`
  rather than `opacity` alone when hidden, so its eight buttons never sit in the tab order
  invisibly.
- **The active section is decided by pixels of the trigger band covered, not by
  `intersectionRatio`.** The ratio is a fraction *of the target*, so it is not comparable between
  targets of different heights: the band is ~450px, a 389px section fits inside it and reaches
  1.0, a 651px section cannot exceed 0.69 however completely it fills the screen. Ranking by ratio
  handed the highlight to whichever section was shortest, which is why the navigator read "SDE
  Projects" while AI/ML Projects filled the viewport. The observer also keeps the last known
  coverage for every section, because the callback only carries entries that *changed*. The page
  bottom is a deliberate exception: once scrolling has hit its limit the last section is forced
  active, since Education genuinely covers more of the band than Contact there.
- Content is visible by default; `useReveal` applies the hidden state in a layout effect and
  **only to elements off-screen at mount**, so the hero never animates and nothing depends on JS
  to be readable.
- Gated twice: `prefers-reduced-motion` and `[data-motion="off"]`.
- Scrolling is plain and native. No snap, no hijack, no tweened scroll library. JS may only
  observe scroll position; the sole exception is an explicit click or keypress on a nav control.

## Chrome

- **Side navigator** — appears on scroll/pointer/key, fades after 2.4s idle, pins open on hover
  or focus. Right rail on desktop, dot row above the footer on mobile.
- **Command footer** — light/dark toggle, `SoundControl`, Settings, mode switch, shortcuts.
- **`SoundControl`** — one round button carrying the state and one caret opening the level. The
  ring around it is a conic gradient showing volume, and the icon repeats that in a second channel
  (muted / low / high) so it is not colour-only. Clicking the button mutes directly, because
  making the commonest action the slowest is the wrong trade; the popover closes on Escape and on
  outside pointer input, returning focus to the button. It replaced a mute toggle beside a slider
  that was `hidden sm:block` and only rendered while sound was already on — so a phone had no
  level control at all outside Settings, and the strip changed width whenever sound was toggled.
- **Settings panel** — Appearance, Time of day, Atmosphere, Ambient sound, Volume, Motion. The
  volume row is the only way to set the level on mobile, where the footer slider is hidden.

## Audio

Opt-in, never autoplayed, and nothing is fetched until the visitor switches sound on.

- **Real recordings, in `public/audio/`.** One time-of-day bed plus any number of concurrent
  weather layers, each with its own gain — the previous bed-plus-*one*-overlay model could not
  express rain and wind at the same time. Beds: `dany_photo-forestbirds-2-367580.m4a` (dawn and
  dusk), `birds and cricket.m4a` (day), `night .m4a` (night). Layers: `rain.m4a`, `soft wind.m4a`,
  `wind_howl.m4a`, `snow.m4a`. One-shots: `owl hoot.m4a`, `wolf_howl.m4a`.
- **`public/audio/` is a build artifact, not the archive.** `scripts/encode-audio.mjs`
  (`npm run audio:encode`) derives it from the 256kbps masters in `tracks/` at AAC-LC 64kbps —
  21.1MB → 6.7MB — and `tracks/` is gitignored. Basenames are preserved exactly, so the mapping in
  `audioManager` still reads as the source names. A test fails if an `.mp3` ever appears in
  `public/audio`, which is what a hand-copied file would look like.
- **`night .m4a` has a space before the extension.** That is the real name of the original and it
  is carried through rather than tidied away; paths are `encodeURIComponent`-ed, so it resolves as
  `night%20.m4a`. A test asserts no source string contains a raw space and that every one exists
  in `public/`.
- **Wind is derived from `gust`, not from a "windy" state**, so rain (gust 1.35) keeps a wind bed
  under it at 45% rather than being silenced by the rain. `wind_howl` layers *on top of* `soft
  wind` as the live wind passes 2.0 — the same number the trees are swaying to — rather than
  replacing it.
- **Mist and cloud get no layer of their own.** Neither has a recording and neither should: fog is
  defined by what you stop hearing, so both express themselves by ducking the bed.
- Ducking is per-layer, not one number: rain 0.68, snow 0.74 (snowfall absorbs sound), wind 0.32.
  One-shots duck by 0.35 and release on `end` — and on `loaderror`, so a missing file cannot leave
  the bed permanently quiet.
- **Every fade starts from the layer's current gain**, so changing weather twice in two seconds
  picks up where the first crossfade got to instead of queueing. Crossfade 2.8s.
- The owl hoot fires from the **same ecosystem event as the owl silhouette**, tracked by seed, so
  the sound and the bird are one animal. The wolf howl is a separate deterministic schedule at
  1,500s with a 30% roll, deep night only — roughly one an hour of night, rarer than anything
  visible.
- **`distant thunder with rain` is deliberately unused.** There is only one rain state, so
  there is no heavier variant for it to belong to; using it for ordinary rain would put thunder
  under a light shower. It becomes correct the moment a `storm` weather exists.
- 6.7MB total, fetched **only** on demand — verified zero audio requests before the visitor turns
  sound on, and a clear day pulls one bed and nothing else.
- **Bed plus layers**, not one file per combination. The time-of-day bed plays underneath and each
  weather layer rides over it with its own gain, ducking the bed by its own amount. One bed per
  time × weather would be twenty files. `soundscape.ts` is the audio twin of `deriveScene` — pure,
  reading the same sky and the same weather scalars — so what a visitor hears cannot contradict
  what they see.
- `soundEnabled` and `volume` are separate state on purpose: muting must not overwrite the level,
  or unmuting silently resets whatever the visitor chose.
- `AmbienceBridge` is mounted in `AppProviders`, not per-route, because the footer's sound
  controls render in both modes.
- **A missing file must never take the bed down with it.** Every bed, layer and one-shot is its
  own Howl with its own `onloaderror`, which warns by name and path once and then goes silent.
  Sound is opt-in decoration; a portfolio that breaks because an ambience file 404'd would be a bad
  trade.
- Weather layers are constructed **on first use**, not with the beds. Eager construction fetched
  every weather the moment sound was switched on, which once produced two 404s for audio nobody
  was going to hear. Lazily, clear weather requests nothing and rain requests its files once.

## Classic mode

`/classic` renders the **same section components** as `/`, with `data-plain` on `<main>` to
switch off the reveal. No backdrop, no observers, no floating navigator. It is a real alternate
mode, not a fallback — and sharing the components is what makes content parity structural rather
than a promise.

The sticky anchor header is rendered by `app/classic/layout.tsx`. **Not by `page.tsx`** — doing
both is how the route once shipped two stacked navigation bars, which the WCAG tagset did not
flag because duplicate landmarks live in axe's `best-practice` set.

## The social card

`src/lib/og-card.tsx`, prerendered to PNG at build time and shared by `app/opengraph-image.tsx`
and `app/twitter-image.tsx` so there is one card rather than two that drift.

- **The skyline is the site's own terrain**, sampled from `groundY()` — the same function the live
  backdrop draws from — with conifers along the mid/near/fore crests in each plane's own colour, so
  they merge into the silhouette exactly as they do on the page. Nothing about the card is a
  drawing *of* the site, which is what stops it going stale when `terrain.ts` changes.
- **Dusk, `atmosphereAt("light", 1)`.** Not a mood choice: the dark family's layer colours run
  #050914 → #000204 against a #0a0f1c sky, so a night card would be four blacks on black.
- **Colours are sRGB literals**, because satori parses a small CSS subset and does not understand
  `oklch()`. `og-card.test.ts` converts the real tokens with culori and asserts all thirteen match
  — the same drift guard the CSS defaults already carry.
- Fonts are three OFL `.woff` files in `assets/fonts/`. Satori cannot read `woff2`, which is what
  `next/font` leaves on disk, so the card needs its own copies. Build-time only, never served.

## Verification

| Command | Checks |
|---|---|
| `npm run lint` | ESLint |
| `npm test` | Vitest, including `contrast-audit.test.ts` (token pairs + CSS/palette sync), `soundscape.test.ts` (every audio source exists on disk) and `og-card.test.ts` (card colours match the palette) |
| `npm run test:a11y` | axe WCAG 2.1 AA on both routes × both families, **plus landmark uniqueness** (needs a server on :3000) |
| `npm run build` | Types + production build |
| `npm run audio:encode` | Re-derives `public/audio/` from `tracks/`. Only needed when a recording changes |
