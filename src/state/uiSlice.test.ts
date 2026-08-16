import { describe, expect, it } from "vitest";
import { createUiSlice, DEFAULT_VOLUME, type UiSlice } from "./uiSlice";

/** Builds the slice in isolation, with a minimal `set` that merges like
 * zustand's does. The slice has no dependency on the store, so testing it
 * through `create()` would only be testing zustand. */
function makeSlice() {
  let state = {} as UiSlice;
  const set = (partial: Partial<UiSlice>) => {
    state = { ...state, ...partial };
  };
  state = createUiSlice(set as never, (() => state) as never, null as never);
  return {
    get: () => state,
    call: <K extends keyof UiSlice>(key: K) => state[key] as UiSlice[K],
  };
}

describe("uiSlice volume", () => {
  it("starts at the default level with sound off", () => {
    const slice = makeSlice();
    expect(slice.get().volume).toBe(DEFAULT_VOLUME);
    expect(slice.get().soundEnabled).toBe(false);
  });

  it("clamps out-of-range values instead of passing them to the audio layer", () => {
    const slice = makeSlice();

    slice.get().setVolume(2);
    expect(slice.get().volume).toBe(1);

    slice.get().setVolume(-3);
    expect(slice.get().volume).toBe(0);
  });

  it("keeps the chosen level independent of the mute state", () => {
    // Muting must not overwrite the level, or unmuting would silently reset
    // whatever the visitor had set.
    const slice = makeSlice();
    slice.get().setVolume(0.25);
    slice.get().setSoundEnabled(true);
    slice.get().setSoundEnabled(false);
    expect(slice.get().volume).toBe(0.25);
  });
});

describe("uiSlice time mode", () => {
  it("defaults to following the clock, never to a scroll-derived value", () => {
    expect(makeSlice().get().timeMode).toBe("sync");
  });
});
