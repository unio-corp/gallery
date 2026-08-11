# Gallery Specification

## Overview

- **Target files:** `src/components/gallery/` (moved out of the per-clone namespace once
  the component stopped being a Gucci clone and became the shop's own gallery)
  - `GallerySection.tsx` — owner of `activeIndex`, composes the rest
  - `CarouselTrack.tsx` — slides + transform
  - `GalleryOverlay.tsx` — sticky chrome bar, three groups
  - `View3DPill.tsx`
  - `ProductSummaryCard.tsx`
  - `CarouselWidget.tsx` — thumbnails + counter chip + arrows
  - `slides.ts` — slide data
- **Screenshots:** `docs/design-references/www-gucci-com-f475b160/paparazzo-large-top-handle-bag-875019aagiq1053-5c29999f/gallery-{desktop-1440,mobile-500}-slide0-video.jpg`
- **INTERACTION MODEL: click-driven** (arrows + thumbnails), transform-animated. Verified by A/B measurement — see `../BEHAVIORS.md`. Not scroll-driven, not scroll-snap.

## DOM Structure

```
section.gallery                       position: relative; 1440x720
├── div.carousel-viewport             overflow: hidden; background #E7E7E7
│   └── div.carousel-track            display: flex; transform: translate3d(-Xpx,0,0)
│       └── article.slide × 10        flex: 0 0 100% (i≤1) | 0 0 50% (i≥2)
│           └── video | img           object-fit: cover; 100% × 100%
└── div.overlay                       position: absolute; inset 0; pointer-events: none
    └── div.chrome-bar                position: sticky; height 112px; top offset 608px
        └── div.chrome-row            height 32px; inset 64px (16px mobile)
            ├── View3DPill            left,   126.58 × 32
            ├── ProductSummaryCard    centre, absolute, 264 × 32
            └── CarouselWidget        right,  246 × 32
```

Interactive children need `pointer-events: auto` since the overlay disables them.

## Computed Styles (exact, from getComputedStyle)

### Carousel viewport / track
- `overflow: hidden`
- viewport background: `rgb(231, 231, 231)`
- track: `display: flex`, no gap
- track transform: `translate3d(-offset%, 0, 0)` where

  ```
  offset% = Σ(width% before active) − (active is half-width ? 50 : 0)
  ```

  Measured: idx0 → 0, idx1 → −100%, idx2 → −150%, idx3 → −200%, idx4 → −250%.
  Half-width slides dock to the **right column**; the outgoing hero's right half fills
  the left column, producing the two-column pairing. Widths never animate.
- **Clone transition:** `transform 1200ms cubic-bezier(0.5, 0, 0, 1)`
  (original animates in JS with the same profile; a CSS transition reproduces it and stays on the compositor)

### Slides
| index | media | flex | desktop width |
|-------|-------|------|---------------|
| 0 | video | `0 0 100%` | 1440 |
| 1 | image 015 | `0 0 100%` | 1440 |
| 2–9 | images 002,003,006,007,008,009,010,012 | `0 0 50%` | 720 |

- All media: `object-fit: cover`, fill the **inner frame** (see below).
- Video attributes: `autoplay loop muted playsInline`, no controls.

### Inner frame (second animation)

> **Superseded for the shipped component.** What follows describes the *original site's*
> mechanism, kept as the reference measurement. The component now implements the
> variant model below instead — see "Deviation: three variants".

Each slide wraps its media in a frame that resizes independently of the slide box:

| slide kind | state | width | margin-left |
|------------|-------|-------|-------------|
| full-width (0, 1) | **active** | 100% | 0 |
| full-width (0, 1) | idle | 50% | 50% |
| half-width (2–9) | any | 100% | 0 |

- `overflow: hidden`, `transition: width 0.6s ease`
- A full-width slide going idle collapses into the **right half of its own box**;
  combined with the track offset this places it in the left column, and `object-fit: cover`
  re-crops the 1440-wide image around its centre — **25% dropped from each side**.

## Deviation: three variants (intentional, product requirement)

The destination is an e-commerce catalogue where every product image shares the same
dimensions and must **never** be re-cropped, and where the full-width image slide is an
editorial opener whose side gutters will later hold copy. The crop-based mechanism above
is therefore wrong for this use; it is replaced by a padding-based one.

`SlideVariant` in `slides.ts`:

| variant | box width | content when active | content when idle | animates |
|---------|-----------|---------------------|-------------------|----------|
| `video-full` | 100% | 100% | 100% (unchanged) | no |
| `image-full` | 100% | `pl 25% / img 50% / pr 25%` | `pl 50% / img 50% / pr 0` | padding, 600ms ease |
| `image-half` | 50% (100% mobile) | 100% | 100% | no |

**The collapse is asymmetric on purpose.** With the slide box fixed at 100%, zeroing *both*
paddings would leave the image in the **left** half of its box, which at a −150% track
offset falls off-screen. It must occupy the **right** half. So `padding-right` collapses to 0
(this is what frees room for the incoming slide) while `padding-left` doubles to 50% (this is
what carries the image into position).

**Key property:** the image renders at the *same width in both states* — measured 720px
active (`360…1080`) and 720px idle (`0…720`) at a 1440 viewport. No rescale, no crop.
Contrast with the original, where the same image is cropped from 1440 down to 720.

Slide boxes never resize, so the track keeps a constant width and `trackOffset()` needs no
compensation. Verified offsets are unchanged: 0, −100%, −150%, −200%, −250%, and idx9 lands
at exactly `trackWidth − viewport`.

Below 768px all boxes are 100% and all paddings are 0.

### Height is auto — no cropping anywhere

The gallery no longer declares an aspect ratio and no media uses `object-fit: cover`.
Each `img`/`video` renders `w-full h-auto`, so it keeps its natural proportions and the
gallery sizes itself around the content. The flex track uses `items-start` so a shorter
slide is not stretched to match the tallest.

Consequences worth knowing:

- Swapping in a catalogue with different image proportions needs **no code change**.
- With portrait stills (the current set is 2000×2800, 5:7) two desktop columns naturally
  produce a 10:7 gallery — derived, not hardcoded.
- The video is 1440×720 (2:1) and is therefore **shorter than the stills**. While it is the
  active slide the area below it shows the carousel base colour. Nothing crops the video,
  which was the explicit requirement; if that gap is unwanted the options are a video with
  matching proportions, or letting the gallery height follow the active slide (which
  reintroduces layout shift).
- Carousel base colour is `#f5f5f5`, set on `--gucci-carousel-base` in `globals.css`.

### Interaction: native scroller, not a transform carousel

The gallery must answer to horizontal scrolling, tap and click-and-drag — not just arrows.
Two ways to get there:

1. Keep the `transform` track and hand-roll drag, momentum, rubber-banding and touch.
2. Make the track a **native horizontal scroller** and add only mouse drag on top.

Option 2 shipped. Native scrolling brings trackpad and wheel gestures, touch swiping with
platform momentum, keyboard arrows, focus and assistive-technology semantics for free; the
hand-rolled route reimplements all of it, worse.

The migration is lossless because **`scroll-snap-align: end` reproduces `trackOffset` exactly**.
Measured resting positions at a 2078px gallery: `0, 2078, 3117, 4156, 5195` — i.e. 0, 100%,
150%, 200%, 250%, the same sequence validated against the live reference.

Reference check: Moncler's PDP was inspected as a comparison. It uses the transform approach
(`overflow-x: hidden`, `scroll-snap-type: none`, `touch-action: pan-y pinch-zoom`) and, tested
directly, **does not respond to horizontal wheel input** and is not keyboard navigable. It
covers drag and arrows; this covers drag, arrows, wheel, keyboard and momentum.

Implementation lives in `src/components/gallery/useGalleryScroller.ts`:

- `activeIndex` is derived from `scrollLeft` (nearest resting position), so every input path —
  scroll, drag, arrows, thumbnails, keyboard — converges on one source of truth.
- Mouse drag maps pointer travel 1:1 onto `scrollLeft`, with snapping suspended mid-gesture
  (`scroll-snap-type: none`) and restored on release, then settling on the nearest slide.
- A gesture counts as a drag past 5px of travel; below that it is a click, which scrolls to
  the clicked slide. `moved` resets on every `pointerdown` regardless of pointer type —
  without that, a tap following a mouse drag on a hybrid device would be swallowed.
- `goTo` suppresses scroll-derived index updates while animating, so intermediate positions
  cannot override the user's choice.
- `prefers-reduced-motion` switches programmatic scrolling to `behavior: "auto"`.

The scrollbar is hidden (`.gallery-scroller` in `globals.css`): the thumbnail strip already
reports position, and a scrollbar under the media reads as a browser artefact. Focus remains
visible via `:focus-visible`.

### Video proportions are derived, not chosen

Row height comes from the stills, and a `video-full` slide spans the whole width. So the
video's required aspect ratio follows from the stills' ratio and the column count:

| breakpoint | column width | row height | video spans | **required video ratio** |
|---|---|---|---|---|
| desktop (paired) | W/2 | (W/2)·(7/5) = 0.7W | W | **10:7** (e.g. 2000×1400) |
| mobile | W | W·(7/5) = 1.4W | W | **5:7** (e.g. 2000×2800) |

Hence the two files: `src` (landscape, desktop) and `srcMobile` (portrait). `slideSource()`
in `slides.ts` picks between them; `srcMobile` falls back to `src` when absent.

If the catalogue's own ratio ever changes, recompute from the same rule — desktop video ratio
is always *twice* the still's width-to-height ratio, mobile video ratio equals it.

**The layout does not depend on getting this right.** The `<video>` is absolutely positioned
inside its slide, so it never contributes to row height; a mismatched file is merely covered.
Before this, a portrait video at full desktop width forced the row to twice the stills' height
(2916px instead of 1455px), which is what made the gallery look broken.

### Current test deck

`public/products/rectangular-sunglasses-milky-brown/` — 8 slides:
video (`slide-00.mp4`, reused unchanged), `slide-01` as the `image-full` opener, then
`slide-02…07` as `image-half` catalogue stills. Thumbnails are 128px-wide derivatives.

Logic is covered by `scripts/verify-slide-variants.mts`
(`node --experimental-strip-types scripts/verify-slide-variants.mts`), which asserts the
fraction table, the padding table and the offset sequence — including the mobile branch,
which the browser could not be resized to reach.

### View3DPill (button)
- box: `126.58 × 32` → use `height: 32px`, `padding: 0 8px`, natural width
- `font-size: 12px; line-height: 16px; font-weight: 500; letter-spacing: -0.36px`
- `color: rgb(0,0,0)`; `background: rgb(255,255,255)`
- `border: 1px solid rgba(0,0,0,0.15)`; `border-radius: 2px`
- `backdrop-filter: blur(15px)`; `display: flex; align-items: center`
- `cursor: pointer`
- icon: `View3DIcon`, 16×17, sits before the label
- label: `Visualizza in 3D`

### ProductSummaryCard
- box: `264 × 32`, `position: absolute` horizontally centred within the row
- `background: rgba(68, 73, 78, 0.4)`; `backdrop-filter: blur(15px)`
- `border-radius: 4px`; `padding: 4px 4px 4px 8px`
- `display: flex; align-items: center; justify-content: space-between`
- `color: rgb(255,255,255)`
- inner text row: `228 × 16`, `display: flex; justify-content: space-between`,
  `font-size: 12px; line-height: 16px; letter-spacing: -0.36px; font-weight: 400`
- trailing circular bag button, `BagIcon` 16×16
- **Hidden below 768px** (measured 0×0 at 500px viewport)

### CarouselWidget
- wrapper: `display: flex; align-items: center; gap: 8px`, height 32
- **visual order: thumbnails, then arrows** (DOM order in the original is reversed — reproduce visual order directly)
- thumbnails `ul`: `display: flex; gap: 2px; overflow: hidden; max-width: 300px`,
  `transition: max-width 1200ms cubic-bezier(0.5, 0, 0, 1)`
- 7 slots rendered: **6 thumbnails + 1 counter chip**
- thumbnail `li`: `24 × 28`, image `object-fit: cover`, `outline: 0` unless `:focus-visible`
- **active / hover / focus thumbnail: `width: 28px`** — that is the *only* difference.
  No opacity, border or outline change.
- thumbnail 0 (video) additionally shows `PlayPauseIcon` 12×12 overlaid
- counter chip: `24 × 28`, text `+ 4`, `font-size: 9.008px; font-weight: 500; letter-spacing: -0.27024px`,
  `color: #fff`, `background: rgba(68,73,78,0.4)`, `border-radius: 2px`
- arrows wrapper: `display: flex; gap: 2px`, `50 × 24`
- arrow button: `24 × 24`, `border-radius: 50%`, transparent background, `cursor: pointer`,
  icons `ChevronLeftIcon` / `ChevronRightIcon` 16×16, stroke 1.5, white on the dark hero

### Accessibility affordance present in the original
- A visually-hidden `<span>` reading `N / 10` tracks the active slide.
  On mobile this same counter becomes **visible** inside the widget.

## States & Behaviors

### Slide navigation
- **Trigger:** click on next/prev arrow, or click on a thumbnail
- **State A → B:** `translate3d` offset changes to the cumulative width of preceding slides
- **Transition:** `transform 1200ms cubic-bezier(0.5, 0, 0, 1)`
- Bounds: prev disabled at index 0, next disabled at index 9 (no wraparound observed)

### Thumbnail hover / focus
- `width: 24px → 28px`; same easing token. No other property changes.

### Swipe
- `touch-action: pan-y` on the carousel container → horizontal drag is intercepted for slide changes.

## Assets (local)

```
public/sites/www-gucci-com-f475b160/paparazzo-large-top-handle-bag-875019aagiq1053-5c29999f/
├── video/slide-00.mp4
└── images/
    ├── slide-015.jpg  (2400×1200 crop, hero)
    ├── slide-{002,003,006,007,008,009,010,012}.jpg  (1200×1200 crops)
    └── thumb-{015,002,003,006,007,008,009,010,012}.jpg  (64×32 / 64×64 crops)
```

Icons from `src/components/gallery/icons.tsx`:
`View3DIcon`, `BagIcon`, `ChevronLeftIcon`, `ChevronRightIcon`, `PlayPauseIcon`.

## Text Content

Short factual UI strings only:
- `Visualizza in 3D`
- product name and price as shown in the sticky card
- `+ 4`, `N / 10`

## Responsive Behavior

| Viewport | Behaviour |
|----------|-----------|
| **Desktop ≥ 1440** | gallery `1440×720` (2:1). Slides 0–1 full width, 2–9 half width. Chrome inset 64px, bar height 112px at top offset 608px. All three chrome groups visible. |
| **Mobile ≤ 768** (measured at 500) | gallery `500×667` (~3:4). **All slides `flex: 0 0 100%`.** Chrome inset 16px, bar height 96px at top offset 571px. Product card **hidden**. Widget shrinks 246 → 71px: visible `1 / 10` counter + active thumbnail only. |
| Breakpoint | layout switches at ~768px |

Note: the mobile reference was captured at 500px because Chrome clamps window width to a
500px minimum; 390px behaviour is expected to match (same media query branch).

## Font substitution

The original uses proprietary **Gucci Sans Pro**. The clone substitutes **Inter**
via `next/font/google`, exposed as `--font-inter` and applied through `.gucci-site`.
All measured sizes, weights, line-heights and letter-spacings are kept unchanged.
