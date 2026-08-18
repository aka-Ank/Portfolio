import type { CSSProperties } from "react";
import type { CelestialPlacement } from "./scene";
import { crescentShadowOffset } from "@/systems/theme/sky";

/**
 * The sun and the moon — the scene's light source, not two icons pinned to a
 * corner.
 *
 * **No JavaScript runs per frame here.** The real sun moves about a quarter of
 * a degree a minute, which across this arc is roughly a pixel and a half — so
 * the position is recomputed on the same one-minute tick as everything else and
 * a CSS transition carries it between updates. When a visitor pins a time
 * instead, that same transition glides the body along the arc over 1.2s, which
 * matches the palette's damping so the light and its source arrive together.
 *
 * The disc is deliberately small and the bloom deliberately wide. What sells a
 * light source is the falloff around it, not the disc, and a large bright disc
 * is exactly the "blinding light effect" this design rules out. In the dark
 * family `--celestial` is held down near lightness 0.6 for the same reason —
 * and because `contrast-audit.test.ts` samples it, a panel scrolling in front
 * of the moon has to stay readable.
 */

const GLIDE = "transform 1200ms cubic-bezier(0.4, 0, 0.2, 1), opacity 1600ms ease-in-out";

function bodyStyle({ x, y, opacity }: CelestialPlacement, size: string): CSSProperties {
  return {
    // `translate3d` against a zero-origin element rather than `left`/`top`:
    // transforms are composited, so the body moves without the browser
    // re-running layout for the whole fixed backdrop.
    transform: `translate3d(calc(${x}vw - 50%), calc(${y}vh - 50%), 0)`,
    width: size,
    height: size,
    opacity,
    transition: GLIDE,
  };
}

export function Sun({ placement }: { placement: CelestialPlacement }) {
  if (placement.opacity <= 0.01) return null;

  return (
    <div className="absolute left-0 top-0" style={bodyStyle(placement, "min(9vmax, 120px)")}>
      {/* The bloom. Wide, soft, and the part that actually reads as light. */}
      <div
        className="absolute inset-[-320%] rounded-full blur-[70px]"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--glow) 70%, transparent) 0%, color-mix(in oklch, var(--glow) 18%, transparent) 42%, transparent 70%)",
        }}
      />
      {/* The disc. Soft-edged — a hard circle reads as a sticker, and the sun
          seen through any real atmosphere does not have a crisp edge. */}
      <div
        className="absolute inset-[28%] rounded-full blur-[6px]"
        style={{ background: "var(--celestial)" }}
      />
    </div>
  );
}

/**
 * The moon, with a real crescent.
 *
 * The phase is computed from the synodic month, so the shape is correct for the
 * night someone actually visits. It is drawn by offsetting a second disc filled
 * with the sky colour across the first — the classic two-circle construction —
 * because a mask that is just "sky over moon" composites correctly against
 * whatever the atmosphere happens to be, with no second colour to keep in sync.
 */
export function Moon({
  placement,
  illumination,
  waxing,
}: {
  placement: CelestialPlacement;
  illumination: number;
  waxing: boolean;
}) {
  if (placement.opacity <= 0.01) return null;

  // Which limb is lit is what waxing means, so the shadow slides off the
  // opposite side depending on the half of the month.
  const shadowX = waxing ? -crescentShadowOffset(illumination) : crescentShadowOffset(illumination);

  return (
    <div className="absolute left-0 top-0" style={bodyStyle(placement, "min(5.5vmax, 74px)")}>
      <div
        className="absolute inset-[-420%] rounded-full blur-[60px]"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--glow) 55%, transparent) 0%, color-mix(in oklch, var(--glow) 14%, transparent) 38%, transparent 66%)",
        }}
      />
      <div className="absolute inset-[30%] overflow-hidden rounded-full">
        <div className="absolute inset-0 rounded-full" style={{ background: "var(--celestial)" }} />
        {/* The shadowed limb, painted in the sky's own colour so it disappears
            into the background rather than reading as a grey patch. */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "var(--sky-top)",
            transform: `translateX(${shadowX * 100}%)`,
            transition: "transform 1200ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>
    </div>
  );
}
