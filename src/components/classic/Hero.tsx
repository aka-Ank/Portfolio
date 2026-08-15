import { entranceContent } from "@/world/scenes/entrance/content";

// Classic mode's hero — same copy as the immersive Entrance overlay, plain
// semantic HTML. See docs/08-roadmap.md Phase 4 "same copy and structure as
// immersive."
export function Hero() {
  return (
    <section
      id="entrance"
      aria-label="Introduction"
      className="flex min-h-[90vh] flex-col items-center justify-center px-6 text-center"
    >
      <p className="text-sm tracking-wide text-[var(--muted-foreground)] uppercase">
        {entranceContent.eyebrow}
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl text-[var(--ink)] sm:text-7xl">
        {entranceContent.heading}
      </h1>
      <p className="mt-4 max-w-md text-lg text-[var(--muted-foreground)]">
        {entranceContent.subheading}
      </p>
    </section>
  );
}
