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

  it("lists every skill's name and description in the DOM — the creatures only reveal this on 3D pointer hover, so keyboard/touch/screen-reader visitors need it here", () => {
    render(<SanctuaryOverlay />);
    for (const skill of sanctuaryContent.skills) {
      expect(screen.getByText(skill.name)).toBeInTheDocument();
      expect(screen.getByText(skill.description)).toBeInTheDocument();
    }
  });
});
