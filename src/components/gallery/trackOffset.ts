/**
 * Resting scroll position for a slide, as a percentage of the gallery width.
 *
 * Two rules combine here, both measured off a live reference implementation:
 *
 * 1. Slide widths are mixed (100% for full-width slides, 50% for catalogue
 *    stills), so the base offset is a running sum — `index * slideWidth` would
 *    drift as soon as the widths stop being uniform.
 * 2. A **half-width slide rests in the right column**, not against the left
 *    edge: 0, −100%, −150%, −200%, −250%. That trailing 50% is what leaves the
 *    outgoing full-width slide filling the left column, giving the paired
 *    two-column composition.
 *
 * The same numbers fall out of `scroll-snap-align: end`, which is how the
 * scroller reproduces them without any transform maths at runtime.
 */
export function trackOffset(
  slideFractions: readonly number[],
  activeIndex: number,
): number {
  const precedingWidth = slideFractions
    .slice(0, activeIndex)
    .reduce((sum, fraction) => sum + fraction, 0);

  const docksRight = slideFractions[activeIndex] === 50;
  return precedingWidth - (docksRight ? 50 : 0);
}
