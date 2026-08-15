import { clearingContent } from "@/world/scenes/clearing/content";

export function About() {
  return (
    <section id="clearing" aria-label="About" className="mx-auto max-w-2xl px-6 py-24">
      <h2 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
        {clearingContent.heading}
      </h2>
      <p className="mt-1 text-sm tracking-wide text-[var(--muted-foreground)] uppercase">
        {clearingContent.role}
      </p>
      {clearingContent.bio.map((paragraph, i) => (
        <p key={i} className="mt-4 leading-relaxed text-[var(--ink)]">
          {paragraph}
        </p>
      ))}
      <ul className="mt-6 flex flex-col gap-2 border-t border-[var(--border)] pt-4">
        {clearingContent.themes.map((theme) => (
          <li key={theme} className="text-sm text-[var(--muted-foreground)]">
            · {theme}
          </li>
        ))}
      </ul>
    </section>
  );
}
