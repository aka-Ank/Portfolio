import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useWebGLSupport } from "./useWebGLSupport";

describe("useWebGLSupport", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reports unsupported when the browser has no webgl/webgl2 context (jsdom's real default)", () => {
    const { result } = renderHook(() => useWebGLSupport());
    expect(result.current).toBe(false);
  });

  it("reports supported when getContext returns a context", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      () => ({}) as RenderingContext,
    );
    const { result } = renderHook(() => useWebGLSupport());
    expect(result.current).toBe(true);
  });

  it("reports unsupported rather than throwing if getContext itself throws", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => {
      throw new Error("WebGL blocked");
    });
    const { result } = renderHook(() => useWebGLSupport());
    expect(result.current).toBe(false);
  });
});
