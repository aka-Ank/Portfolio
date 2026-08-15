import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SkillTree } from "./SkillTree";
import { skills } from "@/content/skills";

describe("SkillTree", () => {
  it("renders every skill's name and description in the accessible list", () => {
    render(<SkillTree />);
    for (const skill of skills) {
      expect(screen.getByText(skill.name)).toBeInTheDocument();
      expect(screen.getByText(skill.description)).toBeInTheDocument();
    }
  });

  it("marks the decorative diagram as presentational, not content", () => {
    const { container } = render(<SkillTree />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("role", "presentation");
  });
});
