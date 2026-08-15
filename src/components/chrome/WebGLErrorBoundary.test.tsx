import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { WebGLErrorBoundary } from "./WebGLErrorBoundary";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

function Bomb(): never {
  throw new Error("Canvas failed to initialize");
}

describe("WebGLErrorBoundary", () => {
  it("renders children normally when nothing throws", () => {
    render(
      <WebGLErrorBoundary>
        <div>3D scene here</div>
      </WebGLErrorBoundary>,
    );
    expect(screen.getByText("3D scene here")).toBeInTheDocument();
  });

  it("catches a render error from the wrapped tree and shows the classic-mode fallback instead", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <WebGLErrorBoundary>
        <Bomb />
      </WebGLErrorBoundary>,
    );
    expect(
      screen.getByRole("heading", { name: /can.t run the 3D experience/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /continue to classic mode/i })).toHaveAttribute(
      "href",
      "/classic",
    );
    consoleError.mockRestore();
  });
});
