import { ArrowUpRight, FileText, Mail, MapPin } from "lucide-react";
import { heroContent } from "@/content/sections";
import { sectionElementId } from "@/systems/scroll/scrollToSection";
import { SectionJumpButton } from "@/components/shared/SectionJumpButton";
import { GithubMark, LinkedinMark } from "@/components/shared/BrandIcons";
import { CONTENT_GRID, PROSE_MEASURE } from "./SectionShell";
import { cn } from "@/lib/utils";

const CONTACT_ICON = { GitHub: GithubMark, LinkedIn: LinkedinMark } as const;

const CONTACT_LINK =
  "flex items-center gap-2 rounded text-[var(--ink-muted)] underline-offset-4 transition-colors hover:text-[var(--ink)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]";

/**
 * The first screen: a profile card, not a poster.
 *
 * Everything a recruiter opens a portfolio to find — who this is, what he
 * does, where he is, and four ways to reach him — is on the first screen and
 * needs no scrolling and no clicking to reach. The card spans the same
 * `CONTENT_GRID` as every section below it, so its edges line up with the
 * project grid rather than floating at their own width.
 *
 * The two scroll CTAs are the only client-side code here.
 *
 * The minimum height is 70svh rather than 80: at 80 the card carried 292px of
 * dead space around 428px of content, the largest empty block on the page. A
 * minimum is kept at all because the About heading appearing just below the
 * fold is what tells a visitor there is more, and a purely content-sized hero
 * loses that on a tall display.
 */
export function HeroSection() {
  return (
    <section
      id={sectionElementId("hero")}
      aria-labelledby="hero-heading"
      className="flex min-h-[62svh] scroll-mt-20 items-center px-5 py-8 sm:min-h-[70svh] sm:px-10 sm:py-14"
    >
      <div
        className={cn(
          CONTENT_GRID,
          "rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-[0_1px_2px_oklch(0_0_0/0.03),0_12px_36px_-16px_oklch(0_0_0/0.12)] backdrop-blur-md sm:p-9",
        )}
      >
        <p className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface-raised)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink-muted)]">
          {/* Colour alone never carries the meaning — the pill says the words
              too, so the dot is decoration rather than the signal. */}
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--accent-ink)]" />
          {heroContent.availability}
        </p>

        <h1
          id="hero-heading"
          className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2.75rem,7vw,4.5rem)] leading-[1] tracking-[-0.02em] text-[var(--ink)]"
        >
          {heroContent.name}
        </h1>

        <p className="mt-2.5 text-xl text-[var(--ink)] sm:text-2xl">{heroContent.role}</p>

        <p className={cn("mt-2.5 text-[17px] leading-relaxed text-[var(--ink-muted)]", PROSE_MEASURE)}>
          {heroContent.tagline}
        </p>

        {/* The full grid width is what lets all four of these sit on one line
            at desktop instead of wrapping LinkedIn onto a second row. */}
        <ul className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[var(--border-soft)] pt-4 text-[15px]">
          <li className="flex items-center gap-2 text-[var(--ink-muted)]">
            <MapPin aria-hidden className="h-4 w-4 shrink-0" />
            {heroContent.location}
          </li>

          <li>
            <a href={`mailto:${heroContent.email}`} className={CONTACT_LINK}>
              <Mail aria-hidden className="h-4 w-4 shrink-0" />
              {heroContent.email}
            </a>
          </li>

          {heroContent.links.map((link) => {
            const Icon = CONTACT_ICON[link.label as keyof typeof CONTACT_ICON];
            return (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noreferrer" className={CONTACT_LINK}>
                  <Icon className="h-4 w-4 shrink-0" />
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <SectionJumpButton
            target={heroContent.primaryCta.target}
            className="rounded-lg bg-[var(--accent-ink)] px-5 py-2.5 text-[15px] font-medium text-[var(--surface-solid)] transition-opacity hover:opacity-90"
          >
            {heroContent.primaryCta.label}
          </SectionJumpButton>

          <SectionJumpButton
            target={heroContent.secondaryCta.target}
            className="rounded-lg border border-[var(--border-soft)] px-5 py-2.5 text-[15px] text-[var(--ink)] transition-colors hover:bg-[var(--surface-raised)]"
          >
            {heroContent.secondaryCta.label}
          </SectionJumpButton>

          {/* Opens rather than downloads: it is a PDF, and most people would
              rather glance at it in the browser's viewer than fish a file out
              of their downloads folder. */}
          <a
            href={heroContent.resumeHref}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[15px] text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            <FileText aria-hidden className="h-4 w-4" />
            Resume
            <ArrowUpRight aria-hidden className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
