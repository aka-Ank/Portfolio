# Asset List

## License notes (read before sourcing anything)

| Source | License model | Rule for this project |
|---|---|---|
| **Poly Haven** | Everything CC0 | Free to use/modify/redistribute, no attribution required. Preferred source for HDRIs, PBR textures. |
| **Kenney** | Everything CC0 (kenney.nl assets) | Same as above. Preferred source for base low-poly geometry to customize. |
| **Sketchfab** | Per-model — ranges from CC0 to CC-BY to fully rights-reserved | **Filter to CC0 or CC-BY only** at download time. If CC-BY, log the required attribution string in `ENGINEER_NOTES.md` and surface it in a `/credits` route. Never use a Sketchfab model without checking its individual license page. |
| **Google Fonts** | SIL Open Font License (OFL) | Free, self-hostable via `next/font/google`, no attribution required (credit appreciated, not mandatory). |
| **Lucide** | ISC | Free, no attribution required. |
| **LottieFiles** | Per-animation — "Free" tier files are typically free-with-attribution or CC0, but check each one individually before use | Prefer recreating simple motifs as native GSAP/SVG animation instead — see note below. |
| **SVG Repo** | Mixed per-icon (CC0, PD, and some "free for personal use only") | Filter to CC0/PD license tag only; skip anything marked personal-use-only. |

**Note on Lottie:** given the brief's "no generic ... flying components" rule and the fact that
most free Lottie files read as generic stock animation, the default for this project is to build
UI motion natively (GSAP/Motion/SVG) rather than import Lottie files. LottieFiles stays listed as
a source only for the rare case of a genuinely bespoke, license-clear animation (e.g. a loading
glyph) — not a default tool.

## 3D models

| Asset | Scene | Source plan | License |
|---|---|---|---|
| Base tree/foliage kit (trunks, canopy cards, undergrowth) | Entrance, Clearing, River, Sanctuary | Kenney "Nature Kit" as geometry base, re-textured/re-shaded in-house to match the palette in `01-design-specification.md` | CC0 |
| Rocks, terrain scatter | all outdoor scenes | Kenney "Nature Kit" / Poly Haven models | CC0 |
| Sanctuary creature base meshes (one low-poly animal per skill domain — e.g. fox, owl, deer, fish, hare) | Sanctuary | Sketchfab, filtered to CC0/CC-BY, re-rigged/re-shaded with custom Aether-marking materials and idle/patrol animation authored in-house | CC0/CC-BY (per-model, logged individually) |
| Lab chamber architecture (consoles, structural pieces) | Lab | Custom-modeled (procedural/primitive-composed in Blender or directly as R3F geometry) — no natural-fit CC0 source exists for "nature-grown machinery," this is bespoke | Original |
| Observatory structure | Observatory | Custom-modeled, same reasoning as Lab | Original |
| Campfire, log seating, embers | Campfire | Kenney base props + custom particle/shader work for fire and embers | CC0 |

All models pass through Draco compression before entering `public/models/` — see
[00-research-and-stack.md](./00-research-and-stack.md) §2 and the Phase 5 optimization pass.

## Textures

| Asset | Use | Source | License |
|---|---|---|---|
| Bark, moss, forest-floor PBR sets | foliage/ground materials, all outdoor scenes | Poly Haven | CC0 |
| Stone/concrete PBR sets | Lab, Observatory structure | Poly Haven | CC0 |
| Water normal/flow maps | River | Poly Haven | CC0 |
| Sky — procedural, no texture asset | all scenes | three.js `Sky.js` (shader, not a texture) | BSD (three.js license) |
| Supporting HDRI (ambient specular only, one per approx. time-of-day cluster) | all scenes | Poly Haven | CC0 |

All textures converted to KTX2/Basis at build time — see Phase 5 optimization pass.

## Audio

| Asset | Use | Source plan | License |
|---|---|---|---|
| Wind / canopy ambience loop | Entrance, Clearing | Freesound.org, filtered to CC0, or custom-recorded/synthesized | CC0 |
| Water current loop | River | Freesound.org (CC0) | CC0 |
| Sanctuary ambience (birdsong, undergrowth) | Sanctuary | Freesound.org (CC0) | CC0 |
| Lab hum / mechanical ambience | Lab | Synthesized in-house (simple layered tone, avoids stock "sci-fi hum" cliché) | Original |
| Night ambience (crickets, distant owl) | Observatory | Freesound.org (CC0) | CC0 |
| Fire crackle loop | Campfire | Freesound.org (CC0) | CC0 |
| UI confirmation / hover SFX (small set, reused across chrome) | global | Synthesized in-house (short, soft, non-generic — explicitly not a stock "UI click pack") | Original |

All loops mixed to consistent LUFS loudness before import; see
[06-animation-bible.md](./06-animation-bible.md) for crossfade behavior between scenes.

## Fonts

| Family | Role | Source | License |
|---|---|---|---|
| Instrument Serif | Display/headline | Google Fonts | OFL |
| Instrument Sans | Body/UI | Google Fonts | OFL |
| JetBrains Mono | Data/metrics accents (Lab, Observatory, Campfire data) | Google Fonts | OFL |

Loaded via `next/font/google` (self-hosted at build time, zero third-party request, zero layout
shift) — see [02-architecture.md](./02-architecture.md) `app/layout.tsx`.

## Icons

| Set | Use | License |
|---|---|---|
| **Lucide** | primary icon set — nav, chrome, classic-mode UI | ISC |
| **SVG Repo** (CC0/PD filtered only) | rare bespoke glyphs Lucide doesn't cover | CC0/PD (per-icon, logged individually) |

## Attribution ledger

Any CC-BY Sketchfab model or SVG Repo icon actually used gets logged with source URL, author, and
required attribution string in `ENGINEER_NOTES.md` as it's added, and surfaced collectively on a
`/credits` route before launch (Phase 5). No CC-BY asset ships without its attribution recorded
at the moment it's added — not reconstructed after the fact.
