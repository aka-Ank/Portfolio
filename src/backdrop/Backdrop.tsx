/**
 * The fixed page backdrop: a base wash, two large soft glows anchored off the
 * edges, a veil whose strength is the visitor's atmosphere setting, and a fine
 * grain pass.
 *
 * There is no illustration and nothing that moves on its own. Every colour
 * here is a decorative atmosphere token that drifts with the palette, and none
 * of them is ever the background behind text — the sections carry their own
 * `--surface`, so contrast is decided there and cannot be affected by this.
 *
 * A pure server component. It has no state, no effects and no scroll listener,
 * which is what makes it free: the whole backdrop is four painted layers that
 * the compositor never has to re-rasterise.
 */
export function Backdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--sky-top)_0%,var(--sky-mid)_55%,var(--sky-horizon)_100%)]" />

      {/* Two glows, both anchored off-canvas so neither reads as a light
          source in the frame — only as a warmth in one corner and a cool
          cast in the other. */}
      <div
        className="absolute -left-[15%] -top-[25%] h-[85vmax] w-[85vmax] rounded-full opacity-[0.55] blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, var(--glow) 0%, color-mix(in oklch, var(--glow) 22%, transparent) 45%, transparent 72%)",
        }}
      />
      <div
        className="absolute -bottom-[30%] -right-[20%] h-[70vmax] w-[70vmax] rounded-full opacity-[0.4] blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, var(--aether) 0%, color-mix(in oklch, var(--aether) 16%, transparent) 45%, transparent 72%)",
        }}
      />

      {/* The atmosphere control. Raising the veil mutes the glows behind it
          rather than adding anything of its own, so the strongest setting is
          the calmest picture — never a busier one. */}
      <div
        className="absolute inset-0 transition-opacity duration-[1200ms] ease-out motion-reduce:transition-none"
        style={{ background: "var(--sky-mid)", opacity: "var(--veil-strength, 0)" }}
      />

      <div className="grain absolute inset-0" />
    </div>
  );
}
