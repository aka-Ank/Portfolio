import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GroveOverlay, JungleOverlay } from "./LabOverlay";
import { labContent } from "./content";
import { useWorldStore } from "@/world/state/useWorldStore";

const sde = labContent.tracks.find((t) => t.id === "sde")!;
const aiml = labContent.tracks.find((t) => t.id === "aiml")!;

describe("track overlays", () => {
  it("renders each biome's own track heading and blurb as real text", () => {
    const { unmount } = render(<JungleOverlay />);
    expect(screen.getByRole("heading", { name: aiml.label })).toBeInTheDocument();
    expect(screen.getByText(aiml.blurb)).toBeInTheDocument();
    unmount();

    render(<GroveOverlay />);
    expect(screen.getByRole("heading", { name: sde.label })).toBeInTheDocument();
    expect(screen.getByText(sde.blurb)).toBeInTheDocument();
  });

  it("shows only its own track's projects — the split is the point", () => {
    render(<GroveOverlay />);
    for (const p of sde.projects) {
      expect(screen.getByRole("button", { name: new RegExp(p.title) })).toBeInTheDocument();
    }
    for (const p of aiml.projects) {
      expect(screen.queryByRole("button", { name: new RegExp(p.title) })).toBeNull();
    }
  });

  it("lists every project as a real, keyboard-activatable button — the 3D consoles are pointer-only, with no keyboard path to openDeepDive at all", async () => {
    const user = userEvent.setup();
    render(<JungleOverlay />);

    for (const project of aiml.projects) {
      expect(screen.getByRole("button", { name: new RegExp(project.title) })).toBeInTheDocument();
    }

    await user.tab();
    const firstButton = screen.getByRole("button", {
      name: new RegExp(aiml.projects[0].title),
    });
    expect(firstButton).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(useWorldStore.getState().deepDiveId).toBe(aiml.projects[0].slug);
  });
});
