# Page Topology — Gucci PDP "Paparazzo Large Top Handle Bag"

- **Source URL:** https://www.gucci.com/it/it/pr/women/handbags/shoulder-bags-for-women/paparazzo-large-top-handle-bag-p-875019AAGIQ1053
- **site-key:** `www-gucci-com-f475b160`
- **page-key:** `paparazzo-large-top-handle-bag-875019aagiq1053-5c29999f`
- **Destination route:** `/` (scaffold placeholder replaced — first clone in clean template)
- **Target stack of original:** Next.js app served under `/pdp/_next/` (CSS modules, hashed class names)

## Measurements (viewport 1440x757, dpr 2)

- `document.scrollHeight`: **3734px**
- Font family used site-wide: `"Gucci Sans Pro", sans-serif` (4 self-hosted woff2 weights)

## Section stack (top → bottom)

| # | Name | Selector (original) | Top | Height | Notes |
|---|------|---------------------|-----|--------|-------|
| 0 | Header / nav overlay | `#navigation-container` + drawer levels | fixed | 757 (drawer) | Overlays gallery. Transparent over dark hero, white text. Multi-level drawer menu (L1/L2/L3) hidden by default. |
| 1 | Gallery hero | `.gallery-container_gallery__izDZW` | 0 | 720 | 2 children: `carousel-container` (media) + `gallery-overlay` (UI chrome). |
| 1a | Carousel | `.carousel-container_carousel-container__KtTMm` | 0 | 720 | Full-bleed editorial media, dark background. |
| 1b | Gallery overlay | `.gallery-overlay_gallery-overlay__container__l7KFp` | 0 | 720 | "Visualizza in 3D" pill (bottom-left), sticky product bar (bottom-center: name + price + bag icon), thumbnail strip + prev/next arrows (bottom-right). |
| 2 | Below-the-fold grid | `.below-the-fold_grid__hrFzJ` | 720 | 846 | Product info column: "Personalizza con le iniziali", product name, price € 3.200, purchase controls, description. |
| 3 | Related / editorial block | (unnamed div) | 1606 | 641 | To be characterised. |
| 4 | Gucci services strip | (unnamed div) | 2287 | 52 | "SERVIZI GUCCI" — spedizione/ritiro gratuiti, cambi e resi gratuiti, … |
| 5 | Footer | (unnamed div, 7 children) | 2339 | 1395 | "POSSIAMO AIUTARTI?" — Contattaci, Il mio ordine, Domande frequenti, … |

## Layout model

- Page background: transparent body; hero section paints its own near-black.
- Header is an overlay layer (not in flow), sitting above the gallery.
- Light/dark inversion: dark hero → light content below the fold. Header text colour must adapt.

## Assets discovered

**Fonts (self-hosted, proprietary):**
- `/design-system-assets/_static/fonts/GucciSansPro-Light.woff2`
- `/design-system-assets/_static/fonts/GucciSansPro-Book.woff2`
- `/design-system-assets/_static/fonts/GucciSansPro-Medium.woff2`
- `/design-system-assets/_static/fonts/GucciSansPro-Bold.woff2`

**Images:** 26 unique, all on `media.gucci.com/style/...`, following the pattern
`{crop}/{id}/875019_AAGIQ_1053_{NNN}_094_0000_Light-borsa-a-mano-paparazzo-misura-grande.jpg`

- Hero: crop `DarkGray_Center_0_0_2400x1200`, variant `015` (rendered 1440x720)
- Gallery: crop `DarkGray_Center_0_0_1200x1200`, variants `002 003 006 007 008 009 010 012` (rendered 1440x1440)
- Thumbnails: same variants at crops `64x32` (hero) / `64x64` (gallery)

**Video:** Brightcove player present — poster served from
`cf-images.eu-west-1.prod.boltdns.net/v1/jit/2924921183001/...` (account `2924921183001`). Gallery contains a video slide, not only stills.

**3D:** "Visualizza in 3D" entry point — original uses a 3D product viewer.

## Open items (to resolve in later phases)

- Characterise section 3 (1606–2247).
- Extract drawer menu structure (L1/L2/L3) if in scope.
- Behaviour sweep: scroll/click/hover/responsive → `BEHAVIORS.md`.
