// Downloads gallery assets for the Gucci PDP clone (gallery scope only).
// Target: public/sites/www-gucci-com-f475b160/paparazzo-large-top-handle-bag-875019aagiq1053-5c29999f/
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const SITE_KEY = 'www-gucci-com-f475b160';
const PAGE_KEY = 'paparazzo-large-top-handle-bag-875019aagiq1053-5c29999f';
const OUT = join('public', 'sites', SITE_KEY, PAGE_KEY);

const MEDIA = 'https://media.gucci.com/style';
const SLUG = 'Light-borsa-a-mano-paparazzo-misura-grande.jpg';

// variant -> media folder id, as observed on the live page
const VARIANTS = [
  { v: '015', id: '1774611010', hero: true },
  { v: '002', id: '1774257313' },
  { v: '003', id: '1774257313' },
  { v: '006', id: '1774611008' },
  { v: '007', id: '1774611009' },
  { v: '008', id: '1774611009' },
  { v: '009', id: '1774611009' },
  { v: '010', id: '1774611010' },
  { v: '012', id: '1774257316' },
];

const productUrl = ({ v, id, hero }) =>
  `${MEDIA}/DarkGray_Center_0_0_${hero ? '2400x1200' : '1200x1200'}/${id}/875019_AAGIQ_1053_${v}_094_0000_${SLUG}`;

const thumbUrl = ({ v, id, hero }) =>
  `${MEDIA}/DarkGray_Center_0_0_${hero ? '64x32' : '64x64'}/${id}/875019_AAGIQ_1053_${v}_094_0000_${SLUG}`;

// Fonts are NOT downloaded: the original's Gucci Sans Pro is proprietary.
// The clone substitutes Inter, loaded via next/font in src/app/layout.tsx.

// Brightcove signed URL — captured from the live page, expires. Best effort:
// re-read it from the live <video> element before re-running with this set.
const VIDEO_URL = process.env.GUCCI_VIDEO_URL ?? '';

const jobs = [
  ...VARIANTS.map((x) => ({ url: productUrl(x), dest: join(OUT, 'images', `slide-${x.v}.jpg`) })),
  ...VARIANTS.map((x) => ({ url: thumbUrl(x), dest: join(OUT, 'images', `thumb-${x.v}.jpg`) })),
  ...(VIDEO_URL ? [{ url: VIDEO_URL, dest: join(OUT, 'video', 'slide-00.mp4') }] : []),
];

const HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36',
  referer: 'https://www.gucci.com/',
  accept: '*/*',
};

async function fetchOne({ url, dest }) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, buf);
  return buf.length;
}

const results = { ok: 0, failed: [] };
const BATCH = 4;

for (let i = 0; i < jobs.length; i += BATCH) {
  const chunk = jobs.slice(i, i + BATCH);
  const settled = await Promise.allSettled(chunk.map(fetchOne));
  settled.forEach((r, k) => {
    const { dest } = chunk[k];
    if (r.status === 'fulfilled') {
      results.ok += 1;
      console.log(`ok   ${(r.value / 1024).toFixed(0).padStart(6)} KB  ${dest}`);
    } else {
      results.failed.push({ dest, reason: r.reason.message });
      console.error(`FAIL              ${dest} — ${r.reason.message}`);
    }
  });
}

console.log(`\n${results.ok}/${jobs.length} downloaded`);
if (results.failed.length) process.exitCode = 1;
