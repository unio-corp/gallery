// Run with:
//   node --experimental-strip-types scripts/verify-slide-variants.mts
//
// Asserts the slide-variant geometry against the values measured on the live
// reference page, including the mobile branch — which the browser under
// automation could not be resized far enough to reach.
import {
  slideFraction,
  fullImagePadding,
  SLIDES,
} from "../src/components/gallery/slides.ts";
import { trackOffset } from "../src/components/gallery/trackOffset.ts";

let fail = 0;
const eq = (label: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) fail++;
  console.log(`${ok ? "ok  " : "FAIL"} ${label}  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`);
};

console.log("— slideFraction, desktop (paired) —");
eq("video-full", slideFraction("video-full", true), 100);
eq("image-full", slideFraction("image-full", true), 100);
eq("image-half", slideFraction("image-half", true), 50);

console.log("— slideFraction, mobile —");
eq("video-full", slideFraction("video-full", false), 100);
eq("image-full", slideFraction("image-full", false), 100);
eq("image-half", slideFraction("image-half", false), 100);

console.log("— fullImagePadding —");
eq("desktop active", fullImagePadding(true, true), { left: 25, right: 25 });
eq("desktop idle  ", fullImagePadding(false, true), { left: 50, right: 0 });
eq("mobile active ", fullImagePadding(true, false), { left: 0, right: 0 });
eq("mobile idle   ", fullImagePadding(false, false), { left: 0, right: 0 });

console.log("— deck shape —");
eq("count", SLIDES.length, 8);
eq("variants", SLIDES.map(s => s.variant).join(","),
   "video-full,image-full," + Array(6).fill("image-half").join(","));

console.log("— track offsets, desktop —");
const fr = SLIDES.map(s => slideFraction(s.variant, true));
const offset = (i: number) => trackOffset(fr, i);
[[0,0],[1,100],[2,150],[3,200],[4,250]].forEach(([i, want]) =>
  eq(`idx${i}`, offset(i), want));
const last = SLIDES.length - 1;
eq("last idx == track - viewport", offset(last), fr.reduce((a,b)=>a+b,0) - 100);

console.log("— track offsets, mobile (all full width) —");
const frm = SLIDES.map(s => slideFraction(s.variant, false));
const offsetM = (i: number) => trackOffset(frm, i);
[[0,0],[1,100],[2,200],[3,300]].forEach(([i, want]) => eq(`idx${i}`, offsetM(i), want));

console.log(fail === 0 ? "\nALL PASS" : `\n${fail} FAILED`);
process.exit(fail === 0 ? 0 : 1);
