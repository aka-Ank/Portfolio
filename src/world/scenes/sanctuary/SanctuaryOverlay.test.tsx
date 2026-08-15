import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SanctuaryOverlay } from "./SanctuaryOverlay";
import { sanctuaryContent } from "./content";

describe("SanctuaryOverlay", () => {
  it("renders the chapter heading and intro as real text", () => {
    render(<SanctuaryOverlay />);
    expect(screen.getByRole("heading", { name: sanctuaryContent.heading })).toBeInTheDocument();
    expect(screen.getByText(sanctuaryContent.intro)).toBeInTheDocument();
  });
});
