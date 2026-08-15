import { observatoryContent } from "@/world/scenes/observatory/content";
import { LiveStats } from "@/components/shared/LiveStats";

export function Achievements() {
  return (
    <section id="observatory" aria-label="Achievements and writing" className="mx-auto max-w-2xl px-6 py-24">
      <h2 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
        {observatoryContent.heading}
      </h2>
      <p className="mt-3 text-[var(--muted-foreground)]">{observatoryContent.intro}</p>

      <h3 className="mt-10 font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--muted-foreground)] uppercase">
        Certifications
      </h3>
      <ul className="mt-4 flex flex-col gap-4">
        {observatoryContent.certifications.map((cert) => (
          <li key={cert.id} className="border-b border-[var(--border)] pb-4">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[var(--ink)]">{cert.title}</span>
              <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted-foreground)]">
                {new Date(cert.date).getFullYear()}
              </span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              {cert.issuer} — {cert.significance}
            </p>
          </li>
        ))}
      </ul>

      <h3 className="mt-10 font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--muted-foreground)] uppercase">
        Latest writing
      </h3>
      <ul className="mt-4 flex flex-col gap-3">
        {observatoryContent.blogPosts.map((post) => (
          <li key={post.slug}>
            <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted-foreground)]">
              {post.date}
            </span>{" "}
            <span className="text-[var(--ink)]">{post.title}</span>
          </li>
        ))}
      </ul>

      <div className="mt-10 border-t border-[var(--border)] pt-6">
        <LiveStats />
      </div>
    </section>
  );
}
