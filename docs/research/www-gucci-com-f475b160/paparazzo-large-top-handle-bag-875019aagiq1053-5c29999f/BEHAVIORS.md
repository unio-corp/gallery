# Behaviors — Gucci PDP Gallery (scope: gallery only)

> **Status.** This file records what the *live Gucci page* does, as measured. The shipped
> component intentionally diverges on one point: the full-width image slide now collapses
> via redistributed padding instead of a cropping frame, so catalogue images are never
> re-cropped. See "Deviation: three variants" in `components/gallery.spec.md`.

Measured at viewport 1440×757, dpr 2.

## Scope decision

User restricted the clone to **the gallery section only** (`.gallery-container_gallery__izDZW`).
Out of scope: header/nav drawer, below-the-fold product column, services strip, footer.

## 1. Carousel — INTERACTION MODEL: **click-driven, JS-animated transform**

Definitively established by A/B measurement, not inferred:

- `scroll-snap-type` on both track and viewport: **`none`** → not scroll-snap.
- `scrollLeft` on carousel, container and track stays **0** → not native scroll.
- Movement happens via an **inline style** written by JS on the track:
  `style="transform: translate3d(-2160px, 0px, 0px)"`.
- Computed `transition-duration` on the track is **`0s`** → the motion is **not** a CSS transition.
  It is animated frame-by-frame in JS (67 distinct values sampled over one transition).

### Track geometry

Track = `section.carousel_carousel-slides__qP47p`, `display:flex`, width 1440px (viewport-width, overflow hidden on ancestor).

| Slide | Content | flex | Width | Cumulative left |
|-------|---------|------|-------|-----------------|
| 0 | **video** (Brightcove) | `0 0 100%` | 1440 | 0 |
| 1 | image `…_015_…` (hero) | `0 0 100%` | 1440 | 1440 |
| 2 | image `…_002_…` | `0 0 50%` | 720 | 2880 |
| 3 | image `…_003_…` | `0 0 50%` | 720 | 3600 |
| 4 | image `…_006_…` | `0 0 50%` | 720 | 4320 |
| 5 | image `…_007_…` | `0 0 50%` | 720 | 5040 |
| 6 | image `…_008_…` | `0 0 50%` | 720 | 5760 |
| 7 | image `…_009_…` | `0 0 50%` | 720 | 6480 |
| 8 | image `…_010_…` | `0 0 50%` | 720 | 7200 |
| 9 | image `…_012_…` | `0 0 50%` | 720 | 7920 |

Total track width 8640px. All slide images use `object-fit: cover`.

### Offset rule (corrected — first extraction was wrong)

Measured translateX per active index:

| idx | translateX | active slide lands at |
|-----|-----------|-----------------------|
| 0 | 0 | left 0 |
| 1 | −1440 (−100%) | left 0 |
| 2 | −2160 (−150%) | **left 720** |
| 3 | −2880 (−200%) | left 720 |
| 4 | −3600 (−250%) | left 720 |

```
offset% = Σ(width% of slides before active) − (active slide is half-width ? 50 : 0)
```

Two things combine:

1. Widths are mixed (2×1440 then 8×720), so a fixed `index * slideWidth` is wrong.
2. **A half-width slide docks to the right column, not the left edge.** That trailing −50%
   is what leaves the outgoing hero's *right half* filling the left column — which reads
   as the hero shrinking to half width as it slides away, and is what produces the paired
   two-column composition. A plain cumulative sum puts slide 2 flush left and the effect
   never appears.

Consistency check: idx9 → 500% → 7200px, exactly `trackWidth (8640) − viewport (1440)`,
so the last slide closes flush against the right edge.

**Slide boxes do NOT resize.** Sampled every frame across the 1→2 transition: the first three
slide elements stay `1440/1440/720` throughout.

### The second animation: the inner frame (found after user feedback)

The slide *element* keeps its width, but each slide contains an **inner frame** that does resize.
Measured on the live page at idx0:

```
s0 (video, active) { width: 1440px, margin-left:   0px }
s1 (hero, idle)    { width:  720px, margin-left: 720px }   ← half width, pushed right
s2 (still)         { width:  720px, margin-left:   0px }
```

and that inner frame carries **`transition: width 0.6s ease`** — a second, faster animation
running alongside the track's 1.2s translation.

Rule:

| slide kind | state | inner width | margin-left |
|------------|-------|-------------|-------------|
| full-width (0, 1) | **active** | 100% | 0 |
| full-width (0, 1) | idle | 50% | 50% |
| half-width (2–9) | any | 100% | 0 |

**Why it matters.** At idx2 the track sits at −2160, so slide 1's box spans −720…720. Its inner
frame (`margin-left: 720`) therefore lands at **left 0, width 720** — the left column. The image
inside is 1440×720 in a 720×720 frame with `object-fit: cover`, so it is re-cropped **around its
centre, dropping 360px (25%) from each side**.

Without this, the hero would simply be sliced in half and the left column would show only its
right-hand portion, off-centre. Verified: original and clone now both put the bag centred and
whole in the left column — see `ORIGINAL-desktop-1440-slide2-twocolumn.jpg` vs
`CLONE-desktop-1440-slide2-twocolumn.jpg`.

Caveat: `transition-property` on the original resolves to `width` alone, so `margin-left` appears
to snap. The clone transitions both over 600ms, which reads more cleanly; revisit if a frame-level
comparison of that specific moment is ever needed.

### Measurement pitfall (worth remembering)

CSS transitions do not advance while `document.hidden === true`. Reading `getComputedStyle().transform`
on the clone from a background tab returned identity no matter what the inline style said, which
looked exactly like a broken transform. Always check `document.hidden` before trusting animated
computed values.

### Transition profile (measured)

- Slide 0 → 1: `0 → -1440px`
- Slide 1 → 2: `-1440 → -2160px`
- Duration: ~**1200ms** (last value change sampled at 1358ms including rAF tail)
- Easing: strongly front-loaded ease-out; matches **`cubic-bezier(0.5, 0, 0, 1)`** — the same curve
  declared on the thumbnail strip's own `transition`, so it is the component's shared easing token.
- Sampled progress: 19px @33ms, 486px/720 (67%) @225ms → confirms the front-loaded curve.

**Implementation approach for the clone:** a CSS transition
`transform 1.2s cubic-bezier(0.5,0,0,1)` on the track reproduces this faithfully and is
simpler than replicating the original's rAF loop. Compositor-friendly (transform only).

## 2. Thumbnail strip

- Container: `ul.thumbnails_thumbnails-cont…`, `display:flex`, `gap: 2px`, `overflow: hidden`,
  `max-width: 300px`, `transition: max-width 1.2s cubic-bezier(0.5, 0, 0, 1)`.
- 7 `li` rendered for 10 slides; a **"+4" counter** chip covers the overflow (visible in screenshot).
- **Active state = width only**: active thumb `28×28`, inactive `24×28`.
  No opacity change, no border, no outline — verified across two different active indices.
- Thumb images: `object-fit: cover`, sourced from the 64×64 / 64×32 crops.
- Clicking the arrows moves the active index; the active thumb widens to 28px.

## 3. Arrows

- Wrapper `.thumbnail-arrows…`: `display:flex`, `gap: 2px`, `50×24`.
- Two buttons, each `24×24`, `border-radius: 50%`, transparent background, `cursor: pointer`.
- **Visual order is reversed vs DOM order**: in the DOM arrows precede the thumbnails, but on
  screen thumbnails sit at x=1130 and arrows at x=1326. Reproduce with flex `order`/`row-reverse`.

## 4. Overlay chrome (`.gallery-overlay…container`)

- Overlay: `position: absolute`, covers the full 1440×720 gallery.
- Inner bar: **`position: sticky`**, top offset 608px, height 112px, full width.
- Controls row: y=648, height 32px, horizontal inset **64px** (width 1312px);
  bottom gap = 720 − 648 − 32 = **40px**.
- Three groups on one row:
  - **left** — "Visualizza in 3D" pill at x=64, `126.58×32`
  - **center** — product summary card, `position:absolute`, x=588, `264×32` (optically centred)
  - **right** — carousel widget, x=1130, `246×32` (thumbs 188 + gap 8 + arrows 50)

## 5. Media

- Slide 0 hosts a `<video>` served from `fastly-signed-eu-west-1-prod.brightcovecdn.com`
  (Brightcove account `2924921183001`). Signed URL → **not durably downloadable**; the clone
  needs either a re-hosted copy or the poster frame as a fallback.
- Carousel base background while media loads: `rgb(231, 231, 231)`.

## 6. Hover / focus (read from the CSSOM, 13,546 rules scanned)

- Thumbnail `:hover` and `:focus` resolve to the **same rule as the active state**: `width: 28px`.
- `…:not(:focus-visible) { outline: 0 }` — outline only for keyboard focus.
- The `transform: scaleX(0.64)` "arrow leg" hover found in the design system belongs to a
  *different* arrow icon family (`_arrow-left_`, `_arrow-right_` with a separate leg path).
  The gallery's own arrows are plain 16×16 chevrons with no leg — **do not** apply that effect here.

## 7. Video (slide 0)

`autoplay`, `loop`, `muted`, `playsInline`, `controls: false`, intrinsic 1440×720, `object-fit: cover`.

## 8. Drag / swipe

`touch-action: pan-y` on the carousel container → vertical scrolling passes through, horizontal
drag is captured for slide changes.

## 9. Responsive (measured at 500px — Chrome clamps window width to a 500px minimum)

| Property | Desktop 1440 | Mobile 500 |
|----------|--------------|------------|
| gallery box | 1440×720 (2:1) | 500×667 (~3:4) |
| slide flex | `100%` ×2, then `50%` ×8 | **`100%` for all 10** |
| chrome bar | top 608, height 112 | top 571, height 96 |
| chrome inset | 64px | 16px |
| 3D pill | visible, 127×32 | visible, 127×32 |
| product card | visible, 264×32 | **hidden (0×0)** |
| widget | 246×32 (thumbs + chip + arrows) | 71×32 (`1 / 10` counter + active thumb) |
| slide counter | visually hidden | **visible** |

Breakpoint sits at ~768px.

## Font substitution (clone decision)

Original: proprietary **Gucci Sans Pro** (4 self-hosted woff2 weights).
Clone: **Inter** via `next/font/google`, per user instruction — the downloaded woff2 files were
deleted and are no longer fetched by the download script. All measured metrics
(12px/16px, ls -0.36px; 9.008px, ls -0.27024px) are preserved unchanged.
