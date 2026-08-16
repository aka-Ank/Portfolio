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
| `about` | About | Three-paragraph professional summary |
| `experience` | Experience | Multitech Support & Development, ML Intern, May–Jul 2026 |
| `sde` | SDE Projects | Hamro Vanshavali · Smart Hostel Management |
| `aiml` | AI/ML Projects | AML Detection · Flood STGCN · Smart Traffic PySpark · House Price |
| `skills` | Skills | Six grouped lists, no ratings |
| `education` | Education | PDEU B.Tech CE + coursework + NPTEL certification |
| `contact` | Contact | Email CTA, GitHub, LinkedIn, resume |

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

`src/backdrop/`. Composed back to front: sky wash, key light, cloud band, four silhouette depth
planes (`far`/`mid`/`near`/`fore`), light shafts, animals, one particle canvas, haze, grain.

**Technique.** Hybrid SVG + one canvas. SVG is retained-mode — every node stays in memory — which
is right for a handful of large shapes and wrong for sixty drifting motes; canvas is the reverse.
So the structure is SVG (server-rendered, themeable by CSS variable, crisp at any size) and only
the particles are canvas. Lottie was rejected outright: a baked animation cannot be recoloured by
`--layer-*`, so time-of-day would need five exports per layer.

**Readability.** Two mechanisms, and they do different jobs:
- `SCENE_HORIZON` (0.66) keeps detail out of the upper two-thirds — a *composition* rule.
- `contrast-audit.test.ts` samples ink against `--surface` composited over **every plane colour**
  at eleven points around both rings — the actual *guarantee*. It has to be, because the page
  scrolls and cards genuinely travel over the foreground plane.

**Motion.** Every animation is `transform`/`opacity` only, so it runs on the compositor without
layout or paint. Durations are coprime (7/11/13/17/19/23/29/31/97/163s) so the combined cycle
never visibly repeats, and each element carries a negative `animation-delay` so nothing starts in
phase on load. Budget: ≤24 animated nodes (currently 12–16), ≤60 particles desktop / 25 mobile.

**Weather** is four scalars (`veil`, `cloud`, `sway`, `drops`), never a separate scene — so it
crossfades and can never introduce a shape the clear scene lacked. `breeze` adds no overlay at
all; it only raises `--sway`, which is what wind actually is.

**Artwork** plugs into `Layer` as an alpha mask, tinted by the plane's palette token — one file
per plane rather than one per plane per time of day. See
[10-scene-assets.md](./10-scene-assets.md).

## Theme

- `ColorMode` = `light | dark | auto`. `auto` follows the clock (sunrise 06:00, sunset 18:30).
- `TimeMode` = `sync | dawn | morning | afternoon | dusk | night`. **Never derived from scroll.**
  Five stops per family, so each named time lands exactly on a stop rather than between two.
- `Weather` = `clear | cloudy | misty | rain | breeze`.
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
- Vertical rhythm: `py-12 sm:py-16` on every section — 128px between content blocks at desktop.
  It was 224px, which made 24% of the page empty gap.

## Motion

- One reveal, once, on entry: opacity + a 14px lift. Never re-triggered, never a slide from
  off-screen, never a bounce.
- Project cards are a native `<details name="…">` exclusive accordion — one open per track, zero
  JavaScript. Collapsed shows title, year, summary **and stack**; expanded adds problem,
  contribution, metrics and links. The easing is the pure-CSS `::details-content` transition,
  which must be gated for reduced motion **by name** — the blanket `*, *::before, *::after` rule
  does not match that pseudo-element.
- The side navigator does not exist above half a viewport of scroll, and uses `visibility`
  rather than `opacity` alone when hidden, so its eight buttons never sit in the tab order
  invisibly.
- Content is visible by default; `useReveal` applies the hidden state in a layout effect and
  **only to elements off-screen at mount**, so the hero never animates and nothing depends on JS
  to be readable.
- Gated twice: `prefers-reduced-motion` and `[data-motion="off"]`.
- Scrolling is plain and native. No snap, no hijack, no tweened scroll library. JS may only
  observe scroll position; the sole exception is an explicit click or keypress on a nav control.

## Chrome

- **Side navigator** — appears on scroll/pointer/key, fades after 2.4s idle, pins open on hover
  or focus. Right rail on desktop, dot row above the footer on mobile.
- **Command footer** — light/dark toggle, sound toggle, volume (desktop, only when sound is on),
  Settings, mode switch, shortcuts.
- **Settings panel** — Appearance, Time of day, Atmosphere, Ambient sound, Volume, Motion. The
  volume row is the only way to set the level on mobile, where the footer slider is hidden.

## Audio

Opt-in, never autoplayed, and nothing is fetched until the visitor switches sound on.

- `soundEnabled` and `volume` are separate state on purpose: muting must not overwrite the level,
  or unmuting silently resets whatever the visitor chose.
- `AmbienceBridge` is mounted in `AppProviders`, not per-route, because the footer's sound
  controls render in both modes.
- The four beds are **placeholder synthesized tones**, AAC at 64kbps (~42KB each). They were
  2.7MB of uncompressed WAV. Replacing them is a file swap — nothing in `audioManager.ts` knows
  what a bed sounds like.

## Classic mode

`/classic` renders the **same section components** as `/`, with `data-plain` on `<main>` to
switch off the reveal. No backdrop, no observers, no floating navigator. It is a real alternate
mode, not a fallback — and sharing the components is what makes content parity structural rather
than a promise.

The sticky anchor header is rendered by `app/classic/layout.tsx`. **Not by `page.tsx`** — doing
both is how the route once shipped two stacked navigation bars, which the WCAG tagset did not
flag because duplicate landmarks live in axe's `best-practice` set.

## Verification

| Command | Checks |
|---|---|
| `npm run lint` | ESLint |
| `npm test` | Vitest, including `contrast-audit.test.ts` (token pairs + CSS/palette sync) |
| `npm run test:a11y` | axe WCAG 2.1 AA on both routes × both families, **plus landmark uniqueness** (needs a server on :3000) |
| `npm run build` | Types + production build |
