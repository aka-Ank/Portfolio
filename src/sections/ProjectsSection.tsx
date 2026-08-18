import { aimlContent, sdeContent } from "@/content/sections";
import { SectionShell, BentoGrid } from "./SectionShell";
import { ProjectCard } from "./ProjectCard";
import { DisclosureToggle } from "@/components/shared/DisclosureToggle";

/**
 * Three columns of the six-column bento grid per card, so the projects sit on
 * the same rhythm as every other section while still reading as a pair.
 *
 * `stretch={false}` matters more than ever now that cards open independently: a
 * stretched row levels every card to the height of the tallest, so opening one
 * would inflate the blank space beside it. Unstretched, an opened card grows and
 * its neighbours stay the size of their own content — which is what keeps the
 * layout readable with four panels open at once.
 */
const SPAN = "lg:col-span-3";

/** The two tracks get the same card and the same layout. The split is stated
 * by the headings; making the cards look different as well would suggest one
 * track is the serious one. */
export function SdeSection() {
  return (
    <SectionShell id="sde" heading={sdeContent.heading} blurb={sdeContent.blurb}>
      <DisclosureToggle label="all" />
      <BentoGrid stretch={false} className="mt-2">
        {sdeContent.projects.map((project) => (
          <ProjectCard
            key={project.slug}
            project={project}
            className={SPAN}
          />
        ))}
      </BentoGrid>
    </SectionShell>
  );
}

export function AimlSection() {
  return (
    <SectionShell id="aiml" heading={aimlContent.heading} blurb={aimlContent.blurb}>
      <DisclosureToggle label="all" />
      <BentoGrid stretch={false} className="mt-2">
        {aimlContent.projects.map((project) => (
          <ProjectCard
            key={project.slug}
            project={project}
            className={SPAN}
          />
        ))}
      </BentoGrid>
    </SectionShell>
  );
}
