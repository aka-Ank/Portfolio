import { MoodSvg, DEPTH_FILL, type MoodProps } from "../MoodSvg";

/**
 * Campfire Terminal — the closest, most intimate framing in the site, and the
 * only one that closes in rather than opening out. The forest becomes a ring
 * around a single warm light. It is the last thing a visitor sees, so it
 * carries the site's one moment of genuine warmth.
 */
export function Campfire({ depth }: MoodProps) {
  if (depth === "far") {
    return (
      <MoodSvg>
        {/* A ring of trees closing the horizon off entirely — no open sky
            here, which is what makes the section feel enclosed. Rounded
            crowns at uneven heights: straight-edged peaks read as a mountain
            ridge, which is the wrong place entirely. */}
        <path
          d="M0 900 L0 384 Q 44 300 96 374 Q 148 272 208 358 Q 262 302 318 368 Q 376 284 438 360 Q 498 314 554 372 Q 612 278 676 354 Q 732 308 790 366 Q 848 286 910 358 Q 968 316 1026 370 Q 1084 280 1148 356 Q 1206 310 1264 368 Q 1322 290 1384 360 Q 1416 332 1440 374 L1440 900 Z"
          fill={DEPTH_FILL.far}
          opacity="0.75"
        />
      </MoodSvg>
    );
  }

  if (depth === "mid") {
    return (
      <MoodSvg>
        <defs>
          <radialGradient id="campfire-pool" cx="50%" cy="82%" r="52%">
            <stop offset="0%" stopColor="var(--glow)" stopOpacity="0.5" />
            <stop offset="55%" stopColor="var(--glow)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--glow)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* The pool of firelight on the ground. Breathes very slowly — the
            one place in the site where a glow is allowed to change strength,
            because that is what fire actually does. */}
        <rect x="0" y="0" width="1440" height="900" fill="url(#campfire-pool)" className="breathe" />
        <path
          d="M0 712 Q 340 660 720 700 Q 1100 740 1440 682 L1440 900 L0 900 Z"
          fill={DEPTH_FILL.mid}
        />
      </MoodSvg>
    );
  }

  return (
    <MoodSvg>
      <path
        d="M0 820 Q 300 782 720 812 Q 1140 842 1440 800 L1440 900 L0 900 Z"
        fill={DEPTH_FILL.near}
      />
      {/* Logs, laid as a loose lean-to rather than a tidy stack. Deliberately
          a darker mix of the near-plane fill rather than the fill itself:
          they sit *on* that plane, so drawing them in the same colour makes
          them disappear into it. */}
      <g fill={`color-mix(in oklch, ${DEPTH_FILL.near} 65%, black)`}>
        <path d="M598 880 L 806 838 L 814 856 L 606 898 Z" />
        <path d="M634 838 L 838 878 L 830 896 L 626 856 Z" />
        <path d="M690 892 L 706 812 L 724 814 L 712 894 Z" />
      </g>
      {/* Embers. The Aether's warmest expression — same hue as the river and
          the conduits, carried all the way to the last frame. */}
      {EMBERS.map(([x, y, r, delay], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={r}
          fill="var(--aether)"
          className="ember"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </MoodSvg>
  );
}

/** [cx, cy, r, delaySeconds] */
const EMBERS: [number, number, number, number][] = [
  [688, 828, 2.4, 0],
  [716, 842, 1.8, 1.9],
  [742, 820, 2.1, 3.4],
  [664, 848, 1.5, 2.6],
  [730, 862, 2.6, 4.8],
  [700, 872, 1.7, 1.2],
];
