import { poseAt, type Species, type WildlifeEvent } from "./ecosystem";
import { mulberry32 } from "./rand";

/**
 * The world's inhabitants, drawn.
 *
 * Every animal is a silhouette in its plane's own colour, small, and partly
 * occluded by whatever is in front of it — the same three rules the original
 * plates followed, and the reason they read as *in* the world rather than
 * placed on it.
 *
 * **Nothing here decides anything.** Which animals exist and where they have
 * got to is `ecosystem.ts`; this renders the answer. The pose comes from
 * `poseAt`, whose arcs all begin and end outside the frame, so nothing ever
 * appears or vanishes in view.
 *
 * Sizes are in the 900-unit viewBox: a deer is ~46 units against a 900-unit
 * frame. At portfolio scale these should be something a visitor notices second,
 * not first.
 */

const BASE = 900;

/**
 * One gesture and one period per species — the whole motion system, in one
 * table.
 *
 * These used to live in two places: the class name here and the duration in
 * `globals.css`. Splitting a species' identity across two files is how two of
 * them quietly end up sharing a period, which is the one failure mode this
 * system exists to avoid — animals on the same period read as one organism with
 * several skins, no matter how well each is drawn.
 *
 * The periods are deliberately unlike each other and deliberately not round: a
 * squirrel's tail and a rabbit's twitch at 2.3s and 3.1s never land on the same
 * frame twice, where 2s and 3s would meet every six seconds.
 *
 * `null` means the species has no idle loop, because its whole appearance is
 * already motion — a dragonfly darts and a fish is a spreading ring.
 */
export const GESTURE: Record<Species, { className: string; period: number } | null> = {
  // 1.9s, not 4s. At four seconds a wingbeat is slower than a heartbeat, and
  // combined with the vertical bob it used to carry, the birds read as tumbling
  // debris rather than as anything flying.
  bird: { className: "bird-flap", period: 1.9 },
  squirrel: { className: "tail-flick", period: 2.3 },
  rabbit: { className: "body-twitch", period: 3.1 },
  duck: { className: "water-bob", period: 7 },
  fox: { className: "tail-sweep", period: 11 },
  deer: { className: "ear-flick", period: 13 },
  owl: { className: "head-turn", period: 29 },
  dragonfly: null,
  fish: null,
};

/**
 * How much an individual's period may differ from its species'.
 *
 * Phase offsets alone are not enough. Two deer given the same 13s period and
 * different delays stay in *permanent* lockstep — the gap between their ear
 * flicks never changes, which over a minute reads as two halves of one clock
 * rather than two animals. Varying the period by a few percent means they drift
 * apart and back together on their own, which is what actually happens.
 *
 * Kept small: at ±9% a deer's flick is somewhere between 11.8s and 14.2s, still
 * unmistakably a deer's rhythm and not a squirrel's.
 */
const PERIOD_JITTER = 0.09;

/** The idle animation for one appearance: species gesture, individually timed. */
interface Idle {
  className?: string;
  style?: React.CSSProperties;
}

function idleFor(species: Species, random: () => number): Idle {
  const gesture = GESTURE[species];
  if (!gesture) return {};
  const period = gesture.period * (1 + (random() - 0.5) * 2 * PERIOD_JITTER);
  return {
    className: gesture.className,
    style: {
      animationDuration: `${period.toFixed(2)}s`,
      // Negative, so the loop is already mid-cycle on the first frame rather
      // than every creature starting from rest together.
      animationDelay: `${(-random() * period).toFixed(2)}s`,
    },
  };
}

function fill(plane: "near" | "fore" | "mid") {
  return `var(--layer-${plane})`;
}

/** Standing at the shore. The head is hinged at the shoulder so lowering it to
 * drink rotates the whole head rather than stretching the neck; the ear is
 * hinged separately and carries the idle. */
function Deer({ lowered, scale, idle }: { lowered: boolean; scale: number; idle: Idle }) {
  return (
    <g transform={`scale(${scale})`}>
      <path
        fill={fill("fore")}
        d="M0 46 L3 22 C 4 14, 10 9, 19 8 L44 7 C 52 7, 57 11, 58 18
           L59 30 L63 46 L58 46 L55 33 L44 34 L46 46 L41 46 L38 34 L22 34
           L20 46 L15 46 L17 33 L7 30 L5 46 Z"
      />
      <g
        style={{
          transformOrigin: "56px 16px",
          transform: `rotate(${lowered ? 46 : 0}deg)`,
          transition: "transform 2600ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <path
          fill={fill("fore")}
          d="M54 18 C 58 10, 62 4, 66 1 L72 0 C 74 0, 75 2, 74 4 L70 8
             C 68 11, 66 15, 64 20 Z"
        />
        <g
          className={idle.className}
          style={{ transformOrigin: "68px 3px", ...idle.style }}
        >
          <path fill={fill("fore")} d="M67 3 L73 -3 L74 1 L69 5 Z" />
        </g>
      </g>
    </g>
  );
}

/**
 * Forest edge, dusk. A long low body and a heavy tail — the two things that
 * read as "fox" at silhouette scale, where the ears and the muzzle are a few
 * pixels and the colour is the plane's, not russet.
 */
function Fox({ scale, idle }: { scale: number; idle: Idle }) {
  return (
    <g transform={`scale(${scale})`}>
      <path
        fill={fill("fore")}
        d="M6 26 C 4 18, 8 13, 16 12 L38 11 C 44 11, 47 14, 48 19
           L49 26 L45 26 L44 20 L34 21 L35 26 L31 26 L30 21 L18 21
           L17 26 L13 26 L14 20 L9 19 L8 26 Z"
      />
      {/* Head and ears, held level — a fox on the move carries its head low. */}
      <path
        fill={fill("fore")}
        d="M45 19 C 49 15, 54 13, 58 12 L62 11 L60 15 L56 17
           C 53 18, 50 20, 48 23 Z M50 14 L49 9 L54 12 Z M56 12 L56 7 L60 11 Z"
      />
      <g className={idle.className} style={{ transformOrigin: "8px 20px", ...idle.style }}>
        <path
          fill={fill("fore")}
          d="M9 20 C 2 19, -6 21, -11 26 C -5 24, 0 24, 6 25 Z"
        />
      </g>
    </g>
  );
}

/** On the water. The body sits low with a high stern — the shape that reads as
 * a duck at any size. */
function Duck({ lowered, scale, idle }: { lowered: boolean; scale: number; idle: Idle }) {
  return (
    <g className={idle.className} style={idle.style}>
      <g transform={`scale(${scale})`}>
      <path
        fill={fill("fore")}
        d="M0 12 C 1 5, 8 1, 16 1 C 24 1, 30 4, 32 9 L38 2 L39 8 L34 13
           C 31 16, 22 17, 12 17 C 5 17, 0 15, 0 12 Z"
      />
      <g
        style={{
          transformOrigin: "12px 8px",
          transform: `rotate(${lowered ? 38 : 0}deg)`,
          transition: "transform 1400ms ease-in-out",
        }}
      >
        <path fill={fill("fore")} d="M9 8 C 8 3, 9 -2, 12 -4 C 15 -4, 16 -1, 15 3 L14 8 Z" />
        </g>
      </g>
    </g>
  );
}

function Rabbit({ scale, idle }: { scale: number; idle: Idle }) {
  return (
    <g className={idle.className} style={idle.style}>
      <path
        transform={`scale(${scale})`}
        fill={fill("fore")}
        d="M0 20 C 0 13, 4 9, 10 8 C 12 3, 13 -2, 15 -2 C 17 -2, 17 3, 16 7
           L20 7 C 20 2, 21 -3, 23 -3 C 25 -3, 25 2, 24 8 C 27 10, 28 15, 27 20 Z"
      />
    </g>
  );
}

function Squirrel({ scale, idle }: { scale: number; idle: Idle }) {
  return (
    <g transform={`scale(${scale})`}>
      <path
        fill={fill("near")}
        d="M0 16 C 0 11, 3 8, 7 7 C 8 3, 10 1, 13 1 C 15 1, 16 3, 15 5
           C 18 7, 19 11, 18 16 Z"
      />
      {/* The tail is the whole silhouette at this size, and it never stops. */}
      <g className={idle.className} style={{ transformOrigin: "18px 16px", ...idle.style }}>
        <path fill={fill("near")} d="M18 16 C 22 13, 24 7, 22 1 C 27 5, 28 14, 22 19 Z" />
      </g>
    </g>
  );
}

/** Perched, not flying. Night only, and the stillest thing in the set. */
function Owl({ scale, idle }: { scale: number; idle: Idle }) {
  return (
    <g className={idle.className} style={{ transformOrigin: "17px 0px", ...idle.style }}>
      <g transform={`scale(${scale})`}>
      <path
        fill={fill("fore")}
        d="M11 0 C 8 -6, 8 -14, 12 -19 C 14 -22, 16 -24, 17 -25
           C 18 -24, 20 -22, 22 -19 C 26 -14, 26 -6, 23 0 Z"
      />
      <path fill={fill("fore")} d="M12 -21 L10 -26 L14 -23 Z" />
      <path fill={fill("fore")} d="M22 -21 L24 -26 L20 -23 Z" />
      </g>
    </g>
  );
}

/**
 * Three birds on a slow arc, each beating on its own offset.
 *
 * **The silhouette is a gull's, not a lens.** The first version was an 8×3 blob
 * — `q4-3 8 0` and back — which at flight scale rendered as a small circle and
 * read as one. What makes a distant bird legible is the *elbow*: two wings that
 * sweep down to a body and back up, so the shape is an M rather than a dash. The
 * path below is 26 units across with a defined dip at the body and thin
 * wingtips, which is the smallest thing that still reads as a bird rather than
 * as a mark.
 *
 * The wingbeat is a *burst* — roughly a fifth of the cycle, then a glide — which
 * is what birds actually do and what stops it reading as a moth. The three
 * offsets matter as much as the beat itself: a flock flapping in unison is a
 * decoration, not a flock.
 */
/**
 * The wings, drawn at ~6:1 — far wider than a bird looks.
 *
 * `Wildlife`'s SVG is `preserveAspectRatio="none"` over a viewBox as wide as the
 * whole world strip, so **x units are squashed and y units are not** — by about
 * 0.59 at 1280px and 0.34 on a phone. Compact animals barely notice; a
 * wide-winged silhouette is exactly the shape that does. Drawn at its true
 * proportions the gull came out stubby, which is half of why it read as a blob.
 *
 * The leading edge dips further than the trailing edge returns, which is what
 * gives the wing taper — thick at the shoulder, thin at the tip.
 */
const WING =
  "M0 -6.5 C 8.5 -3.4 15.5 -0.8 22 1.8 C 28.5 -0.8 35.5 -3.4 44 -6.5 " +
  "C 35.5 -4.7 28.5 -2.3 22 0.3 C 15.5 -2.3 8.5 -4.7 0 -6.5 Z";

/** A tail, behind the body. Three units long and the difference between a
 * crescent and a bird — it is the one part that says which way it is going. */
const TAIL = "M19.4 1 L14.6 3.4 L19.4 2.6 Z";

/**
 * One bird: wings, a body, a tail.
 *
 * The body and tail are separate paths rather than part of the wing outline
 * because the parent group scales in Y to beat the wings — so the body squashes
 * with them, which is what a real bird's silhouette does, without the outline
 * having to encode both states.
 */
function Gull({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${size.toFixed(2)})`}>
      {/* `fore`, the darkest plane — **not** `mid`, which is what this used to
          be. Every other animal sits against the ground, where `mid` reads as a
          silhouette; a bird sits against the *sky*, and in the light family
          `--layer-mid` is a pale blue-grey against a near-white sky. Same
          failure as the sun disc, which was near-white on a near-white sky until
          it was separated on chroma rather than lightness. */}
      <path fill={fill("fore")} d={WING} />
      <path fill={fill("fore")} d={TAIL} />
      <ellipse cx={22} cy={0.9} rx={3.4} ry={1.6} fill={fill("fore")} />
    </g>
  );
}

/**
 * A flock, laid out differently every time.
 *
 * Two to five birds on a loose diagonal skein with jitter, all seeded from the
 * event — so one crossing is four birds strung out low and the next is two high
 * and close, and neither is the arrangement you saw last time. A fixed
 * three-bird triangle is a logo; this is a flock.
 *
 * The three offsets in *time* matter as much as the ones in space: a flock
 * beating in unison is a decoration. Each bird is spaced by a fraction of the
 * wingbeat, so they ripple.
 */
function Birds({ scale, idle, random }: { scale: number; idle: Idle; random: () => number }) {
  const period = Number.parseFloat(String(idle.style?.animationDuration ?? "1.9s"));
  const base = Number.parseFloat(String(idle.style?.animationDelay ?? "0s"));

  const count = 2 + Math.floor(random() * 4);
  const flock = Array.from({ length: count }, () => {
    const along = random();
    return {
      // Strung out along a shallow diagonal — the skein a flock actually flies
      // in — with enough jitter that it never looks ruled.
      x: along * 150 + (random() - 0.5) * 26,
      y: along * -34 + (random() - 0.5) * 22,
      size: 0.62 + random() * 0.46,
    };
  });

  return (
    <g transform={`scale(${scale})`}>
      {flock.map((bird, i) => (
        <g
          key={`${bird.x.toFixed(1)}-${i}`}
          className={idle.className}
          style={{
            animationDuration: `${period.toFixed(2)}s`,
            animationDelay: `${(base - (i * period) / count).toFixed(2)}s`,
          }}
        >
          <Gull x={bird.x} y={bird.y} size={bird.size} />
        </g>
      ))}
    </g>
  );
}

function Dragonfly({ scale }: { scale: number }) {
  return (
    <path
      transform={`scale(${scale})`}
      fill={fill("fore")}
      d="M0 3 L14 3 L14 4 L0 4 Z M4 3 L9 -2 L10 -1 L5 4 Z M4 4 L9 9 L10 8 L5 3 Z"
      opacity={0.7}
    />
  );
}

/** A rising ring on the water where a fish took something off the surface. */
function FishRing({ progress, scale }: { progress: number; scale: number }) {
  return (
    <ellipse
      cx={0}
      cy={0}
      rx={6 + progress * 46 * scale}
      ry={(2 + progress * 12 * scale) * 0.32}
      fill="none"
      stroke="var(--sky-horizon)"
      strokeWidth={1.4}
      opacity={0.5}
    />
  );
}

/** Where each species belongs in the frame's depth, in viewBox units. */
const GROUND_Y: Record<Species, number> = {
  deer: BASE - 26,
  fox: BASE - 22,
  duck: BASE - 92,
  rabbit: BASE - 20,
  squirrel: BASE - 210,
  owl: BASE - 250,
  /**
   * High — above the hero card, not through it.
   *
   * This was 210, which is 23% of the frame, and the hero panel spans roughly
   * 12%–57% of the viewport. So the birds spent most of every crossing behind
   * an `oklch(0.99 0.004 90 / 0.88)` surface: painting correctly, occluded
   * correctly, and invisible. Proved by filling them scarlet and finding the
   * screenshot still came back pale pink, then reading the stack at their centre
   * with `elementsFromPoint`.
   *
   * At 70, with `flightOf`'s bounded envelope, they stay inside the top ~13% —
   * open sky on every viewport the hero has been checked at.
   */
  bird: 70,
  dragonfly: BASE - 150,
  fish: BASE - 96,
};

export function Wildlife({ events, width }: { events: WildlifeEvent[]; width: number }) {
  if (events.length === 0) return null;

  return (
    <svg
      viewBox={`0 0 ${width} 900`}
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden
      focusable="false"
    >
      {events.map((event) => {
        const pose = poseAt(event.species, event.progress, event.seed);
        const random = mulberry32(event.seed);
        const scale = 0.8 + random() * 0.5;
        // Seeded per appearance: gesture, individual period and phase. Two
        // animals of the same species never share a rhythm, let alone a frame.
        const idle = idleFor(event.species, random);
        const x = event.u * width + pose.x * (event.forward ? 1 : -1);
        // `pose.y` is only ever non-zero for the bird, whose flight path rises
        // and dips. Guarded like `pose.x` is: a NaN here would not error, it
        // would silently drop the whole group out of the SVG.
        const y = GROUND_Y[event.species] + (Number.isFinite(pose.y) ? pose.y : 0);

        return (
          /*
           * Position is a **CSS** transform with a one-second linear transition,
           * not a `transform` attribute.
           *
           * `useWorldClock` re-renders wildlife at 1Hz, which is right — which
           * events exist changes on the order of minutes, and re-rendering React
           * at 60fps to move a silhouette would be absurd. But a bird crosses
           * ~1900 units in 34 seconds, so a *static* transform recomputed once a
           * second teleports it ~56 units at a time. That is what read as
           * hopping. Interpolating between the 1Hz samples costs nothing and
           * runs on the compositor.
           *
           * `transformBox`/`transformOrigin` are load-bearing: CSS defaults an
           * SVG element's origin to the centre of its own bounding box, where
           * the `transform` attribute uses the viewBox origin. Without these two
           * the mirror flips each animal about its own middle and everything
           * lands somewhere else.
           *
           * A new appearance gets a new `key`, so nothing ever transitions from
           * an old event's position to a new one's.
           */
          <g
            key={`${event.species}-${event.seed}`}
            style={{
              transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scaleX(${
                event.forward ? 1 : -1
              })`,
              transformBox: "view-box",
              transformOrigin: "0 0",
              transition: "transform 1000ms linear, opacity 1000ms linear",
              opacity: pose.opacity,
            }}
          >
            {event.species === "deer" && <Deer lowered={pose.lowered} scale={scale} idle={idle} />}
            {event.species === "fox" && <Fox scale={scale} idle={idle} />}
            {event.species === "duck" && <Duck lowered={pose.lowered} scale={scale} idle={idle} />}
            {event.species === "rabbit" && <Rabbit scale={scale} idle={idle} />}
            {event.species === "squirrel" && <Squirrel scale={scale} idle={idle} />}
            {event.species === "owl" && <Owl scale={scale} idle={idle} />}
            {event.species === "bird" && (
              <Birds scale={scale * 0.95} idle={idle} random={random} />
            )}
            {event.species === "dragonfly" && <Dragonfly scale={scale} />}
            {event.species === "fish" && <FishRing progress={event.progress} scale={scale} />}
          </g>
        );
      })}
    </svg>
  );
}
