import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { WebGLFallback } from "./WebGLFallback";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("WebGLFallback", () => {
  beforeEach(() => {
    push.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("offers an immediate manual link to classic mode", () => {
    render(<WebGLFallback />);
    expect(screen.getByRole("link", { name: /continue to classic mode/i })).toHaveAttribute(
      "href",
      "/classic",
    );
  });

  it("auto-redirects to classic mode after a few seconds for visitors who don't interact", () => {
    render(<WebGLFallback />);
    expect(push).not.toHaveBeenCalled();
    vi.advanceTimersByTime(4000);
    expect(push).toHaveBeenCalledWith("/classic");
  });
});
