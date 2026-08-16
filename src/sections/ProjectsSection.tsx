import { aimlContent, sdeContent } from "@/content/sections";
import { SectionShell } from "./SectionShell";
import { ProjectCard } from "./ProjectCard";

/** The two tracks get the same card and the same layout. The split is stated
 * by the headings; making the cards look different as well would suggest one
 * track is the serious one. */
export function SdeSection() {
  return (
    <SectionShell id="sde" heading={sdeContent.heading} blurb={sdeContent.blurb} width="wide">
      <div className="grid gap-5 lg:grid-cols-2">
        {sdeContent.projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </SectionShell>
  );
}

export function AimlSection() {
  return (
    <SectionShell id="aiml" heading={aimlContent.heading} blurb={aimlContent.blurb} width="wide">
      <div className="grid gap-5 lg:grid-cols-2">
        {aimlContent.projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </SectionShell>
  );
}
