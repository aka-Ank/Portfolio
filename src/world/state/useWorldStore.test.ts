import { beforeEach, describe, expect, it } from "vitest";
import { useWorldStore } from "./useWorldStore";

const initialState = useWorldStore.getState();

beforeEach(() => {
  useWorldStore.setState(initialState, true);
});

describe("navigation slice", () => {
  it("goToChapter sets the chapter, enters transitioning, and resets chapterProgress", () => {
    useWorldStore.getState().goToChapter("lab");
    const state = useWorldStore.getState();
    expect(state.currentChapter).toBe("lab");
    expect(state.phase).toBe("transitioning");
    expect(state.chapterProgress).toBe(0);
  });

  it("goToChapter retargets time-of-day to the chapter's default anchor", () => {
    useWorldStore.getState().goToChapter("observatory");
    expect(useWorldStore.getState().targetAnchor).toBe("night");

    useWorldStore.getState().goToChapter("river");
    expect(useWorldStore.getState().targetAnchor).toBe("day");
  });

  it("openDeepDive/closeDeepDive round-trip through the deep-dive phase", () => {
    useWorldStore.getState().openDeepDive("project-x");
    expect(useWorldStore.getState().deepDiveId).toBe("project-x");
    expect(useWorldStore.getState().phase).toBe("deep-dive");

    useWorldStore.getState().closeDeepDive();
    expect(useWorldStore.getState().deepDiveId).toBeNull();
    expect(useWorldStore.getState().phase).toBe("active");
  });
});

describe("progress slice", () => {
  it("markChapterViewed is additive across chapters", () => {
    useWorldStore.getState().markChapterViewed("entrance");
    useWorldStore.getState().markChapterViewed("clearing");
    expect(useWorldStore.getState().viewedChapters).toEqual({
      entrance: true,
      clearing: true,
    });
  });

  it("discoverLore does not duplicate the same id", () => {
    useWorldStore.getState().discoverLore("hidden-stone");
    useWorldStore.getState().discoverLore("hidden-stone");
    expect(useWorldStore.getState().loreFound).toEqual(["hidden-stone"]);
  });

  it("resetProgress clears all progress fields", () => {
    useWorldStore.getState().markChapterViewed("entrance");
    useWorldStore.getState().discoverLore("hidden-stone");
    useWorldStore.getState().triggerEasterEgg();

    useWorldStore.getState().resetProgress();

    const state = useWorldStore.getState();
    expect(state.viewedChapters).toEqual({});
    expect(state.loreFound).toEqual([]);
    expect(state.easterEggFound).toBe(false);
  });
});

describe("device slice — reduced motion precedence", () => {
  it("follows the system preference when no manual override is set", () => {
    useWorldStore.getState().setSystemReducedMotion(true);
    expect(useWorldStore.getState().reducedMotion).toBe(true);

    useWorldStore.getState().setSystemReducedMotion(false);
    expect(useWorldStore.getState().reducedMotion).toBe(false);
  });

  it("a manual override wins over the system preference", () => {
    useWorldStore.getState().setSystemReducedMotion(false);
    useWorldStore.getState().setManualReducedMotion(true);
    expect(useWorldStore.getState().reducedMotion).toBe(true);

    // system flips, manual override still wins
    useWorldStore.getState().setSystemReducedMotion(false);
    expect(useWorldStore.getState().reducedMotion).toBe(true);
  });

  it("clearing the manual override falls back to the last known system value", () => {
    useWorldStore.getState().setSystemReducedMotion(true);
    useWorldStore.getState().setManualReducedMotion(false);
    expect(useWorldStore.getState().reducedMotion).toBe(false);

    useWorldStore.getState().setManualReducedMotion(null);
    expect(useWorldStore.getState().reducedMotion).toBe(true);
  });
});
