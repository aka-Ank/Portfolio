import { signalsContent } from "@/content/sections";
import { LiveStats } from "@/components/shared/LiveStats";
import { SectionShell } from "./SectionShell";

/** The Observatory's second beat — the measured, external record. Certificates
 * and posts are listed exactly as long as they actually are; nothing here is
 * padded to fill the layout. */
export function SignalsSection() {
  return (
    <SectionShell id="signals" heading={signalsContent.heading} blurb={signalsContent.blurb}>
      <div>
        <h3 className="font-mono text-[11px] uppercase tracking-wider text-[var(--accent-ink)]">
          Certifications
        </h3>
        <ul className="mt-4 space-y-4">
          {signalsContent.certifications.map((cert) => (
            <li key={cert.id} className="border-b border-[var(--border-soft)] pb-4">
              <div className="flex items-baseline justify-between gap-6">
                <span className="text-[15px] text-[var(--ink)]">{cert.title}</span>
                <span className="shrink-0 font-mono text-xs text-[var(--ink-muted)]">
                  {new Date(cert.date).getFullYear()}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-[var(--ink-muted)]">
                {cert.issuer} — {cert.significance}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {signalsContent.blogPosts.length > 0 && (
        <div className="mt-10">
          <h3 className="font-mono text-[11px] uppercase tracking-wider text-[var(--accent-ink)]">
            Writing
          </h3>
          <ul className="mt-4 space-y-3">
            {signalsContent.blogPosts.map((post) => (
              <li key={post.slug} className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-mono text-xs text-[var(--ink-muted)]">{post.date}</span>
                <span className="text-[15px] text-[var(--ink)]">{post.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-10 border-t border-[var(--border-soft)] pt-6">
        <LiveStats />
      </div>
    </SectionShell>
  );
}
