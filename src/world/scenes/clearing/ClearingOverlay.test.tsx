import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClearingOverlay } from "./ClearingOverlay";
import { clearingContent } from "./content";

describe("ClearingOverlay", () => {
  it("renders the about heading and every bio paragraph", () => {
    render(<ClearingOverlay />);
    expect(screen.getByRole("heading", { name: clearingContent.heading })).toBeInTheDocument();
    for (const paragraph of clearingContent.bio) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
  });

  it("renders every theme as a list item", () => {
    render(<ClearingOverlay />);
    for (const theme of clearingContent.themes) {
      expect(screen.getByText(new RegExp(theme))).toBeInTheDocument();
    }
  });
});
