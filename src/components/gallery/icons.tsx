import type { SVGProps } from "react";

/**
 * SVG icons extracted verbatim from the live Gucci PDP gallery.
 * The original fills reference `var(--_g-icon-fill-color)`; here they use
 * `currentColor` so colour is inherited from the surrounding component.
 */

export function View3DIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="17"
      viewBox="0 0 16 17"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M7.43 5.65547C7.43 5.16547 7.14 4.73547 6.68 4.47547C7.07 4.23547 7.31 3.85547 7.31 3.43547C7.31 2.64547 6.7 2.10547 5.76 2.10547C5.19 2.10547 4.67 2.39547 4.44 2.58547V3.59547C4.84 3.16547 5.29 2.94547 5.74 2.94547C6.06 2.94547 6.37 3.14547 6.37 3.50547C6.37 3.95547 5.89 4.13547 5.57 4.13547H5.34V4.92547H5.57C5.94 4.92547 6.49 5.05547 6.49 5.63547C6.49 6.07547 6.11 6.29547 5.75 6.29547C5.24 6.29547 4.78 6.05547 4.34 5.62547V6.64547C4.59 6.84547 5.12 7.12547 5.74 7.12547C6.73 7.12547 7.43 6.52547 7.43 5.66547V5.65547Z"
        fill="currentColor"
      />
      <path
        d="M12.31 4.61547C12.31 3.28547 11.22 2.23547 9.84 2.23547H8.07V6.99547H9.84C11.22 6.99547 12.31 5.94547 12.31 4.61547ZM9.84 6.07547H9.07V3.14547H9.84C10.65 3.14547 11.28 3.78547 11.28 4.60547C11.28 5.42547 10.65 6.06547 9.84 6.06547V6.07547Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function BagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M11.9917 4.9975H10.7427V4.74771C10.7427 3.22898 9.51374 2 7.995 2C6.47627 2 5.24729 3.22898 5.24729 4.74771V4.9975H3.99833C2.89925 4.9975 2 5.88676 2 6.99584V12.0017C2 13.1007 2.88926 14 3.99833 14H12.0017C13.1007 14 14 13.1107 14 12.0017V6.99584C14 5.89675 13.1107 4.9975 12.0017 4.9975H11.9917ZM6.74604 4.74771C6.74604 4.05828 7.30558 3.49875 7.995 3.49875C8.68443 3.49875 9.24396 4.05828 9.24396 4.74771V4.9975H6.74604V4.74771ZM12.4913 11.9917C12.4913 12.2614 12.2714 12.4913 11.9917 12.4913H3.99833C3.72856 12.4913 3.49875 12.2714 3.49875 11.9917V6.98584C3.49875 6.71607 3.71857 6.48626 3.99833 6.48626H5.24729V7.48543H6.74604V6.48626H9.24396V7.48543H10.7427V6.48626H11.9917C12.2614 6.48626 12.4913 6.70608 12.4913 6.98584V11.9917Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M10 4L6 8L10 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M6 12L10 8L6 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface PlayPauseIconProps extends SVGProps<SVGSVGElement> {
  /** When true the pause glyph is shown, otherwise the play glyph. */
  isPlaying: boolean;
}

/**
 * The original ships both glyphs in one SVG and toggles group visibility via CSS.
 * Same structure kept here, driven by the `isPlaying` prop.
 */
export function PlayPauseIcon({ isPlaying, ...props }: PlayPauseIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      {isPlaying ? (
        <path
          d="M4.5 10.0479H3V2.04785H4.5V10.0479ZM9 2.04785H7.5V10.0479H9V2.04785Z"
          fill="currentColor"
        />
      ) : (
        <path
          d="M4.3501 10.0332C4.2301 10.0332 4.1201 10.0033 4.0101 9.95345C3.7601 9.82384 3.6001 9.56464 3.6001 9.28549V2.7854C3.6001 2.50625 3.7601 2.24705 4.0101 2.11745C4.2601 1.98784 4.5601 2.00778 4.7901 2.17726L9.2901 5.42731C9.4801 5.56688 9.6001 5.79618 9.6001 6.03545C9.6001 6.27471 9.4801 6.50401 9.2901 6.64358L4.7901 9.89363C4.6601 9.98336 4.5001 10.0332 4.3501 10.0332Z"
          fill="currentColor"
        />
      )}
    </svg>
  );
}
