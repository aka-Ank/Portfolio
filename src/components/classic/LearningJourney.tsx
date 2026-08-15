import { riverContent } from "@/world/scenes/river/content";

export function LearningJourney() {
  return (
    <section id="river" aria-label="Learning journey" className="mx-auto max-w-2xl px-6 py-24">
      <h2 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
        {riverContent.heading}
      </h2>
      <p className="mt-3 text-[var(--muted-foreground)]">{riverContent.intro}</p>
      <ol className="mt-8 flex flex-col gap-6 border-l border-[var(--border)] pl-6">
        {riverContent.milestones.map((milestone) => (
          <li key={milestone.year}>
            <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--accent)]">
              {milestone.year}
            </span>
            <p className="mt-1 text-[var(--ink)]">{milestone.label}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
