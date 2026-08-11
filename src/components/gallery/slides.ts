/** Stills and their thumbnails. */
const IMAGES = "/images/test";
/** Video assets. */
const VIDEO = "/videos";

/**
 * Catalogue stills are 2000×2800 (5:7 portrait). Nothing in the code depends on
 * that ratio: the gallery height is auto and every image renders at its natural
 * proportions, so a catalogue with different dimensions needs no change here.
 */
export const IMAGE_INTRINSIC = { width: 2000, height: 2800 } as const;

/**
 * The three gallery presentations.
 *
 * - `video-full` — spans the viewport and never transforms: it simply slides away.
 * - `image-full` — editorial opener. The image itself is half the viewport wide,
 *   centred by equal side padding that leaves room for copy. Going idle the
 *   padding redistributes so the image docks to the right half of its own box.
 * - `image-half` — catalogue still, two per viewport, no inner motion.
 */
export type SlideVariant = "video-full" | "image-full" | "image-half";

export interface GallerySlide {
  readonly variant: SlideVariant;
  readonly src: string;
  /**
   * Portrait cut used below the paired breakpoint. Only meaningful for video:
   * a `video-full` slide spans the whole width, so the desktop file needs
   * landscape proportions while mobile needs a portrait one. Falls back to
   * `src` when absent.
   */
  readonly srcMobile?: string;
  readonly thumb: string;
  readonly alt: string;
}

/** Picks the right source for the current breakpoint. */
export function slideSource(
  slide: GallerySlide,
  pairedLayout: boolean,
): string {
  return pairedLayout ? slide.src : (slide.srcMobile ?? slide.src);
}

const PRODUCT_ALT = "Rectangular sunglasses in milky brown";

/** Half-width catalogue stills, in file order. */
const STILL_IDS = ["02", "03", "04", "05", "06", "07"];

export const SLIDES: readonly GallerySlide[] = [
  {
    variant: "video-full",
    // TODO: replace with the landscape desktop cut. `video-00.mp4` is 342×480
    // (portrait), which is the mobile proportion — at full desktop width it
    // would be twice as tall as the stills. Until the landscape file exists
    // the video is cropped to the row height.
    src: `${VIDEO}/video-00.mp4`,
    srcMobile: `${VIDEO}/video-00.mp4`,
    thumb: `${IMAGES}/thumb-01.jpg`,
    alt: PRODUCT_ALT,
  },
  {
    // Editorial opener: the image sits at half width with gutters either side,
    // which will later carry the copy.
    variant: "image-full",
    src: `${IMAGES}/slide-01.jpg`,
    thumb: `${IMAGES}/thumb-01.jpg`,
    alt: PRODUCT_ALT,
  },
  ...STILL_IDS.map<GallerySlide>((id) => ({
    variant: "image-half",
    src: `${IMAGES}/slide-${id}.jpg`,
    thumb: `${IMAGES}/thumb-${id}.jpg`,
    alt: PRODUCT_ALT,
  })),
];

/**
 * Width of a slide's box as a percentage of the gallery.
 *
 * Below the paired breakpoint every slide spans the full width — there is no
 * room for two columns, so `image-half` widens to 100 as well.
 *
 * This is the single source of truth for slide widths: the track offset, the
 * flex basis and the padding rules are all derived from it.
 */
export function slideFraction(
  variant: SlideVariant,
  pairedLayout: boolean,
): number {
  if (!pairedLayout) return 100;
  return variant === "image-half" ? 50 : 100;
}

/** Side padding of an `image-full` slide, as a percentage of its own box. */
export function fullImagePadding(
  isActive: boolean,
  pairedLayout: boolean,
): { left: number; right: number } {
  if (!pairedLayout) return { left: 0, right: 0 };
  // Active: image centred, equal gutters reserved for copy.
  // Idle: the right gutter collapses to make room for the incoming slide, and
  // the left one doubles, pushing the image into the right half of its box —
  // which, once the track has translated, is the visible left column.
  return isActive ? { left: 25, right: 25 } : { left: 50, right: 0 };
}

export const PRODUCT = {
  name: "Rectangular sunglasses in milky brown",
  // Placeholder: the real price was not supplied with the test assets.
  price: "€ 3.200",
} as const;

/** Number of thumbnails shown before the overflow counter chip. */
export const VISIBLE_THUMBNAILS = 6;
