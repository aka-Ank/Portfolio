/**
 * The three landform planes: a distant ridge, a far treeline, and the mid
 * canopy.
 *
 * All three are single filled paths at a fixed 1440×900 viewBox with
 * `preserveAspectRatio="none"`, so they stretch to any viewport without the
 * component knowing the screen size. Each fills with its plane's palette token,
 * which is what lets one path serve all five times of day.
 *
 * Silhouettes only — no outlines, no interior detail, no gradients. Interior
 * detail at this scale reads as noise behind text, and the whole scene depends
 * on these planes staying quiet.
 */

const SVG_PROPS = {
  viewBox: "0 0 1440 900",
  preserveAspectRatio: "none" as const,
  className: "absolute inset-0 h-full w-full",
  "aria-hidden": true,
  focusable: "false" as const,
};

/** Farthest plane. A low, soft ridge — barely separated from the sky, which is
 * what makes it read as distance rather than as a shape. */
export function Ridge() {
  return (
    <svg {...SVG_PROPS}>
      <path
        fill="var(--layer-far)"
        d="M0 604
           C 96 590, 168 560, 252 556
           C 340 552, 396 582, 468 588
           C 552 594, 606 566, 690 558
           C 782 550, 846 580, 936 586
           C 1024 592, 1090 566, 1176 562
           C 1266 558, 1350 584, 1440 596
           L1440 900 L0 900 Z"
      />
    </svg>
  );
}

/**
 * Far treeline. A serrated edge rather than drawn trees — at this distance a
 * forest is a texture, and individual trunks would be detail the eye has no
 * business resolving.
 *
 * Both the tooth *width* and *height* vary, and neither repeats on a period.
 * An earlier version used a constant step for both, which produced a perfectly
 * regular zigzag that read as a saw blade rather than as a wood — the single
 * most obvious tell that a "forest" was generated rather than drawn. Real
 * treelines cluster: a few tall crowns, then a dip, then a run of low scrub.
 *
 * The path deliberately overshoots x=1440 and is clipped by the viewBox, which
 * is what avoids a giveaway flat run at the right edge.
 */
export function FarTreeline() {
  return (
    <svg {...SVG_PROPS}>
      <path
        fill="var(--layer-mid)"
        d="M0 672
           l18-14 l14 16 l26-30 l20 26 l12-8 l22 14 l30-38 l16 30
           l24-18 l18 22 l28-26 l14 20 l20-34 l26 30 l16-12 l22 16
           l32-28 l18 24 l12-16 l26 18 l20-32 l24 28 l14-20 l28 24
           l18-14 l22 18 l26-36 l16 30 l24-22 l20 26 l30-28 l14 22
           l18-16 l26 20 l22-30 l28 26 l16-18 l20 22 l24-26 l18 20
           l30-34 l22 30 l14-16 l26 20 l20-24 l24 22 l28-30 l16 26
           l22-18 l18 22 l24-28 l20 24 l30-20 l16 18 l22-32 l26 28
           l18-16 l24 20 l28-26 l14 22 l20-18 l26 24 l22-30 l30 26
           l18-22 l24 18 l26-28 l20 26
           L1470 900 L0 900 Z"
      />
    </svg>
  );
}

/**
 * Mid canopy — three overlapping masses, each animated separately.
 *
 * Split into three groups rather than one path so they can sway on different
 * coprime loops. A canopy that moves as a single rigid shape reads as a sheet
 * of cardboard being tilted; three masses drifting out of phase read as wind
 * through a wood. Each rotates about its own base, because a tree bends from
 * where it is rooted.
 */
export function MidCanopy() {
  return (
    <svg {...SVG_PROPS}>
      <g className="sway-canopy-a" style={{ transformOrigin: "20% 100%" }}>
        <path
          fill="var(--layer-near)"
          d="M-40 900 L-40 706
             C 40 686, 78 640, 140 632
             C 206 624, 246 664, 306 660
             C 368 656, 404 618, 462 626
             C 512 633, 536 672, 560 700
             L560 900 Z"
        />
      </g>
      <g className="sway-canopy-b" style={{ transformOrigin: "50% 100%" }}>
        <path
          fill="var(--layer-near)"
          d="M480 900 L480 700
             C 540 676, 588 634, 654 630
             C 726 626, 766 668, 830 662
             C 892 656, 928 620, 986 630
             C 1030 638, 1054 674, 1076 702
             L1076 900 Z"
        />
      </g>
      <g className="sway-canopy-c" style={{ transformOrigin: "82% 100%" }}>
        <path
          fill="var(--layer-near)"
          d="M1000 900 L1000 704
             C 1062 680, 1110 638, 1176 634
             C 1248 630, 1290 670, 1352 664
             C 1410 658, 1444 628, 1480 638
             L1480 900 Z"
        />
      </g>
    </svg>
  );
}
