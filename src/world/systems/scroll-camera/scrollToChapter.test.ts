import { describe, expect, it, vi } from "vitest";
import { scrollToChapter } from "./scrollToChapter";
import { setLenisInstance } from "./lenisInstance";

describe("scrollToChapter", () => {
  it("targets a point past the exact chapter boundary, not on it", () => {
    const scrollTo = vi.fn();
    // @ts-expect-error - partial Lenis mock, only what scrollToChapter reads
    setLenisInstance({ limit: 7000, scrollTo });

    scrollToChapter("sanctuary"); // index 3 of 7
    const [target] = scrollTo.mock.calls[0];

    const exactBoundary = (3 / 7) * 7000;
    expect(target).toBeGreaterThan(exactBoundary);
    // still well within the sanctuary segment, not overshooting into lab
    expect(target).toBeLessThan((4 / 7) * 7000);

    setLenisInstance(null);
  });

  it("does nothing (no throw) when Lenis hasn't mounted yet", () => {
    setLenisInstance(null);
    expect(() => scrollToChapter("campfire")).not.toThrow();
  });
});
