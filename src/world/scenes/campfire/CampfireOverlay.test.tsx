import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CampfireOverlay } from "./CampfireOverlay";
import { campfireContent } from "./content";

describe("CampfireOverlay", () => {
  it("renders the closing message and a mailto link with the real email", () => {
    render(<CampfireOverlay />);
    expect(screen.getByRole("heading", { name: campfireContent.heading })).toBeInTheDocument();
    const emailLink = screen.getByRole("link", { name: campfireContent.email });
    expect(emailLink).toHaveAttribute("href", `mailto:${campfireContent.email}`);
  });

  it("renders every contact link", () => {
    render(<CampfireOverlay />);
    for (const link of campfireContent.links) {
      expect(screen.getByRole("link", { name: link.label })).toBeInTheDocument();
    }
  });
});
