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

The source of truth is `resume/Ankit_Chaudhary_AI_ML_Resume.pdf`.

- No invented metrics, dates, achievements, or proficiency ratings.
- An empty `metrics` array is the correct representation of a project with no published numbers.
- The certification list stays at its true length (currently one).
- The two SDE projects are not in the AI/ML resume PDF; their detail comes from the repositories.
  If an SDE resume is added to `resume/`, reconcile against it.

## Backdrop

`src/backdrop/Backdrop.tsx`. Four painted layers, no illustration, no canvas, no scroll listener:

1. Base linear gradient, `--sky-top` → `--sky-mid` → `--sky-horizon`.
2. Warm glow, anchored off the top-left corner, `--glow`, heavily blurred.
3. Cool glow, anchored off the bottom-right, `--aether`, heavily blurred.
4. A veil (`--veil-strength`, the Atmosphere setting) and a grain tile.

The veil only ever *mutes* what is behind it, so the strongest setting is the calmest picture.
The dark family's `glow` lightness stays around 0.4 — a bright bloom on a dark page is the
blinding-light failure mode this design rules out.

## Theme

- `ColorMode` = `light | dark | auto`. `auto` follows the clock (sunrise 06:00, sunset 18:30).
- `TimeMode` = `sync | dawn | day | golden | night`. **Never derived from scroll position.**
- `Ambience` = `clear | soft | muted` → `--veil-strength`.
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
