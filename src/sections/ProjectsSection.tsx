import { aimlContent, sdeContent } from "@/content/sections";
import { SectionShell } from "./SectionShell";
import { ProjectCard } from "./ProjectCard";

/**
 * `items-start` matters here: without it a grid row stretches every card to
 * the height of the tallest, so expanding one card would silently inflate the
 * blank space beside it. With it, the opened card grows and its neighbour
 * stays the size of its own content.
 *
 * The `group` name is per-track, so the two sections are two independent
 * accordions — opening an AI/ML project does not close an SDE one.
 */
const GRID = "grid items-start gap-5 lg:grid-cols-2";

/** The two tracks get the same card and the same layout. The split is stated
 * by the headings; making the cards look different as well would suggest one
 * track is the serious one. */
export function SdeSection() {
  return (
    <SectionShell id="sde" heading={sdeContent.heading} blurb={sdeContent.blurb}>
      <div className={GRID}>
        {sdeContent.projects.map((project) => (
          <ProjectCard key={project.slug} project={project} group="sde-projects" />
        ))}
      </div>
    </SectionShell>
  );
}

export function AimlSection() {
  return (
    <SectionShell id="aiml" heading={aimlContent.heading} blurb={aimlContent.blurb}>
      <div className={GRID}>
        {aimlContent.projects.map((project) => (
          <ProjectCard key={project.slug} project={project} group="aiml-projects" />
        ))}
      </div>
    </SectionShell>
  );
}
