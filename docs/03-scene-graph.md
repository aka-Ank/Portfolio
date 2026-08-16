# Section Map

Eight sections, six moods, one continuous walk from dawn to deep night. Flat and shallow on
purpose: the previous structure nested seven chapters inside six biomes inside a journey, and the
nesting bought nothing a visitor could perceive.

The registry lives in [`src/content/sections.ts`](../src/content/sections.ts) and is the single
source of truth — the navigator, the scroll observer, the theme driver and `/classic`'s anchors
all read from it. Changing an order or a label means editing that file and nothing else.

## The map

| # | Section | Place (mood) | `timeOfDay` | Content |
|---|---|---|---|---|
| 1 | `hero` | Entrance Meadow | 0.04 | Name, identity line, the SDE/AIML split, two CTAs |
| 2 | `about` | Moss River Valley | 0.16 | Three paragraphs, three themes |
| 3 | `sde` | Ancient Grove | 0.30 | Hamro Vanshavali · Smart Hostel Management |
| 4 | `aiml` | Mechanical Jungle | 0.44 | AML Detection · Flood STGCN · Smart Traffic · House Price |
| 5 | `skills` | Mechanical Jungle | 0.56 | Four domain groups |
| 6 | `education` | Moonlit Observatory | 0.68 | PDEU · Multitech internship |
| 7 | `signals` | Moonlit Observatory | 0.82 | Certifications, writing, live GitHub/LeetCode |
| 8 | `contact` | Campfire Terminal | 0.94 | Email, links, résumé |

Two moods carry two beats each, so the palette drifts *within* a mood rather than resetting at
every boundary. `timeOfDay` is monotonic across all eight: the progression is felt, never labelled.

## Why this order

It is the order a reader wants: who, then the work, then the evidence, then how to reach him. The
projects sit third and fourth — early enough that a recruiter who reads two screens still sees
them, which is the single most important thing this site has to do.

Education and the internship come *after* the work rather than before it. Putting a student's
degree first invites the reader to weigh the credential instead of the projects.

## The moods

Each is three depth planes in `src/scenes/atmosphere/moods/`. All draw into the same 1440×900 box
and are cropped, never letterboxed — the horizon has to sit at a consistent height or a crossfade
between two sections reads as a jump cut.

**Entrance Meadow** — the widest, emptiest framing in the site. Rolling ridges, one lone tree on
the right third, grass along the lower edge. It establishes the floor for restraint; everything
after it is denser.

**Moss River Valley** — valley walls closing from both sides, leaving a channel down the middle.
The first appearance of the Aether, as the river's current: the only saturated thing in frame.

**Ancient Grove** — the SDE track. Entirely organic: curved trunks that are never parallel, a
canopy arch overhead, roots and fern fronds in the corners. No straight lines anywhere.

**Mechanical Jungle** — the AI/ML track, and the Grove's deliberate counterpart. The same forest
rebuilt from geometry: straight pylons on a regular rhythm, horizontal conduit bands, Aether nodes
pulsing at the junctions on offset delays (never in unison — that reads as a blinking UI).

**Moonlit Observatory** — the most open sky. A hand-placed star field (not random, so it is stable
between renders and reads as a sky rather than as noise), a ridge line, and a dome on the left
third with its slit lit from inside.

**Campfire Terminal** — the only mood that closes in rather than opening out. A ring of rounded
tree crowns seals the horizon, a pool of firelight breathes slowly, logs lie in a loose lean-to,
and embers rise. The last thing a visitor sees, and the site's one moment of real warmth.

## The SDE / AI-ML split

The two tracks must read as different chapters of one body of work — not two portfolios, and not
one undifferentiated list.

They share `ProjectCard`, and differ only in skin:

| | Ancient Grove (`organic`) | Mechanical Jungle (`instrumented`) |
|---|---|---|
| Corners | `rounded-2xl` | `rounded-md` |
| Title face | Instrument Serif | Instrument Sans, medium, tight |
| Metrics | inside, on expand | **on the closed card**, monospaced |
| Stack chips | pills | square-cornered |

The metric placement is the load-bearing difference. Grove projects are about structure — who may
see what, what happens when the ordinary path doesn't apply — so their numbers are a detail. Jungle
projects are about measurement, so the numbers are the headline. Where a project genuinely has no
published figure, the array is empty and nothing is drawn; no placeholder is invented.

## What is deliberately absent

- **No timeline.** Two real entries strung along a vertical rule inflates a short, honest record
  into a career narrative, and invites the reader to look for the gaps rather than at the work.
- **No skill ratings.** `proficiency` exists in the content layer but is never drawn as a bar. The
  resume states no self-ratings, so a filled meter would present a derived number as a measured
  one. The evidence sentence under each skill says what it was derived from instead.
- **No deep-dive route or modal.** A `<details>` disclosure on the card is enough, and it works
  before hydration.
