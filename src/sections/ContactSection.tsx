import { ArrowUpRight, FileText, Mail } from "lucide-react";
import { contactContent } from "@/content/sections";
import { SectionShell } from "./SectionShell";
import { GithubMark, LinkedinMark } from "@/components/shared/BrandIcons";

const LINK_ICON = { GitHub: GithubMark, LinkedIn: LinkedinMark } as const;

/** The last card. The email is a real, clickable primary action rather than a
 * form — a contact form on a personal site is a mailto with extra steps and a
 * backend to maintain. */
export function ContactSection() {
  return (
    <SectionShell id="contact" heading={contactContent.heading}>
      <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-8 backdrop-blur-md">
        <p className="max-w-lg text-[17px] leading-relaxed text-[var(--ink-muted)]">
          {contactContent.body}
        </p>

        <a
          href={`mailto:${contactContent.email}`}
          className="mt-7 inline-flex items-center gap-2.5 rounded-lg bg-[var(--accent-ink)] px-5 py-3 text-[15px] font-medium text-[var(--surface-solid)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
        >
          <Mail aria-hidden className="h-4 w-4" />
          {contactContent.email}
        </a>

        <ul className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[var(--border-soft)] pt-6 text-[15px]">
          {contactContent.links.map((link) => {
            const Icon = LINK_ICON[link.label as keyof typeof LINK_ICON];
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded text-[var(--ink-muted)] underline-offset-4 transition-colors hover:text-[var(--ink)] hover:underline"
                >
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
              className="flex items-center gap-2 rounded text-[var(--ink-muted)] underline-offset-4 transition-colors hover:text-[var(--ink)] hover:underline"
            >
              <FileText aria-hidden className="h-4 w-4" />
              Resume
            </a>
          </li>
        </ul>
      </div>
    </SectionShell>
  );
}
