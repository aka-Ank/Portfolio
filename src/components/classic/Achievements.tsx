import { signalsContent } from "@/content/sections";
import { LiveStats } from "@/components/shared/LiveStats";

export function Achievements() {
  return (
    <section
      id="signals"
      aria-labelledby="classic-signals-heading"
      className="mx-auto max-w-2xl px-6 py-16"
    >
      <h2
        id="classic-signals-heading"
        className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]"
      >
        {signalsContent.heading}
      </h2>
      <p className="mt-3 text-[var(--ink-muted)]">{signalsContent.blurb}</p>

      <h3 className="mt-10 font-mono text-[11px] uppercase tracking-wider text-[var(--accent-ink)]">
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

      {signalsContent.blogPosts.length > 0 && (
        <>
          <h3 className="mt-10 font-mono text-[11px] uppercase tracking-wider text-[var(--accent-ink)]">
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
        </>
      )}

      <div className="mt-10 border-t border-[var(--border-soft)] pt-6">
        <LiveStats />
      </div>
    </section>
  );
}
