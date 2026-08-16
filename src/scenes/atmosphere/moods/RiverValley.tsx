import { MoodSvg, DEPTH_FILL, type MoodProps } from "../MoodSvg";

/** Moss River Valley — the first place the Aether appears, as the river's own
 * current. It is the only saturated thing in the frame, which is what makes
 * it read as meaningful rather than as decoration. */
export function RiverValley({ depth }: MoodProps) {
  if (depth === "far") {
    return (
      <MoodSvg>
        <path d="M0 470 L 336 300 L 612 512 L0 512 Z" fill={DEPTH_FILL.far} opacity="0.6" />
        <path d="M1440 452 L 1108 288 L 812 512 L1440 512 Z" fill={DEPTH_FILL.far} opacity="0.6" />
        <path
          d="M0 512 Q 320 486 640 528 Q 960 570 1440 500 L1440 900 L0 900 Z"
          fill={DEPTH_FILL.far}
          opacity="0.85"
        />
      </MoodSvg>
    );
  }

  if (depth === "mid") {
    return (
      <MoodSvg>
        {/* Valley walls closing in from both sides, leaving the river's
            channel open down the middle third. */}
        <path
          d="M0 560 Q 220 528 402 602 Q 540 660 566 900 L0 900 Z"
          fill={DEPTH_FILL.mid}
        />
        <path
          d="M1440 548 Q 1214 520 1042 596 Q 908 656 884 900 L1440 900 Z"
          fill={DEPTH_FILL.mid}
        />
        {/* The river. Aether at low opacity, brightening toward the near
            bank where the current is fastest. */}
        <path
          d="M700 556 Q 742 632 690 706 Q 636 786 664 900 L800 900 Q 780 782 826 700 Q 872 620 828 556 Z"
          fill="var(--aether)"
          opacity="0.34"
        />
        <path
          d="M736 566 Q 764 636 726 704 Q 690 780 706 900 L760 900 Q 748 780 784 706 Q 820 634 792 566 Z"
          fill="var(--aether)"
          opacity="0.5"
          className="drift-slow"
        />
      </MoodSvg>
    );
  }

  return (
    <MoodSvg>
      <path
        d="M0 748 Q 180 714 336 762 Q 452 798 470 900 L0 900 Z"
        fill={DEPTH_FILL.near}
      />
      <path
        d="M1440 736 Q 1272 700 1116 754 Q 998 794 982 900 L1440 900 Z"
        fill={DEPTH_FILL.near}
      />
      {/* Reeds at the water's edge — the near plane's only moving element. */}
      <g className="sway-soft" style={{ transformOrigin: "720px 900px" }}>
        {REEDS.map(([x, height, bend], i) => (
          <path
            key={i}
            d={`M${x} 900 Q ${x + bend} ${900 - height * 0.55} ${x + bend * 1.6} ${900 - height}`}
            stroke={DEPTH_FILL.near}
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
        ))}
      </g>
    </MoodSvg>
  );
}

const REEDS: [number, number, number][] = [
  [452, 138, 16],
  [496, 96, -12],
  [548, 122, 18],
  [598, 84, -10],
  [880, 130, -18],
  [934, 92, 13],
  [986, 118, -15],
  [1036, 78, 11],
];
