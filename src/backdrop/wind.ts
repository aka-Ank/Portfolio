/**
 * The wind, as one number.
 *
 * Everything that moves in the world reads this and multiplies it by its own
 * stiffness. That single shared source is what makes the motion read as
 * *weather* rather than as a set of unrelated loops: when a gust arrives the
 * reeds lean first and hardest, the grass follows, the canopy barely registers
 * it, and the trunks do not move at all — which is what a gust actually looks
 * like from a distance.
 *
 * **Not a keyframe.** The base sway loops stay in CSS, coprime and free; wind
 * modulates their *amplitude*. So gusts are real (an aperiodic function of the
 * world clock) without a single per-frame style write: `--sway` is updated a
 * few times a second and `@property` interpolates between the steps.
 */

/**
 * Gust strength at a moment, roughly 0.35–1.9.
 *
 * Three sines on coprime periods. Their sum never repeats within any plausible
 * visit, so the wind does not have a rhythm — and a wind with a rhythm is the
 * fastest way to make a world feel mechanical. The 61/89/149-second periods are
 * long on purpose: real gusts build and fall over tens of seconds, not beats.
 */
export function windAt(seconds: number): number {
  const t = Number.isFinite(seconds) ? seconds : 0;
  const gust =
    0.55 * Math.sin((2 * Math.PI * t) / 61) +
    0.3 * Math.sin((2 * Math.PI * t) / 89 + 1.7) +
    0.15 * Math.sin((2 * Math.PI * t) / 149 + 0.4);
  // Centred just above 1 so the resting state is a light breeze rather than
  // dead calm — a wood that is perfectly still reads as a photograph.
  return 1.05 + gust * 0.55;
}

/**
 * How much of the wind each kind of thing feels.
 *
 * This ordering is the whole point and it is worth stating plainly: a mature
 * trunk does not move, a canopy sways slowly, grass whips. Getting the
 * *relative* response right is most of what sells wind; getting the absolute
 * amplitude right only stops it looking silly.
 *
 * These are published as `--stiff` on each shape class in globals.css.
 */
export const STIFFNESS = {
  trunk: 0.12,
  canopy: 0.45,
  branch: 0.6,
  frond: 0.85,
  leaf: 1.0,
  grass: 1.15,
  flower: 1.3,
  reed: 1.5,
  water: 0.7,
} as const;

export type WindResponder = keyof typeof STIFFNESS;
