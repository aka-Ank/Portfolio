import { MoodSvg, DEPTH_FILL, type MoodProps } from "../MoodSvg";

/** Moonlit Observatory — the most open sky in the site, because this is the
 * section about looking outward at a record of work. The dome is the only
 * built thing; everything else is ridge and star. */
export function Observatory({ depth }: MoodProps) {
  if (depth === "far") {
    return (
      <MoodSvg>
        {STARS.map(([x, y, r, delay], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={r}
            fill="var(--glow)"
            className="twinkle"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
        <path
          d="M0 556 L 246 428 L 452 520 L 668 396 L 902 512 L 1128 424 L 1330 516 L 1440 466 L1440 900 L0 900 Z"
          fill={DEPTH_FILL.far}
          opacity="0.7"
        />
      </MoodSvg>
    );
  }

  if (depth === "mid") {
    return (
      <MoodSvg>
        <path
          d="M0 668 Q 300 596 620 640 Q 940 684 1440 606 L1440 900 L0 900 Z"
          fill={DEPTH_FILL.mid}
        />
        {/* The dome, set on the left third so it never sits behind the
            content column. */}
        <g>
          <path d="M300 646 L 476 646 L 464 566 L 312 566 Z" fill={DEPTH_FILL.mid} />
          <path
            d="M312 566 Q 388 470 464 566 Z"
            fill={DEPTH_FILL.mid}
          />
          {/* The dome's open slit, lit from inside — the Aether, one more
              time, in the one place it is earned here. */}
          <path
            d="M378 486 Q 396 476 400 492 L 404 566 L 372 566 Z"
            fill="var(--aether)"
            opacity="0.5"
          />
          <rect x={382} y={470} width={4} height={26} fill="var(--aether)" opacity="0.32" />
        </g>
      </MoodSvg>
    );
  }

  return (
    <MoodSvg>
      <path
        d="M0 796 Q 220 754 460 786 Q 740 824 1010 782 Q 1240 748 1440 786 L1440 900 L0 900 Z"
        fill={DEPTH_FILL.near}
      />
      {/* A ledge in the bottom-right corner: gives the shot a foreground
          anchor without crowding the content. */}
      <path
        d="M1440 900 L 1440 796 Q 1330 786 1256 826 Q 1190 862 1136 900 Z"
        fill={DEPTH_FILL.near}
      />
    </MoodSvg>
  );
}

/** [cx, cy, r, twinkleDelaySeconds] — hand-placed rather than random, so the
 * field is stable between renders and reads as a sky rather than as noise. */
const STARS: [number, number, number, number][] = [
  [118, 96, 1.6, 0], [242, 168, 1.1, 2.4], [356, 74, 2.0, 1.2],
  [470, 212, 1.3, 3.6], [548, 108, 1.5, 0.8], [676, 62, 1.9, 2.9],
  [742, 196, 1.2, 1.7], [864, 128, 1.7, 4.1], [948, 58, 1.4, 0.4],
  [1058, 184, 1.8, 3.2], [1164, 96, 1.2, 2.1], [1272, 158, 1.6, 1.5],
  [1358, 72, 1.3, 3.9], [196, 268, 1.1, 2.7], [604, 288, 1.4, 1.1],
  [1006, 262, 1.2, 3.4], [1402, 246, 1.5, 0.6], [88, 348, 1.0, 4.3],
  [826, 336, 1.1, 2.2], [1218, 312, 1.3, 1.9],
];
