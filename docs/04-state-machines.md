# State

One Zustand store, three slices, in `src/state/`. The guiding rule: **state holds decisions, not
frames.** Anything that changes at 60fps lives in a ref inside the system that owns it, because
putting it in the store would re-render every subscriber every frame.

## `uiSlice` — what the visitor chose

```ts
colorMode: "light" | "dark" | "auto"
timeMode:  "journey" | "sync" | "dawn" | "day" | "golden" | "night"
weather:   "clear" | "mist" | "rain"
soundEnabled: boolean
manualReducedMotion: boolean | null
controlPanelOpen: boolean
```

**`colorMode` and `timeMode` are orthogonal, and that is the whole design.** Colour mode picks the
palette family; time mode picks the position within it. `resolveTheme()` in `palette.ts` reduces
the pair (plus the active section) to `{ family, t }` — the only two values the renderer needs.

- `timeMode: "journey"` (default) takes `t` from the active section, so the walk from the meadow
  at dawn to the campfire at night *is* the time-of-day.
- `timeMode: "sync"` takes it from the visitor's local clock; `colorMode: "auto"` derives the
  family from the same clock. Both re-resolve on a one-minute interval — finer than the palette
  can visibly change.

`manualReducedMotion` is tri-state on purpose. `null` means "follow the OS"; `true`/`false` is an
explicit override. Collapsing it to a boolean would lose the ability to hand control back.
`selectReducedMotion()` resolves it: override first, OS second.

`soundEnabled` starts `false` always. Browsers block unprompted audio, and a portfolio that makes
noise before being asked is the opposite of calm.

## `navSlice` — where the visitor is

```ts
activeSection: SectionId
openProject: string | null
chromePanel: "help" | "controls" | null
navigatorVisible: boolean
```

`activeSection` is written by `useSectionObserver` (from scroll) and optimistically by
`scrollToSection` (from a click), so the navigator's active dot never lags a smooth scroll. The
observer confirms it a moment later; the two agree by construction because both name the same id.

`chromePanel` is a single value rather than a boolean per panel — two overlays can never be open
at once, and `Escape` has exactly one thing to clear.

## `deviceSlice` — what the device can take

```ts
tier: "low" | "mid" | "high"      // → PARTICLE_BUDGET: 0 / 26 / 60
systemReducedMotion: boolean
```

Tier drives the particle count and *nothing else*. No layout, content or interaction depends on
it, so a wrong guess costs a slightly emptier backdrop. It starts at `low` and is corrected once
on mount — starting optimistic would mean every visitor pays for the busiest setting on the most
performance-critical frame.

## Persistence

```ts
partialize: colorMode · timeMode · weather · soundEnabled · manualReducedMotion
```

Only deliberate choices survive a reload. Navigation and device state must always reflect the
current visit — a restored `activeSection` would fight the browser's own scroll restoration.

## Flow

```
visitor scrolls          → IntersectionObserver → activeSection
                                                      ↓
control panel / keyboard → colorMode·timeMode·weather ↓
                                                      ↓
                                            resolveTheme() → { family, t }
                                                      ↓
                          ┌───────────────────────────┼──────────────────────┐
                          ↓                           ↓                      ↓
                 ThemeDriver (rAF)          AtmosphereStage           AmbienceBridge
                 damps t → CSS vars          mood crossfade            selects one of
                 swaps family under          + parallax                four beds
                 a view transition
```

Every consumer derives from the same resolved pair, which is why the palette, the backdrop and the
audio bed can never disagree about what time it is.
