import type { CSSProperties, ReactNode } from "react";
import { DEPTH_PARALLAX, type Depth } from "./scene";
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
      className={cn("absolute inset-0", className)}
      style={{
        // translate3d rather than `top`: transforms are composited, so the
        // whole plane moves on the GPU without the browser re-running layout
        // or paint for any of the artwork inside it.
        transform: `translate3d(0, ${travel}, 0)`,
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
