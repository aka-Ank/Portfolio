import { LOOP, PHASE } from "./scene";
import { mulberry32 } from "./rand";

/**
 * The night sky: a star field that twinkles, and the occasional meteor.
 *
 * **Three nodes for all of the stars, not one per star.** Each star is a tiny
 * radial gradient, and a stack of them paints on a single element — so forty-two
 * stars cost three nodes and three paints instead of forty-two of each. This is
 * the same reasoning that put the drifting motes on a canvas and the terrain in
 * SVG: pick the representation that matches the count.
 *
 * **Three groups is what makes the twinkle irregular.** The field is split into
 * thirds and each third breathes on its own coprime period (41s, 47s, 59s) from
 * its own phase, so stars go soft and bright out of step with one another —
 * which is what an irregular night sky looks like — while individual stars still
 * do not each carry an animation. One group would read as the whole sky pulsing
 * at once; forty-two would be a screensaver, and would cost forty-two nodes.
 *
 * The brightness range is small on purpose. Real twinkling is a change in
 * brightness, not a light going on and off, and the keyframe's floor is 0.58 for
 * that reason.
 *
 * Positions come from a fixed seed, so they are identical on the server, on the
 * client, and between reloads. A star field that reshuffles stops being a sky.
 */

/** How many groups the field is split into. Each gets its own period and phase;
 * see the note above for why this is 3 rather than 1 or 42. */
const GROUPS = 3;

/**
 * The brightest few stars, which sparkle instead of breathing.
 *
 * The three breathing groups are the field's mood, and at 41–59 seconds a swell
 * is atmosphere that nothing ever notices — which is why the sky read as static
 * even after it started animating. These are the opposite: a small number of the
 * largest stars on `star-sparkle`, a sharp keyframe at 11s and 13s, so something
 * up there is always scintillating.
 *
 * Six, not sixty. The whole field sparkling is a Christmas light; a handful of
 * the brightest doing it is a night sky.
 */
const SPARKLERS = 6;

/**
 * Stars stop well above `SCENE_HORIZON` — the land is opaque, and stars drawn
 * behind it would show through gaps the silhouettes do not have.
 *
 * Sizes and alphas are both larger than they were. The first version used a
 * 0.6–1.55px radius at 0.22–0.72 alpha with a single gradient stop, which meant
 * the *average* alpha across an already sub-pixel disc was a fraction of the
 * nominal — the field measured 0.70 opacity and was still effectively invisible
 * against the sky. The solid core below is what fixed it: the gradient holds
 * full colour to 40% of the radius and only then falls away, so a star reads at
 * the size it is drawn.
 */
const STAR_FIELD = (() => {
  const random = mulberry32(0x5eed_1a7e);
  return Array.from({ length: 72 }, (_, index) => {
    // Magnitude, skewed toward the faint end. A real sky is mostly stars you can
    // barely see and a handful you can, and taking a power of a uniform roll is
    // the cheapest way to get that shape — without it every star comes out
    // mid-bright and the field reads as a texture rather than as a sky.
    //
    // The exponent was 2.2 and is now 1.6: at 2.2 the distribution was so
    // bottom-heavy that almost the whole field sat below the threshold of
    // visibility against the night sky, and what should have read as "subtle"
    // read as "nothing there".
    const magnitude = random() ** 1.6;
    return {
      x: random() * 100,
      y: random() * 52,
      radius: 0.95 + magnitude * 2.1,
      alpha: 0.6 + magnitude * 0.4,
      // Round-robin rather than random, so the three groups stay the same size
      // and are evenly scattered — a random assignment clusters, and a cluster
      // of stars sharing a period is exactly the pulsing patch this avoids.
      group: index % GROUPS,
    };
  });
})();

type Star = (typeof STAR_FIELD)[number];

function paint(stars: Star[], boost = 1): string {
  return stars
    .map(({ x, y, radius, alpha }) => {
      const size = (radius * boost).toFixed(2);
      const tint = `color-mix(in oklch, var(--celestial) ${Math.round(
        Math.min(alpha * boost, 1) * 100,
      )}%, transparent)`;
      return `radial-gradient(${size}px ${size}px at ${x.toFixed(2)}% ${y.toFixed(
        2,
      )}%, ${tint} 0%, ${tint} 40%, transparent 100%)`;
    })
    .join(", ");
}

/** The brightest few become the sparklers; everything else breathes. Chosen by
 * magnitude rather than at random, because the star that catches your eye should
 * be one of the ones you could already see. */
const RANKED = [...STAR_FIELD].sort((a, b) => b.radius - a.radius);
const SPARKLING = RANKED.slice(0, SPARKLERS);
const BREATHING = RANKED.slice(SPARKLERS);

const STAR_LAYERS = [
  ...Array.from({ length: GROUPS }, (_, group) => ({
    className: "star-twinkle",
    background: paint(BREATHING.filter((star) => star.group === group)),
    duration: [LOOP.starA, LOOP.starB, LOOP.starC][group],
    delay: [PHASE.starA, PHASE.starB, PHASE.starC][group],
  })),
  // Two sparkle groups so the six do not flare together. Slightly enlarged —
  // a star that sparkles has to be one you can see between sparkles.
  ...[0, 1].map((half) => ({
    className: "star-sparkle",
    background: paint(
      SPARKLING.filter((_, index) => index % 2 === half),
      1.25,
    ),
    duration: [LOOP.sparkleA, LOOP.sparkleB][half],
    delay: [PHASE.sparkleA, PHASE.sparkleB][half],
  })),
];

/**
 * Two meteors, from different places on different diagonals.
 *
 * One streak always falling from the same corner at the same angle stops reading
 * as an event and starts reading as a loop, however long the gap between them
 * is. Both start in the top tenth of the frame and travel down and to the right,
 * which keeps them clear of the hero card without needing to know where it is.
 */
const METEORS = [
  { left: "12%", top: "6%", rotate: "23deg", duration: LOOP.meteorSlow, delay: PHASE.meteorA, far: false },
  { left: "58%", top: "4%", rotate: "34deg", duration: LOOP.meteorSlower, delay: PHASE.meteorB, far: true },
  { left: "36%", top: "12%", rotate: "16deg", duration: LOOP.meteorSlowest, delay: PHASE.meteorC, far: true },
] as const;

export function Sky({ density, meteors }: { density: number; meteors: boolean }) {
  if (density <= 0.01) return null;

  return (
    <div
      className="absolute inset-0"
      aria-hidden
      // A long fade, because this is the transition the brief cares most about:
      // stars appearing at dusk and fading at dawn should never be a thing you
      // catch happening.
      style={{ opacity: density, transition: "opacity 2400ms ease-in-out" }}
    >
      {/* The inline styles here are duration and delay only. Nothing on these
          elements sets `opacity` inline, because `star-twinkle` animates it —
          and an inline value on an animated property is silently discarded,
          which is how the ground mist lost its depth layering once already. */}
      {STAR_LAYERS.map((layer) => (
        <div
          key={`${layer.className}-${layer.duration}`}
          className={`${layer.className} absolute inset-0`}
          style={{
            backgroundImage: layer.background,
            animationDuration: `${layer.duration}s`,
            animationDelay: `${layer.delay}s`,
          }}
        />
      ))}

      {/* Each meteor is invisible for 97.5% of its cycle. The long hold is the
          whole design: what a visitor sees is an empty sky that occasionally,
          briefly, has something in it. Gated on a clear dark night by
          `deriveScene` — a streak drawn over cloud is the kind of detail that
          breaks the illusion rather than adding to it. */}
      {meteors &&
        METEORS.map((meteor) => (
          <div
            key={meteor.duration}
            className={`meteor absolute${meteor.far ? " meteor-far" : ""}`}
            style={{
              left: meteor.left,
              top: meteor.top,
              rotate: meteor.rotate,
              animationDuration: `${meteor.duration}s`,
              animationDelay: `${meteor.delay}s`,
            }}
          />
        ))}
    </div>
  );
}
