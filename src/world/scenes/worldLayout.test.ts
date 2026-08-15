import { describe, expect, it } from "vitest";
import { chapterRange, WORLD_LENGTH } from "./worldLayout";
import { CHAPTER_ORDER } from "@/types/world";

describe("chapterRange", () => {
  it("gives every chapter an equal, non-overlapping depth range", () => {
    const ranges = CHAPTER_ORDER.map(chapterRange);
    for (let i = 0; i < ranges.length - 1; i++) {
      expect(ranges[i].end).toBe(ranges[i + 1].start);
    }
  });

  it("starts at the origin and spans the full world length", () => {
    const first = chapterRange(CHAPTER_ORDER[0]);
    const last = chapterRange(CHAPTER_ORDER[CHAPTER_ORDER.length - 1]);
    expect(first.start === 0).toBe(true); // avoid Object.is(-0, 0) === false from toBe
    expect(first.start - last.end).toBe(WORLD_LENGTH);
  });
});
