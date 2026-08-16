import { MoodSvg, DEPTH_FILL, type MoodProps } from "../MoodSvg";

/**
 * Mechanical Jungle — the AI/ML track's place, and the Grove's deliberate
 * counterpart. Same forest, rebuilt out of geometry: straight trunks on a
 * regular rhythm, horizontal conduit bands, Aether nodes where the conduits
 * meet. Structure grown *into* the forest rather than bolted onto it.
 */
export function MechanicalJungle({ depth }: MoodProps) {
  if (depth === "far") {
    return (
      <MoodSvg>
        <path
          d="M0 508 L 168 428 L 336 508 L 504 446 L 672 508 L 840 420 L 1008 508 L 1176 452 L 1344 508 L 1440 470 L 1440 900 L 0 900 Z"
          fill={DEPTH_FILL.far}
          opacity="0.55"
        />
        {FAR_PYLONS.map((x, i) => (
          <rect key={i} x={x} y={470} width={8} height={430} fill={DEPTH_FILL.far} opacity="0.45" />
        ))}
      </MoodSvg>
    );
  }

  if (depth === "mid") {
    return (
      <MoodSvg>
        {PYLONS.map(({ x, width, top }, i) => (
          <g key={i}>
            <rect x={x} y={top} width={width} height={900 - top} fill={DEPTH_FILL.mid} />
            {/* Conduit seam running the height of each pylon. */}
            <rect
              x={x + width / 2 - 1.5}
              y={top + 30}
              width={3}
              height={900 - top - 60}
              fill="var(--aether)"
              opacity="0.28"
            />
          </g>
        ))}

        {/* Horizontal conduit bands linking the pylons — the structural
            grid the Grove deliberately has none of. */}
        {[326, 452, 588].map((y, i) => (
          <rect key={i} x={0} y={y} width={1440} height={2} fill={DEPTH_FILL.mid} opacity="0.7" />
        ))}

        {/* Aether nodes at the junctions. Slow, offset pulses — never in
            unison, which would read as a blinking UI rather than as life. */}
        {NODES.map(([x, y, delay], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={7}
            fill="var(--aether)"
            className="pulse-node"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}

        <path d="M0 700 L 1440 664 L1440 900 L0 900 Z" fill={DEPTH_FILL.mid} />
      </MoodSvg>
    );
  }

  return (
    <MoodSvg>
      <path d="M0 792 L 1440 762 L1440 900 L0 900 Z" fill={DEPTH_FILL.near} />
      {/* Angular root-conduits — the Grove's fern fronds, redrawn as
          straight segments. */}
      <g opacity="0.95">
        <path
          d="M0 900 L 0 838 L 74 838 L 74 872 L 168 872 L 168 900 Z"
          fill={DEPTH_FILL.near}
        />
        <path
          d="M1440 900 L 1440 820 L 1342 820 L 1342 862 L 1228 862 L 1228 900 Z"
          fill={DEPTH_FILL.near}
        />
      </g>
      <rect x={74} y={836} width={94} height={2} fill="var(--aether)" opacity="0.4" />
      <rect x={1248} y={818} width={94} height={2} fill="var(--aether)" opacity="0.4" />
    </MoodSvg>
  );
}

const FAR_PYLONS = [96, 268, 430, 604, 782, 950, 1124, 1298];

const PYLONS = [
  { x: 44, width: 40, top: 236 },
  { x: 212, width: 26, top: 292 },
  { x: 1046, width: 30, top: 268 },
  { x: 1210, width: 46, top: 220 },
  { x: 1384, width: 24, top: 300 },
];

/** [cx, cy, animationDelaySeconds] */
const NODES: [number, number, number][] = [
  [64, 326, 0],
  [225, 452, 1.7],
  [1061, 326, 3.1],
  [1233, 588, 0.9],
  [1396, 452, 2.4],
];
