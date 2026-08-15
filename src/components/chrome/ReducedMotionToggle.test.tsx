import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReducedMotionToggle } from "./ReducedMotionToggle";
import { useWorldStore } from "@/world/state/useWorldStore";

describe("ReducedMotionToggle", () => {
  afterEach(() => {
    useWorldStore.getState().setManualReducedMotion(null);
  });

  it("toggles the store's reducedMotion flag and reflects it via aria-pressed", async () => {
    const user = userEvent.setup();
    render(<ReducedMotionToggle />);

    const button = screen.getByRole("button", { name: "Reduce motion" });
    expect(button).toHaveAttribute("aria-pressed", "false");

    await user.click(button);
    expect(useWorldStore.getState().reducedMotion).toBe(true);
    expect(
      screen.getByRole("button", { name: /motion reduced/i }),
    ).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: /motion reduced/i }));
    expect(useWorldStore.getState().reducedMotion).toBe(false);
  });
});
