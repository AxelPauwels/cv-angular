// Builds the frames of the "drop in and cheer" animation shown once after the
// contact form was sent (apps/cv/public/assets/contact/drop-in-cheer.webp):
// he falls in from above the image, lands (Hard-Landing-Front frames 0-27),
// cross-fades into Cheering (frames 0-75) and rests on its last frame, which
// is the calm standing pose. Joined as in gif-preview-2.html: Cheering is
// scaled and moved so that its frame 0 lines up with landing frame 27 (feet,
// centre, height). Writes PNG frames and a frames.txt with their durations:
//   node tools/contact-cheer.mjs apps/cv/public/assets/gifs <out-dir>
//   img2webp -loop 1 -min_size -lossy -q 75 -m 6 $(cat <out-dir>/frames.txt) -o drop-in-cheer.webp
//   cwebp -q 80 <out-dir>/frame-<last>.png -o drop-in-cheer-still.webp
// (-loop 1: plays once and stays on the last frame.)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PNG } from 'pngjs';
import { decodeGif } from './gif-decode.mjs';

const [gifDir, outDir] = process.argv.slice(2);
const LANDING_LAST = 27; // the closest landing frame to standing still
const CHEER_LAST = 75; // the whole GIF; it ends in the standing pose again
const FALL_FRAMES = 8; // ~0.27s from above the image down to landing frame 0
const FADE_FRAMES = 6; // ~0.2s cross-fade from landing frame 27 into Cheering
// output pixels per GIF pixel: shown at half that size (2x for sharp screens)
const SCALE = 0.9;
mkdirSync(outDir, { recursive: true });

const load = (name) =>
  decodeGif(readFileSync(join(gifDir, `${name}-512x512.gif`)));
const landing = load('Hard-Landing-Front');
const cheer = load('Cheering');
const W = 512,
  H = 512;

/** Soles, top of the head and the horizontal centre of mass of a frame */
function bounds(rgba) {
  let top = H,
    feet = 0,
    sx = 0,
    n = 0;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (rgba[(y * W + x) * 4 + 3] > 128) {
        top = Math.min(top, y);
        feet = Math.max(feet, y);
        sx += x;
        n++;
      }
  return { top, feet, cx: sx / n };
}

// Cheering in the landing's coordinates: X = (x - cx) * k + cx'
const a = bounds(landing.frames[LANDING_LAST].rgba);
const b = bounds(cheer.frames[0].rgba);
const k = (a.feet - a.top) / (b.feet - b.top);

/** A Cheering frame drawn into landing coordinates (bilinear, premultiplied) */
function placeCheer(rgba) {
  const out = new Uint8ClampedArray(W * H * 4);
  for (let Y = 0; Y < H; Y++)
    for (let X = 0; X < W; X++) {
      const sx = (X + 0.5 - a.cx) / k + b.cx - 0.5,
        sy = (Y + 0.5 - a.feet) / k + b.feet - 0.5;
      const x0 = Math.floor(sx),
        y0 = Math.floor(sy),
        fx = sx - x0,
        fy = sy - y0;
      let r = 0,
        g = 0,
        bl = 0,
        al = 0;
      for (const [px, py, w] of [
        [x0, y0, (1 - fx) * (1 - fy)],
        [x0 + 1, y0, fx * (1 - fy)],
        [x0, y0 + 1, (1 - fx) * fy],
        [x0 + 1, y0 + 1, fx * fy],
      ]) {
        if (px < 0 || py < 0 || px >= W || py >= H) continue;
        const o = (py * W + px) * 4,
          pa = (rgba[o + 3] / 255) * w;
        r += rgba[o] * pa;
        g += rgba[o + 1] * pa;
        bl += rgba[o + 2] * pa;
        al += pa;
      }
      const o = (Y * W + X) * 4;
      if (al > 0) {
        out[o] = r / al;
        out[o + 1] = g / al;
        out[o + 2] = bl / al;
      }
      out[o + 3] = Math.round(al * 255);
    }
  return out;
}

/** `top` over `bottom` at opacity t (premultiplied mix of both frames) */
function mix(bottom, top, t) {
  const out = new Uint8ClampedArray(W * H * 4);
  for (let o = 0; o < out.length; o += 4) {
    const ab = (bottom[o + 3] / 255) * (1 - t),
      at = (top[o + 3] / 255) * t,
      al = ab + at;
    if (al > 0)
      for (let c = 0; c < 3; c++)
        out[o + c] = (bottom[o + c] * ab + top[o + c] * at) / al;
    out[o + 3] = Math.round(al * 255);
  }
  return out;
}

/** A frame moved down by dy (negative: up, cut off at the top) */
function shift(rgba, dy) {
  const out = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++) {
    const sy = y - dy;
    if (sy < 0 || sy >= H) continue;
    out.set(rgba.subarray(sy * W * 4, (sy + 1) * W * 4), y * W * 4);
  }
  return out;
}

const frames = [];
// the fall: landing frame 0, from fully above the image down to its place,
// accelerating (ease-in, like gravity)
const first = landing.frames[0];
const fallFrom = bounds(first.rgba).feet + 1;
for (let i = 0; i < FALL_FRAMES; i++) {
  const t = i / FALL_FRAMES;
  frames.push({
    rgba: shift(first.rgba, -Math.round(fallFrom * (1 - t * t))),
    delay: first.delay,
  });
}
for (let f = 0; f <= LANDING_LAST; f++) frames.push(landing.frames[f]);
const settled = landing.frames[LANDING_LAST].rgba;
for (let f = 0; f <= CHEER_LAST; f++) {
  const placed = placeCheer(cheer.frames[f].rgba);
  const t = (f + 1) / (FADE_FRAMES + 1);
  frames.push({
    rgba: f < FADE_FRAMES ? mix(settled, placed, t) : placed,
    delay: cheer.frames[f].delay,
  });
}

// crop: every opaque pixel of every frame (the fall starts above the image)
let minX = W,
  minY = H,
  maxX = 0,
  maxY = 0;
for (const { rgba } of frames)
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (rgba[(y * W + x) * 4 + 3] > 16) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
// even sizes, so the image sits on whole CSS pixels at half size
const cw = maxX - minX + 1,
  ch = maxY - minY + 1;
const ow = 2 * Math.round((cw * SCALE) / 2),
  oh = 2 * Math.round((ch * SCALE) / 2);

// area-average resampling, on premultiplied alpha
function resample(rgba) {
  const out = new Uint8Array(ow * oh * 4),
    fx = cw / ow,
    fy = ch / oh;
  for (let oy = 0; oy < oh; oy++)
    for (let ox = 0; ox < ow; ox++) {
      const x0 = minX + ox * fx,
        x1 = x0 + fx,
        y0 = minY + oy * fy,
        y1 = y0 + fy;
      let r = 0,
        g = 0,
        bl = 0,
        al = 0,
        wsum = 0;
      for (let y = Math.floor(y0); y < Math.ceil(y1); y++)
        for (let x = Math.floor(x0); x < Math.ceil(x1); x++) {
          const w =
            (Math.min(x + 1, x1) - Math.max(x, x0)) *
            (Math.min(y + 1, y1) - Math.max(y, y0));
          if (w <= 0 || x >= W || y >= H) continue;
          const o = (y * W + x) * 4,
            pa = rgba[o + 3] / 255;
          r += rgba[o] * pa * w;
          g += rgba[o + 1] * pa * w;
          bl += rgba[o + 2] * pa * w;
          al += pa * w;
          wsum += w;
        }
      const o = (oy * ow + ox) * 4;
      if (al > 0) {
        out[o] = r / al;
        out[o + 1] = g / al;
        out[o + 2] = bl / al;
      }
      out[o + 3] = Math.round((al / wsum) * 255);
    }
  return out;
}

const list = [];
frames.forEach(({ rgba, delay }, i) => {
  const png = new PNG({ width: ow, height: oh });
  png.data = Buffer.from(resample(rgba));
  const name = join(outDir, `frame-${String(i).padStart(3, '0')}.png`);
  writeFileSync(name, PNG.sync.write(png));
  list.push(`-d ${delay} ${name}`);
});
writeFileSync(join(outDir, 'frames.txt'), list.join('\n') + '\n');
console.log(
  JSON.stringify({
    frames: frames.length,
    ms: frames.reduce((s, { delay }) => s + delay, 0),
    k: +k.toFixed(3),
    crop: { x: minX, y: minY, w: cw, h: ch },
    out: { w: ow, h: oh },
    onScreen: { w: ow / 2, h: oh / 2 },
    last: `frame-${String(frames.length - 1).padStart(3, '0')}.png`,
  })
);
