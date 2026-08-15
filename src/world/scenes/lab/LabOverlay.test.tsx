import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LabOverlay } from "./LabOverlay";
import { labContent } from "./content";
import { useWorldStore } from "@/world/state/useWorldStore";

describe("LabOverlay", () => {
  it("renders the chapter heading and intro as real text", () => {
    render(<LabOverlay />);
    expect(screen.getByRole("heading", { name: labContent.heading })).toBeInTheDocument();
    expect(screen.getByText(labContent.intro)).toBeInTheDocument();
  });

  it("lists every project as a real, keyboard-activatable button — the 3D consoles are pointer-only, with no keyboard path to openDeepDive at all", async () => {
    const user = userEvent.setup();
    render(<LabOverlay />);

    for (const project of labContent.projects) {
      expect(screen.getByRole("button", { name: new RegExp(project.title) })).toBeInTheDocument();
    }

    await user.tab();
    const firstButton = screen.getByRole("button", {
      name: new RegExp(labContent.projects[0].title),
    });
    expect(firstButton).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(useWorldStore.getState().deepDiveId).toBe(labContent.projects[0].slug);
  });
});
