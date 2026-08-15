import { projects, getProjectsByTrack } from "@/content/projects";

// Lab / Project Chamber — projects as artifacts. See docs/03-scene-graph.md §5.
//
// Split by track (SDE vs AI/ML) rather than presented as one undifferentiated
// list: the point a visitor should leave with is that both tracks are real
// work, not that one is a hobby. This split is also the seam the Ancient
// Grove / Mechanical Jungle biome restructure will cut along.
export const sdeProjects = getProjectsByTrack("sde");
export const aimlProjects = getProjectsByTrack("aiml");

export const labContent = {
  heading: "The Lab",
  intro:
    "Two benches, worked in parallel — systems on one side, models on the other. Step closer to open any of them.",
  tracks: [
    {
      id: "sde" as const,
      label: "Software Engineering",
      blurb: "Full-stack systems — access control, allocation logic, the parts that have to hold.",
      projects: sdeProjects,
    },
    {
      id: "aiml" as const,
      label: "AI / Machine Learning",
      blurb: "End-to-end pipelines — preprocessing, training, and evaluation that's actually measured.",
      projects: aimlProjects,
    },
  ],
  projects,
};
