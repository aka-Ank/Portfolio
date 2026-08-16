import { sdeContent, aimlContent } from "@/content/sections";
import { SectionShell } from "./SectionShell";
import { ProjectCard } from "./ProjectCard";

/** The Ancient Grove — software work. Organic skin, prose-led cards, a single
 * column so each project gets read rather than scanned. */
export function SdeSection() {
  return (
    <SectionShell id="sde" heading={sdeContent.heading} blurb={sdeContent.blurb} width="wide">
      <div className="grid gap-5 md:grid-cols-2">
        {sdeContent.projects.map((project) => (
          <ProjectCard key={project.slug} project={project} skin="organic" />
        ))}
      </div>
    </SectionShell>
  );
}

/** The Mechanical Jungle — applied ML. Instrumented skin: metrics surface on
 * the closed card, type turns monospaced, corners tighten. Same card, and
 * deliberately so — the tracks are two kinds of work by one engineer, not two
 * unrelated portfolios. */
export function AimlSection() {
  return (
    <SectionShell id="aiml" heading={aimlContent.heading} blurb={aimlContent.blurb} width="wide">
      <div className="grid gap-4 md:grid-cols-2">
        {aimlContent.projects.map((project) => (
          <ProjectCard key={project.slug} project={project} skin="instrumented" />
        ))}
      </div>
    </SectionShell>
  );
}
