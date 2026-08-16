import { MoodSvg, DEPTH_FILL, type MoodProps } from "../MoodSvg";

/**
 * Ancient Grove — the SDE track's place. Entirely organic vocabulary: curved
 * trunks, an overhead canopy, no straight lines anywhere. It exists to be the
 * visual opposite of the Mechanical Jungle that follows, so a visitor feels
 * the two tracks are different work before reading a word of either.
 */
export function AncientGrove({ depth }: MoodProps) {
  if (depth === "far") {
    return (
      <MoodSvg>
        <path
          d="M0 540 Q 180 470 360 528 Q 540 586 720 512 Q 900 438 1080 510 Q 1260 582 1440 522 L1440 900 L0 900 Z"
          fill={DEPTH_FILL.far}
          opacity="0.6"
        />
        {FAR_TRUNKS.map(([x, width, top], i) => (
          <rect
            key={i}
            x={x}
            y={top}
            width={width}
            height={900 - top}
            fill={DEPTH_FILL.far}
            opacity="0.5"
            rx={width / 2}
          />
        ))}
      </MoodSvg>
    );
  }

  if (depth === "mid") {
    return (
      <MoodSvg>
        {/* The canopy arch — the grove's ceiling, framing the content the way
            a rule-of-thirds vignette would. */}
        <path
          d="M0 0 L1440 0 L1440 132 Q 1180 236 940 168 Q 720 106 500 176 Q 262 250 0 148 Z"
          fill={DEPTH_FILL.mid}
          opacity="0.9"
          className="sway-canopy"
          style={{ transformOrigin: "720px 0px" }}
        />
        {TRUNKS.map(([x, width, lean], i) => (
          <path
            key={i}
            d={`M${x} 900 L${x + width} 900 L${x + width + lean} 150 L${x + lean} 150 Z`}
            fill={DEPTH_FILL.mid}
          />
        ))}
        <path
          d="M0 700 Q 320 646 660 686 Q 1000 726 1440 664 L1440 900 L0 900 Z"
          fill={DEPTH_FILL.mid}
        />
      </MoodSvg>
    );
  }

  return (
    <MoodSvg>
      <path
        d="M0 806 Q 260 762 520 796 Q 800 832 1080 790 Q 1280 760 1440 792 L1440 900 L0 900 Z"
        fill={DEPTH_FILL.near}
      />
      {/* Roots breaking the lower edge — organic, uneven, no repeated shape. */}
      <path
        d="M0 900 Q 96 826 180 862 Q 244 890 300 900 Z"
        fill={DEPTH_FILL.near}
      />
      <path
        d="M1440 900 Q 1338 812 1236 856 Q 1160 890 1092 900 Z"
        fill={DEPTH_FILL.near}
      />
      {/* Fern fronds, bottom corners only — keeps the centre readable. */}
      <g className="sway-soft" style={{ transformOrigin: "120px 900px" }}>
        {FRONDS.map(([x, y, length, angle], i) => (
          <path
            key={i}
            d={`M${x} ${y} q ${length * 0.4} ${-length * 0.42} ${length * Math.cos((angle * Math.PI) / 180)} ${-length * Math.sin((angle * Math.PI) / 180)}`}
            stroke={DEPTH_FILL.near}
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
          />
        ))}
      </g>
    </MoodSvg>
  );
}

/** [x, width, topY] */
const FAR_TRUNKS: [number, number, number][] = [
  [128, 22, 452],
  [318, 16, 486],
  [612, 26, 430],
  [878, 18, 470],
  [1164, 24, 444],
  [1362, 15, 492],
];

/** [x, width, lean] — lean is the horizontal drift from base to canopy, so no
 * two trunks are parallel. */
const TRUNKS: [number, number, number][] = [
  [72, 54, 26],
  [286, 38, -18],
  [1004, 44, 22],
  [1268, 62, -30],
];

/** [x, y, length, angleDeg] */
const FRONDS: [number, number, number, number][] = [
  [30, 900, 150, 62],
  [86, 900, 118, 44],
  [148, 900, 168, 74],
  [214, 900, 104, 38],
];
