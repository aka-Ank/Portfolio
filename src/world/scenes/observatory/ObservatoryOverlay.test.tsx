import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ObservatoryOverlay } from "./ObservatoryOverlay";
import { observatoryContent } from "./content";

describe("ObservatoryOverlay", () => {
  it("renders the chapter heading and every blog post title", () => {
    render(<ObservatoryOverlay />);
    expect(screen.getByRole("heading", { name: observatoryContent.heading })).toBeInTheDocument();
    for (const post of observatoryContent.blogPosts) {
      expect(screen.getByText(new RegExp(post.title))).toBeInTheDocument();
    }
  });
});
