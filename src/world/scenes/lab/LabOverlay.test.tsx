import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LabOverlay } from "./LabOverlay";
import { labContent } from "./content";

describe("LabOverlay", () => {
  it("renders the chapter heading and intro as real text", () => {
    render(<LabOverlay />);
    expect(screen.getByRole("heading", { name: labContent.heading })).toBeInTheDocument();
    expect(screen.getByText(labContent.intro)).toBeInTheDocument();
  });
});
