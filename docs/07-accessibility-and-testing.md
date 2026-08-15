# Accessibility Checklist & Testing Plan

## Accessibility checklist

Grouped by concern; each item is a pass/fail gate for Phase 5, not a "nice to have."

### Motion
- [ ] `prefers-reduced-motion: reduce` is read once at the world-store level (device slice) and
      every system (camera, transitions, object motion, theme, UI) checks it — see the reduced
      motion table in [06-animation-bible.md](./06-animation-bible.md).
- [ ] A manual "reduce motion" control exists in the chrome regardless of OS setting (some
      visitors want it off without changing a system-wide preference).
- [ ] With reduced motion on, all narrative content is still fully reachable and comprehensible —
      verified by walking the entire journey with it enabled before every release.

### Keyboard
- [ ] Full keyboard navigation through both classic and immersive modes, including the immersive
      scene navigation itself (chapter-to-chapter, deep-dive open/close) — not just DOM chrome.
- [ ] Documented shortcut set (P, R, G, C, `/` per the Phase 4 brief) with a visible hint and a
      full, dismissible help overlay (triggered by `/` or `?`).
- [ ] Every interactive element has a visible `:focus-visible` state using the fixed
      `--focus-ring` token (never the time-of-day-varying accent) — see
      [01-design-specification.md](./01-design-specification.md) §3.2.
- [ ] No keyboard trap in the deep-dive/modal states; `Escape` always returns to the previous
      navigation state.

### Screen reader / semantics
- [ ] The immersive experience has a parallel semantic document structure (headings, landmarks,
      alt text for narrative beats) even though it's rendered in WebGL — a screen-reader user
      gets the same chapters, same content, in the same order, not a canvas black box.
- [ ] Classic mode (`/classic`) is semantic HTML/CSS by construction — verified independently,
      not assumed to "inherit" accessibility from the immersive mode.
- [ ] All meaningful imagery (project screenshots, diagrams) has descriptive alt text; purely
      decorative 3D/visual elements are hidden from the accessibility tree.
- [ ] Live regions used sparingly and correctly for anything that updates without navigation
      (e.g. a toast on lore discovery) — `aria-live="polite"`, never `assertive` for non-urgent
      content.

### Color & contrast
- [ ] `--accent` (mapped from the Aether token at the current time-of-day) is contrast-checked
      against `--scrim` at all four anchor states and clamped/adjusted if any state fails AA.
- [ ] Body text meets 4.5:1, large text/headlines meet 3:1, at every time-of-day state — checked
      programmatically, not eyeballed once at "day."
- [ ] No information is conveyed by color alone (e.g. skill proficiency uses size/label, not just
      Aether glow intensity).

### Graceful degradation
- [ ] If WebGL is unavailable or fails to initialize, the visitor is routed to (or offered) the
      classic experience automatically — never a blank canvas or console-only error.
- [ ] Core content (who-I-am, projects, contact) is reachable and fully legible with all "fancy
      layers" (3D, particles, custom cursor) removed — verified by a literal build flag that
      strips them, not just a mental check.
- [ ] Tablet/mobile viewports get a genuinely adapted layout/interaction model, not a squeezed
      desktop layout — touch targets ≥44px, no hover-only affordances without a touch equivalent.

### Forms & inputs
- [ ] Contact form and any voice/chat inputs (Phase 4) have proper labels, error messaging tied
      to the field via `aria-describedby`, and work with autofill.

## Testing plan

| Layer | Tool | Scope | When it runs |
|---|---|---|---|
| **Unit** | Vitest | Pure logic: state machine transitions (`world/state/*`), content loaders, color/time interpolation math, SEO/JSON-LD builders | Every commit (local), CI on push |
| **Integration** | Vitest + React Testing Library | Component behavior: chrome interactions, deep-dive open/close, keyboard shortcut handling, classic-mode pages | Every commit (local), CI on push |
| **End-to-end** | Playwright | Full journey walkthroughs (scroll start-to-finish, bookmark jump, classic-mode parity, contact form submit, resume export) across Chromium/WebKit/Firefox | CI on push, full run before each phase's "done" gate |
| **Accessibility (automated)** | `axe-core` via Playwright | Every route (`/`, `/classic`, `/blog/*`, deep-dive states) scanned for violations | CI on push |
| **Accessibility (manual)** | — | Keyboard-only pass and screen reader pass (VoiceOver at minimum) through the entire journey | Before every phase's "done" gate, mandatory before launch |
| **Visual regression** | Playwright screenshot comparison | Each of the 7 chapters at each of the 4 time-of-day anchors, both modes | Before each phase's "done" gate |
| **Performance** | Lighthouse CI + manual Chrome DevTools Performance panel | Target: 60fps sustained during scroll/camera motion on a mid-tier device profile, Lighthouse 95+ on `/classic` and a realistic production build of `/` | CI on push (Lighthouse budgets), manual FPS profiling before each phase's "done" gate |
| **Cross-browser/device** | Manual + BrowserStack (or equivalent) if available | Safari (WebGL quirks), low-end Android, iPad | Before launch (Phase 5) |

**Reduced-motion and WebGL-failure paths are first-class test scenarios**, not edge cases bolted
on at the end — both get their own Playwright project configuration (forced
`prefers-reduced-motion: reduce`, and a WebGL-context-mocked-to-fail run) that runs the same
journey suite against those conditions.
