import { PHASE } from "../scene";

/**
 * The foreground band: fronds along the very bottom edge, and the two trunks
 * that frame the composition.
 *
 * This plane sits entirely below the content band, which is why it is allowed
 * to be the darkest and most detailed of the four. It does two jobs: it closes
 * the bottom of the frame so the scene does not simply stop, and it gives the
 * animals something to stand behind — occlusion is what makes a silhouette
 * read as *in* the world rather than pasted onto it.
 *
 * Each frond sways on its own phase offset. They share one duration, because
 * fronds at the same distance in the same gust genuinely do move together;
 * what would look mechanical is them starting from the same angle, which the
 * negative delays prevent.
 */
export function Foreground() {
  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden
      focusable="false"
    >
      {/* Framing trunks, deliberately cropped by the viewport edges so they
          read as "the near edge of the wood" rather than as two poles. */}
      <path
        fill="var(--layer-fore)"
        d="M-10 900 L-10 470 C 24 520, 34 610, 38 700 C 42 780, 48 850, 54 900 Z"
      />
      <path
        fill="var(--layer-fore)"
        d="M1450 900 L1450 500 C 1416 546, 1404 628, 1398 712 C 1394 786, 1390 852, 1386 900 Z"
      />

      <g
        className="sway-frond"
        style={{ transformOrigin: "8% 100%", animationDelay: `${PHASE.frondA}s` }}
      >
        <path
          fill="var(--layer-fore)"
          d="M40 900 C 60 838, 96 800, 148 782 C 116 812, 92 852, 82 900 Z"
        />
      </g>
      <g
        className="sway-frond"
        style={{ transformOrigin: "26% 100%", animationDelay: `${PHASE.frondB}s` }}
      >
        <path
          fill="var(--layer-fore)"
          d="M330 900 C 348 826, 392 782, 452 764 C 412 800, 382 848, 372 900 Z"
        />
      </g>
      <g
        className="sway-frond"
        style={{ transformOrigin: "62% 100%", animationDelay: `${PHASE.frondC}s` }}
      >
        <path
          fill="var(--layer-fore)"
          d="M880 900 C 896 832, 938 790, 996 774 C 958 808, 930 852, 920 900 Z"
        />
      </g>
      <g
        className="sway-frond"
        style={{ transformOrigin: "88% 100%", animationDelay: `${PHASE.frondA - 5}s` }}
      >
        <path
          fill="var(--layer-fore)"
          d="M1240 900 C 1258 840, 1296 804, 1348 790 C 1314 820, 1290 858, 1282 900 Z"
        />
      </g>

      {/* Ground line, closing the bottom edge under the fronds. */}
      <path fill="var(--layer-fore)" d="M0 872 C 320 856, 700 862, 1050 854 C 1240 850, 1360 858, 1440 866 L1440 900 L0 900 Z" />
    </svg>
  );
}
