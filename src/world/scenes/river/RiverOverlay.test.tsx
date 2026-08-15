import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RiverOverlay } from "./RiverOverlay";
import { riverContent } from "./content";

describe("RiverOverlay", () => {
  it("renders the chapter heading and intro as real text", () => {
    render(<RiverOverlay />);
    expect(screen.getByRole("heading", { name: riverContent.heading })).toBeInTheDocument();
    expect(screen.getByText(riverContent.intro)).toBeInTheDocument();
  });
});
