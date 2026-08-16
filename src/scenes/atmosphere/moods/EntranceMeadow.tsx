import { MoodSvg, DEPTH_FILL, type MoodProps } from "../MoodSvg";

/** Entrance Meadow — the widest, emptiest, calmest framing in the site. One
 * subject (the lone tree), a lot of sky, nothing competing. Everything after
 * this gets denser, so this has to establish the floor. */
export function EntranceMeadow({ depth }: MoodProps) {
  if (depth === "far") {
    return (
      <MoodSvg>
        <path
          d="M0 566 Q 210 498 430 528 Q 640 556 860 512 Q 1080 470 1240 512 Q 1350 540 1440 518 L1440 900 L0 900 Z"
          fill={DEPTH_FILL.far}
          opacity="0.55"
        />
        <path
          d="M0 618 Q 260 566 520 596 Q 790 626 1010 588 Q 1230 550 1440 584 L1440 900 L0 900 Z"
          fill={DEPTH_FILL.far}
          opacity="0.8"
        />
      </MoodSvg>
    );
  }

  if (depth === "mid") {
    return (
      <MoodSvg>
        <path
          d="M0 688 Q 300 606 618 648 Q 902 686 1146 630 Q 1306 594 1440 634 L1440 900 L0 900 Z"
          fill={DEPTH_FILL.mid}
        />
        {/* The lone tree — the meadow's single focal point, set on the
            right third rather than centred. */}
        <g className="sway-slow" style={{ transformOrigin: "1064px 660px" }}>
          <path d="M1060 660 L1068 660 L1072 546 L1056 546 Z" fill={DEPTH_FILL.near} />
          <path
            d="M1064 448 Q 1004 462 992 508 Q 962 522 972 552 Q 1010 578 1064 572 Q 1122 578 1158 552 Q 1168 520 1138 506 Q 1126 460 1064 448 Z"
            fill={DEPTH_FILL.mid}
          />
          <path
            d="M1064 462 Q 1022 476 1014 508 Q 1044 528 1064 526 Q 1096 528 1116 506 Q 1106 474 1064 462 Z"
            fill={DEPTH_FILL.near}
            opacity="0.35"
          />
        </g>
      </MoodSvg>
    );
  }

  return (
    <MoodSvg>
      <path
        d="M0 800 Q 250 752 508 784 Q 786 818 1046 776 Q 1256 744 1440 780 L1440 900 L0 900 Z"
        fill={DEPTH_FILL.near}
      />
      <g className="sway-soft" style={{ transformOrigin: "720px 900px" }}>
        {GRASS.map(([x, height, bend], i) => (
          <path
            key={i}
            d={`M${x} 900 Q ${x + bend} ${900 - height * 0.6} ${x + bend * 1.8} ${900 - height}`}
            stroke={DEPTH_FILL.near}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        ))}
      </g>
    </MoodSvg>
  );
}

/** [x, height, bend] — irregular on purpose; evenly spaced blades read as a
 * pattern rather than as grass. */
const GRASS: [number, number, number][] = [
  [40, 96, 14],
  [92, 62, -10],
  [148, 108, 18],
  [196, 74, -8],
  [268, 88, 12],
  [332, 118, -16],
  [388, 66, 9],
  [452, 96, 15],
  [536, 80, -12],
  [604, 112, 17],
  [668, 70, -9],
  [742, 100, 13],
  [812, 86, -14],
  [884, 118, 16],
  [948, 68, -10],
  [1024, 94, 12],
  [1096, 78, -13],
  [1172, 110, 15],
  [1244, 72, -9],
  [1316, 98, 14],
  [1392, 84, -11],
];
