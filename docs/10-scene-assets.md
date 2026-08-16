# 10 — Forest scene asset manifest

What to hand an illustrator, and how to install what comes back.

## The one thing to understand first

**Do not supply five coloured versions of each layer.** The obvious brief —
"paint the forest at dawn, morning, afternoon, dusk and night" — produces five plates per layer
across two colour modes, which is ~50 files, several megabytes, and a Lighthouse score in the
seventies. It also freezes the art: a baked plate cannot follow the palette, so the time-of-day
system would stop being a continuous drift and become a slideshow of stills.

Instead, each layer is supplied **once, as a transparent alpha silhouette**. The image contributes
only *shape*. Colour comes from that layer's palette token at runtime, so one file automatically
serves all five times of day, both colour modes, and every position in between.

That is what `Layer`'s `plate` prop does — it uses the image as a CSS `mask-image` over a div
filled with `var(--layer-…)`.

## Files to deliver

Drop them in `public/scene/`. Five files, total budget **under 400KB**.

| File | Layer | Palette token | Where its shape sits |
|---|---|---|---|
| `ridge.webp` | `far` | `--layer-far` | A low, soft ridge. Crest around 62–68% down the frame. |
| `treeline.webp` | `mid` | `--layer-mid` | Distant forest as a *texture*, not drawn trees. Crest 68–74%. |
| `canopy.webp` | `near` | `--layer-near` | Three separable crown masses. Crest 72–80%. |
| `foreground.webp` | `fore` | `--layer-fore` | Fronds and framing trunks along the bottom and side edges. |
| `animals.webp` | `fore` | `--layer-fore` | Optional. Deer, owl, birds — see the note below. |

**Specification for every file:**

- **2560 × 1440**, PNG or WebP, **transparent alpha**.
- **The top ~55% must be fully transparent.** That region is open sky and is where the hero card
  and every section heading sit.
- **Alpha only.** Any colour in the file is discarded — the mask reads the alpha channel.
  Deliver black-on-transparent; a coloured plate will look identical once installed.
- **No internal shading, no gradients within a layer, no outlines.** Each plane renders as one
  flat colour by design. Depth comes from the *relationship* between planes, not from modelling
  inside one. A plate painted with internal light will lose all of it and may read as a blob.
- **Silhouette detail is welcome** — fine branch edges, frond serration, individual needles at the
  crown. That is exactly what the mask preserves and what hand-authored SVG does worst.
- Composed for **`mask-size: cover`, `mask-position: bottom center`**: the bottom edge is
  guaranteed visible, the sides get cropped on narrow viewports. Keep nothing essential in the
  outer 12% horizontally.

## Installing them

One line per layer in `src/backdrop/Backdrop.tsx` — replace the SVG child with a `plate`:

```tsx
// before — hand-authored silhouette
<Layer depth="mid"><FarTreeline /></Layer>

// after — supplied plate
<Layer depth="mid" plate="/scene/treeline.webp" />
```

Nothing else changes. Parallax, the sway loops, weather, time-of-day tinting and the contrast
audit all live on the slot, not on the artwork.

## Animals

The animals are the one place where authored SVG is genuinely better than a plate, because their
motion is *articulated* — the deer's head rotates about the shoulder and its ear about the skull,
on two independent loops. A flat plate can only translate or rotate as a whole.

Recommendation: keep the SVG animals and supply plates for the four landscape layers. If you do
want illustrated animals, supply each as its own file with the hinge point noted, and they lose
the articulated idle in exchange for better drawing.

## If you must have full-colour plates

`Layer` also accepts `image` instead of `plate`, which renders the file as a normal background
image. Use it only for a layer whose internal shading genuinely matters. Understand the trade:
that layer stops following the palette, so it needs one file per time of day, it will visibly
disagree with the layers around it as the light changes, and it is excluded from the automatic
recolouring that makes light and dark mode work.

## Art direction constraints (non-negotiable)

These come from the failure of the previous illustrated backdrop, which put recognisable tree
trunks directly behind project cards at text-level contrast:

- The scene's detail begins below `SCENE_HORIZON` (66% of the frame). Above that is open sky.
- Planes are ordered by aerial perspective — `far` closest to the sky, `fore` furthest from it.
  Never invert that; it reads as a cut-out pasted over the sky.
- No layer may be so dark that a panel over it fails contrast. `contrast-audit.test.ts` samples
  every plane colour at eleven points around both families' rings and will fail the build.
- No recognisable object should read as *behind text*. Silhouettes belong under the content, not
  in it.
