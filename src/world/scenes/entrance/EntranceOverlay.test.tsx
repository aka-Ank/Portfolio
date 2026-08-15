import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EntranceOverlay } from "./EntranceOverlay";
import { entranceContent } from "./content";

describe("EntranceOverlay", () => {
  it("renders the real headline as an h1, not baked into a canvas", () => {
    render(<EntranceOverlay />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(entranceContent.heading);
  });

  it("renders the tagline and call-to-action as real text", () => {
    render(<EntranceOverlay />);
    expect(screen.getByText(entranceContent.subheading)).toBeInTheDocument();
    expect(screen.getByText(entranceContent.cta)).toBeInTheDocument();
  });
});
