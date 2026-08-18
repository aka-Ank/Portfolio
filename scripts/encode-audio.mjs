/**
 * Derives `public/audio/*.m4a` from the untouched originals in `tracks/`.
 *
 * The originals are 256 kbps stereo MP3 — about 21MB for ten files, which is
 * roughly four times the *entire rest of the site*. Nothing here is music: it is
 * broadband ambience (rain, wind, insects) plus two short animal calls, played
 * under a page at 0.24–0.5 gain. AAC-LC at 64 kbps is transparent for that and
 * lands the set near 5.5MB.
 *
 * ## Why re-encode rather than trim
 *
 * These are loops, and every one is already a sensible loop length (15s–194s).
 * Cutting them shorter would mean choosing new loop points, and an audible seam
 * every 30 seconds is a far worse defect than a large file.
 *
 * ## Why `.m4a` and not a smaller `.mp3`
 *
 * macOS ships `afconvert`, which writes AAC and cannot write MP3. AAC-LC is also
 * simply a better codec at this bitrate — an MP3 that sounded as good would be
 * closer to 96 kbps. Howler probes `m4a` natively and every current browser
 * decodes AAC-LC in MP4, so there is no fallback source to maintain.
 *
 * ## What this script will not do
 *
 * Rename anything. Output basenames match their source exactly, space and all:
 * `night .mp3` becomes `night .m4a`, because that file may be referenced by name
 * somewhere outside this repo. `tracks/` is never written to.
 *
 *   npm run audio:encode
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const SRC_DIR = 'tracks';
const OUT_DIR = path.join('public', 'audio');

/**
 * 64 kbps stereo, VBR-constrained (`-s 2`).
 *
 * True VBR (`-s 3`) ignores `-b` entirely and encodes at ~136 kbps, which is
 * how the first attempt at this produced three "different" bitrates that were
 * byte-identical. Constrained VBR honours the target while still spending fewer
 * bits on the quiet passages.
 */
const CODEC = 'aac';
const BITRATE = 64000;
const CHANNELS = 2;

function requireAfconvert() {
  try {
    execFileSync('afconvert', ['-h'], { stdio: 'ignore' });
  } catch (err) {
    // `afconvert -h` prints usage and exits non-zero, so only a missing binary
    // counts as absent. Treating any failure as "not found" is what made the
    // first version of this check report a false negative on a Mac that had it.
    if (err.code !== 'ENOENT') return;
    console.error(
      'afconvert not found. It ships with macOS; on another platform use:\n' +
        `  ffmpeg -i "in.mp3" -c:a aac -b:a ${BITRATE / 1000}k -ac ${CHANNELS} "out.m4a"`,
    );
    process.exit(1);
  }
}

requireAfconvert();
mkdirSync(OUT_DIR, { recursive: true });

const sources = readdirSync(SRC_DIR).filter((f) => f.endsWith('.mp3'));
if (sources.length === 0) {
  console.error(`No .mp3 files in ${SRC_DIR}/. Nothing to encode.`);
  process.exit(1);
}

let before = 0;
let after = 0;

for (const name of sources) {
  const from = path.join(SRC_DIR, name);
  const to = path.join(OUT_DIR, name.replace(/\.mp3$/, '.m4a'));

  execFileSync('afconvert', [
    '-f', 'm4af',
    '-d', `${CODEC}@44100`,
    '-c', String(CHANNELS),
    '-b', String(BITRATE),
    '-s', '2',
    from,
    to,
  ]);

  const wasSize = statSync(from).size;
  const isSize = statSync(to).size;
  before += wasSize;
  after += isSize;

  const kb = (n) => `${Math.round(n / 1024)}`.padStart(5);
  console.log(`${name.padEnd(40)} ${kb(wasSize)}KB → ${kb(isSize)}KB`);
}

const mb = (n) => (n / 1024 / 1024).toFixed(1);
console.log(
  `\n${sources.length} files: ${mb(before)}MB → ${mb(after)}MB ` +
    `(${(before / after).toFixed(1)}× smaller)`,
);
