import type { CSSProperties, ReactNode } from "react";
import { DEPTH_DRIFT, DEPTH_PARALLAX, type Depth } from "./scene";
import { cn } from "@/lib/utils";

/**
 * One depth plane, and the seam where artwork plugs into the scene.
 *
 * Three ways to fill a plane, in order of preference:
 *
 * 1. **`children`** — an authored SVG silhouette. What ships today.
 * 2. **`plate`** — a transparent PNG/WebP used as a **mask**. The image
 *    supplies only the *shape*; the colour comes from this plane's palette
 *    token. One file then serves all five times of day and both colour modes.
 * 3. **`image`** — a full-colour plate, for artwork whose internal shading
 *    matters more than theming. Needs one file per time of day, and cannot
 *    follow the palette, so it is the last resort rather than the default.
 *
 * Mode 2 is the one worth understanding, because it is what makes
 * "supply your own art" affordable. Five planes × five times of day × two
 * colour modes is fifty full-colour exports, several megabytes, and a
 * Lighthouse score in the seventies. The same five planes as alpha masks are
 * five files that recolour themselves for free.
 *
 * Parallax and vertical placement live here rather than in the artwork, so a
 * plate can be swapped in without knowing anything about how the scene moves.
 */
export function Layer({
  depth,
  children,
  plate,
  image,
  className,
  style,
  /** Extra opacity on top of the plane's own colour. */
  opacity,
}: {
  depth: Depth;
  children?: ReactNode;
  plate?: string;
  image?: string;
  className?: string;
  style?: CSSProperties;
  opacity?: number;
}) {
  const travel = `calc(var(--parallax, 0) * ${DEPTH_PARALLAX[depth]} * var(--parallax-range, 0px))`;
  // Negative, so scrolling *down* slides the wood left — which reads as
  // travelling rightwards through it. The direction is fixed rather than
  // alternating: a backdrop that reverses at some point in the page is the
  // thing that makes drift feel like a mechanism instead of like movement.
  const drift = `calc(var(--parallax, 0) * ${-DEPTH_DRIFT[depth]} * var(--drift-range, 0px))`;

  const maskStyle: CSSProperties = plate
    ? {
        backgroundColor: `var(--layer-${depth})`,
        maskImage: `url(${plate})`,
        WebkitMaskImage: `url(${plate})`,
        maskSize: "cover",
        WebkitMaskSize: "cover",
        maskPosition: "bottom center",
        WebkitMaskPosition: "bottom center",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }
    : {};

  const imageStyle: CSSProperties = image
    ? {
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "bottom center",
        backgroundRepeat: "no-repeat",
      }
    : {};

  return (
    <div
      className={cn("absolute", className)}
      style={{
        // Overscan on the right only, by exactly this plane's own drift
        // distance. Drift is one-directional — the world slides left as the page
        // scrolls down — so extending the left edge would pad artwork that never
        // comes into frame. Sizing the box to `viewport + drift` also makes it
        // the same length as the strip inside it, so one SVG user unit maps to
        // one pixel and `preserveAspectRatio="none"` distorts nothing.
        top: 0,
        bottom: 0,
        left: 0,
        right: `calc(-1 * ${DEPTH_DRIFT[depth]} * var(--drift-range, 0px))`,
        // translate3d rather than `top`/`left`: transforms are composited, so
        // the whole plane moves on the GPU without the browser re-running
        // layout or paint for any of the artwork inside it.
        transform: `translate3d(${drift}, ${travel}, 0)`,
        opacity,
        ...maskStyle,
        ...imageStyle,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
