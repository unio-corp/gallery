"use client";

import { useEffect, useState } from "react";
import { CarouselTrack } from "./CarouselTrack";
import { GalleryOverlay } from "./GalleryOverlay";
import { SLIDES, slideFraction } from "./slides";
import { useGalleryScroller } from "./useGalleryScroller";

/** Below this width every slide spans the full viewport. */
const MOBILE_BREAKPOINT = 768;

export function GallerySection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const sync = () => setIsMobile(query.matches);

    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Desktop keeps the mixed widths; mobile collapses every slide to 100%.
  const pairedLayout = !isMobile;
  const slideFractions = SLIDES.map((slide) =>
    slideFraction(slide.variant, pairedLayout),
  );

  const {
    scrollerRef,
    activeIndex,
    isDragging,
    goTo,
    goPrev,
    goNext,
    wasDragged,
    handlers,
  } = useGalleryScroller({ slideFractions, slideCount: SLIDES.length });

  return (
    <section
      aria-label="Galleria prodotto"
      aria-roledescription="carousel"
      // Height is auto: the media keeps its natural proportions and the gallery
      // sizes itself around it. No aspect ratio is imposed, so swapping in a
      // catalogue with different proportions needs no code change.
      className="gucci-site relative w-full"
    >
      <CarouselTrack
        slides={SLIDES}
        activeIndex={activeIndex}
        slideFractions={slideFractions}
        pairedLayout={pairedLayout}
        scrollerRef={scrollerRef}
        isDragging={isDragging}
        onSelect={goTo}
        wasDragged={wasDragged}
        handlers={handlers}
      />
      <GalleryOverlay
        slides={SLIDES}
        activeIndex={activeIndex}
        onSelect={goTo}
        onPrev={goPrev}
        onNext={goNext}
      />
      <span className="sr-only" aria-live="polite">
        {activeIndex + 1} / {SLIDES.length}
      </span>
    </section>
  );
}
