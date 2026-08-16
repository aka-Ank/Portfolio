> **SUPERSEDED — historical record only.**
> Written for the illustrated-mood build (six SVG moods, fantasy place names, scroll-driven
> time of day, scroll-snap). All of that was removed in the professional-portfolio overhaul.
> The current spec is [09-current-spec.md](./09-current-spec.md) plus `CLAUDE.md`. Do not
> implement from this file.

---

# Accessibility Checklist & Testing Plan

Each item is a pass/fail gate for Phase 5, not a nice-to-have. `[x]` means verified, not intended.

## Accessibility checklist

### Motion
- [x] The effective reduced-motion value is resolved in one place (`selectReducedMotion`) and every
      consumer reads it — `ThemeDriver`, `AtmosphereStage`, `ParticleField`, `scrollToSection`.
- [x] A manual motion toggle exists independently of the OS setting, and it *actually switches off
      the CSS animations*: the media query cannot see an in-app toggle, so the effective value is
      mirrored onto `<html data-motion>` and `globals.css` gates on both.
- [x] `.reveal` renders at full opacity with no animation under reduced motion — content is never
      trapped behind an effect that will not run.
- [ ] The full journey walked with reduced motion forced, before release.

### Keyboard
- [x] Documented shortcuts (J/K, T, M, C, `/`, Esc) with a dismissible help overlay on `/` or the
      footer button.
- [x] Single-letter shortcuts are suppressed while focus is in an input, textarea, select or
      contenteditable, so the chat widget never fights them.
- [x] Modifier combinations are ignored, so browser shortcuts still work.
- [x] `useModalFocusTrap` on both overlays: focus moves in on mount, Tab cycles inside, focus
      returns to the trigger on close.
- [x] The side navigator pins open on focus as well as hover — an element that hides while holding
      focus is a trap in the making.
- [x] `:focus-visible` is defined globally against `--focus-ring`, which is a **surface** token,
      never the drifting Aether. Focus visibility must not depend on the time of day.
- [x] Verified in a browser: focusing a navigator dot pins it visible; the control panel moves
      focus in on open, traps Tab, closes on `Escape`, and returns focus to the trigger.
- [ ] Remaining: a full Tab sweep of `/classic` and a VoiceOver pass.

### Screen reader / semantics
- [x] The immersive route is ordinary semantic HTML — `<section aria-labelledby>` per section,
      one `<h1>`, `<h2>` per section, real `<dl>`/`<ul>` for structured content. There is no canvas
      black box to compensate for; this was a large part of the reason for leaving WebGL.
- [x] Every mood SVG and the particle canvas carry `aria-hidden="true"`; the SVGs also carry
      `role="presentation"`. Atmosphere is never in the accessibility tree.
- [x] The navigator is a real `<nav>` of `<button>`s with `aria-current`, and supplies an
      `sr-only` label on mobile where the visible label is hidden.
- [x] The control panel uses real radio groups and checkboxes inside `<fieldset>`/`<legend>`, not
      `aria-pressed` buttons — arrow-key navigation and correct announcement come for free.
- [x] `/classic` is semantic by construction and verified independently, not assumed to inherit.
- [ ] VoiceOver pass through both routes.

### Colour & contrast
- [x] Enforced by `src/lib/contrast-audit.test.ts`, which is the mechanism, not a checklist item:
      both surface families × both surface variants × every ink token, with the translucent
      surface composited over eleven points on each family's ring. 4.5:1 for text, 3:1 for the
      focus ring.
- [x] The same test asserts the inverted pairing used by the primary CTA (surface-on-accent).
- [x] The same test asserts `globals.css`'s first-paint defaults equal `palette.ts`, so the
      pre-hydration paint cannot disagree with the runtime.
- [x] Atmosphere tokens are structurally prevented from carrying text — that separation is the
      design, described in [01](./01-design-specification.md) §3.
- [x] No information is conveyed by colour alone: the navigator's active state changes dot *size*
      as well as colour; skills carry an evidence sentence rather than a coloured meter.

### Degradation
- [x] No WebGL, so no WebGL failure path to maintain.
- [x] Particles are absent entirely on low-tier devices and under reduced motion; nothing depends
      on them.
- [x] `::details-content` easing and `interpolate-size` degrade to an instant, correct open where
      unsupported. View transitions degrade to an instant, still-WCAG-passing theme swap.
- [x] Walked at 390×844. Two collisions found and fixed: the bottom navigator and the fixed
      command strip both wanted the bottom edge, and the strip wrapped to two lines once the
      copyright sat beside the controls.
- [ ] Remaining: tablet widths, and a ≥44px touch-target sweep.

## Testing plan

| Layer | Tool | Scope | When |
|---|---|---|---|
| Unit | Vitest | `palette.ts` maths, the contrast audit, `person-schema`, `sitemap`, `robots` | every commit |
| Integration | Vitest + RTL | chrome interactions, keyboard shortcuts, classic-mode sections | every commit |
| End-to-end | Playwright | both routes walked start to finish, mode switch, control panel, résumé export | before each phase gate |
| Accessibility (auto) | `axe-core` via Playwright | `/` and `/classic`, plus both overlay states | before each phase gate |
| Accessibility (manual) | — | keyboard-only and VoiceOver passes | mandatory before launch |
| Visual regression | Playwright screenshots | eight sections × two families | before each phase gate |
| Performance | Lighthouse | 95+ on both routes; `three`/`lenis` absent from the bundle | before launch |
| Cross-browser | manual | Safari (view transitions, `interpolate-size`), low-end Android | before launch |

**Reduced motion is a first-class test configuration**, not an edge case: the same journey suite
runs a second time under forced `prefers-reduced-motion: reduce`.