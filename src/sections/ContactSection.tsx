import { ArrowUpRight, FileText, Mail } from "lucide-react";
import { contactContent } from "@/content/sections";
import { SectionShell, BentoGrid, Panel } from "./SectionShell";
import { GithubMark, LinkedinMark } from "@/components/shared/BrandIcons";

const LINK_ICON = { GitHub: GithubMark, LinkedIn: LinkedinMark } as const;

const CONTACT_LINK =
  "flex items-center gap-2 rounded text-[var(--ink-muted)] underline-offset-4 transition-colors hover:text-[var(--ink)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]";

/**
 * The last card. The email is a real, clickable primary action rather than a
 * form — a contact form on a personal site is a mailto with extra steps and a
 * backend to maintain.
 *
 * A 4+2 bento row: the email CTA takes the wide tile, the other three ways to
 * reach him take the narrow one. Two tiles rather than one card with an internal
 * divider — the rule between the columns used to span neither block's height and
 * read as a stray line, and a grid gap says the same thing without drawing
 * anything.
 */
export function ContactSection() {
  return (
    <SectionShell id="contact" heading={contactContent.heading}>
      <BentoGrid>
        <Panel as="div" className="lg:col-span-4">
          <p className="text-[17px] leading-relaxed text-[var(--ink-muted)]">
            {contactContent.body}
          </p>

          <a
            href={`mailto:${contactContent.email}`}
            className="mt-4 inline-flex items-center gap-2.5 rounded-lg bg-[var(--accent-ink)] px-5 py-3 text-[15px] font-medium text-[var(--surface-solid)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            <Mail aria-hidden className="h-4 w-4" />
            {contactContent.email}
          </a>
        </Panel>

        <Panel as="div" className="lg:col-span-2">
          <ul className="flex flex-col gap-3 text-[15px]">
          {contactContent.links.map((link) => {
            const Icon = LINK_ICON[link.label as keyof typeof LINK_ICON];
            return (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noreferrer" className={CONTACT_LINK}>
                  <Icon className="h-4 w-4" />
                  {link.label}
                  <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
                </a>
              </li>
            );
          })}
          <li>
            <a
              href={contactContent.resumeHref}
              target="_blank"
              rel="noreferrer"
              className={CONTACT_LINK}
            >
              <FileText aria-hidden className="h-4 w-4" />
              Resume
              <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
            </a>
          </li>
          </ul>
        </Panel>
      </BentoGrid>
    </SectionShell>
  );
}
