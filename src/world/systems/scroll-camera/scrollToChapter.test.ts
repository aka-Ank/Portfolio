import { beforeEach, describe, expect, it } from "vitest";
import { scrollToChapter } from "./scrollToChapter";
import { useWorldStore } from "@/world/state/useWorldStore";
import { progressForChapter } from "@/world/state/navigationSlice";

// Rewritten for direct chapter switching. The old version asserted that the
// Lenis scroll target landed a hair *past* the exact chapter boundary — an
// epsilon that existed purely because currentChapter used to be derived from
// scroll position via floor(), so landing a float-hair short read as the
// previous chapter. That whole failure mode is gone: the chapter is now set
// directly and progress follows it, so there is no boundary to skirt.
describe("scrollToChapter", () => {
  beforeEach(() => {
    useWorldStore.setState({ currentChapter: "entrance", phase: "active" });
  });

  it("sets the requested chapter as authoritative", () => {
    scrollToChapter("sanctuary");
    expect(useWorldStore.getState().currentChapter).toBe("sanctuary");
  });

  it("targets the chapter's own progress segment, not a neighbour's", () => {
    scrollToChapter("sanctuary"); // index 3 of 7

    const target = useWorldStore.getState().targetJourneyProgress;
    expect(target).toBeGreaterThan(3 / 7);
    expect(target).toBeLessThan(4 / 7);
    expect(target).toBe(progressForChapter("sanctuary"));
  });

  it("enters the transitioning phase so the driver eases rather than cuts", () => {
    scrollToChapter("campfire");
    expect(useWorldStore.getState().phase).toBe("transitioning");
  });

  it("is a no-op when already on the requested chapter", () => {
    scrollToChapter("river");
    useWorldStore.setState({ phase: "active" });

    scrollToChapter("river");
    // Still "active" — a repeat request must not re-enter a transition and
    // replay the arrival beat (the navigator and voice nav can both fire a
    // jump to the chapter you're already on).
    expect(useWorldStore.getState().phase).toBe("active");
  });
});
