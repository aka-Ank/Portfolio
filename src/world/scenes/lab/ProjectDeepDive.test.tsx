import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectDeepDive } from "./ProjectDeepDive";
import { projects } from "@/content/projects";
import { useWorldStore } from "@/world/state/useWorldStore";

const initialState = useWorldStore.getState();
beforeEach(() => {
  useWorldStore.setState(initialState, true);
});

describe("ProjectDeepDive", () => {
  const project = projects[0];

  it("renders the real project's title, stack, and metrics", () => {
    render(<ProjectDeepDive slug={project.slug} />);
    expect(screen.getByRole("heading", { name: project.title })).toBeInTheDocument();
    for (const tech of project.stack) {
      expect(screen.getByText(tech)).toBeInTheDocument();
    }
    for (const metric of project.metrics) {
      expect(screen.getByText(metric.value)).toBeInTheDocument();
    }
  });

  it("closes via the Close button, returning the store to active", async () => {
    useWorldStore.getState().openDeepDive(project.slug);
    render(<ProjectDeepDive slug={project.slug} />);
    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(useWorldStore.getState().phase).toBe("active");
    expect(useWorldStore.getState().deepDiveId).toBeNull();
  });

  it("renders nothing for an unknown slug instead of crashing", () => {
    const { container } = render(<ProjectDeepDive slug="does-not-exist" />);
    expect(container).toBeEmptyDOMElement();
  });
});
