"use client";

import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import { cn } from "@/lib/utils";
import {
  fullImagePadding,
  slideSource,
  IMAGE_INTRINSIC,
  type GallerySlide,
} from "./slides";

interface CarouselTrackProps {
  slides: readonly GallerySlide[];
  activeIndex: number;
  /** Width of each slide's box, as a percentage of the gallery. */
  slideFractions: readonly number[];
  /** True while the gallery shows two columns (desktop). */
  pairedLayout: boolean;
  scrollerRef: RefObject<HTMLDivElement | null>;
  isDragging: boolean;
  onSelect: (index: number) => void;
  /** Distinguishes a click from the end of a drag. */
  wasDragged: () => boolean;
  handlers: {
    onScroll: () => void;
    onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void;
  };
}

/**
 * The gallery is a native horizontal scroller.
 *
 * That choice buys trackpad and wheel gestures, touch swiping with momentum,
 * keyboard arrows and assistive-technology support without reimplementing any
 * of it. `scroll-snap-align: end` places each slide at exactly the resting
 * position the geometry calls for — see `trackOffset`.
 *
 * Only mouse click-and-drag is added on top, in `useGalleryScroller`.
 */
export function CarouselTrack({
  slides,
  activeIndex,
  slideFractions,
  pairedLayout,
  scrollerRef,
  isDragging,
  onSelect,
  wasDragged,
  handlers,
}: CarouselTrackProps) {
  return (
    <div
      ref={scrollerRef}
      className={cn(
        "gallery-scroller relative flex items-stretch overflow-x-auto overflow-y-hidden bg-[var(--gucci-carousel-base)]",
        // Only mice get a drag affordance; touch already knows what to do.
        isDragging ? "cursor-grabbing" : "cursor-grab",
      )}
      style={{ scrollSnapType: isDragging ? "none" : "x mandatory" }}
      tabIndex={0}
      role="group"
      aria-label="Immagini prodotto, scorri per navigare"
      {...handlers}
    >
      {slides.map((slide, index) => (
        <Slide
          key={slide.src}
          slide={slide}
          isActive={index === activeIndex}
          fraction={slideFractions[index]}
          pairedLayout={pairedLayout}
          eager={index <= 1}
          onActivate={() => {
            if (!wasDragged() && index !== activeIndex) onSelect(index);
          }}
        />
      ))}
    </div>
  );
}

interface SlideProps {
  slide: GallerySlide;
  isActive: boolean;
  fraction: number;
  pairedLayout: boolean;
  eager: boolean;
  onActivate: () => void;
}

function Slide({
  slide,
  isActive,
  fraction,
  pairedLayout,
  eager,
  onActivate,
}: SlideProps) {
  const isFullImage = slide.variant === "image-full";
  const padding = isFullImage
    ? fullImagePadding(isActive, pairedLayout)
    : { left: 0, right: 0 };
  // Landscape cut on desktop, portrait on mobile. Keyed on the URL so the
  // element remounts and reloads when the breakpoint changes.
  const videoSrc = slideSource(slide, pairedLayout);

  return (
    <article
      className="relative shrink-0 grow-0"
      style={{ flexBasis: `${fraction}%`, scrollSnapAlign: "end" }}
      onClick={onActivate}
    >
      <div
        className="relative h-full"
        style={{
          paddingLeft: `${padding.left}%`,
          paddingRight: `${padding.right}%`,
          // Only the editorial slide animates. The video and the catalogue
          // stills simply travel with the scroller, untransformed.
          transition: isFullImage
            ? "padding-left 600ms ease, padding-right 600ms ease"
            : undefined,
        }}
      >
        {slide.variant === "video-full" ? (
          /*
           * Absolutely positioned on purpose: row height must come from the
           * stills alone. As a normal flex child the video contributes its own
           * intrinsic height, and a portrait file at full width would then make
           * the row twice as tall as the images.
           *
           * Required proportions: 10:7 on desktop, 5:7 on mobile.
           */
          <video
            key={videoSrc}
            className="absolute inset-0 block h-full w-full object-cover"
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- local product stills
          <img
            className="block h-auto w-full select-none"
            src={slide.src}
            alt={slide.alt}
            width={IMAGE_INTRINSIC.width}
            height={IMAGE_INTRINSIC.height}
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : "auto"}
            draggable={false}
          />
        )}
      </div>
    </article>
  );
}
