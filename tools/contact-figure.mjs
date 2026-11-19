// Builds the frames of the figure that stands on the footer of the contact
// page (apps/cv/public/assets/contact/): standing idle (Standing-Idle, played
// once, every third frame) and, once the message went out, cheering
// (Cheering frames 0-75, played once). Both end in the same standing pose and
// share one crop, so the page can swap one for the other without a jump.
// Cheering is scaled and moved so that its frame 0 lines up with Standing-Idle's
// last frame (feet, centre, height), as in gif-preview-2.html. Writes PNG
// frames and idle.txt / cheer.txt with their durations:
//   node tools/contact-figure.mjs apps/cv/public/assets/gifs <out-dir>
//   img2webp -loop 1 -min_size -lossy -q 70 -m 6 $(cat <out-dir>/idle.txt) -o idle.webp
//   img2webp -loop 1 -min_size -lossy -q 75 -m 6 $(cat <out-dir>/cheer.txt) -o cheer.webp
//   cwebp -q 80 <out-dir>/idle-000.png -o still.webp
// (-loop 1: plays once and stays on the last frame.)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PNG } from 'pngjs';
import { decodeGif } from './gif-decode.mjs';

const [gifDir, outDir] = process.argv.slice(2);
const CHEER_LAST = 75; // the whole GIF; it ends in the standing pose again
const IDLE_STEP = 3; // idle barely moves: every third frame, each shown three times as long
// output pixels per GIF pixel: shown at half that size (2x for sharp screens)
const SCALE = 0.9;
mkdirSync(outDir, { recursive: true });

const load = (name) =>
  decodeGif(readFileSync(join(gifDir, `${name}-512x512.gif`)));
const idle = load('Standing-Idle');
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

// Cheering in Standing-Idle's coordinates: X = (x - cx) * k + cx'
const a = bounds(idle.frames.at(-1).rgba);
const b = bounds(cheer.frames[0].rgba);
const k = (a.feet - a.top) / (b.feet - b.top);

/** A Cheering frame drawn into Standing-Idle's coordinates (bilinear, premultiplied) */
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

const idleFrames = [];
for (let f = 0; f < idle.frames.length; f += IDLE_STEP) {
  let delay = 0;
  for (let i = f; i < Math.min(f + IDLE_STEP, idle.frames.length); i++)
    delay += idle.frames[i].delay;
  idleFrames.push({ rgba: idle.frames[f].rgba, delay });
}
const cheerFrames = [];
for (let f = 0; f <= CHEER_LAST; f++)
  cheerFrames.push({
    rgba: placeCheer(cheer.frames[f].rgba),
    delay: cheer.frames[f].delay,
  });
const frames = [...idleFrames, ...cheerFrames];

// one crop for both: every opaque pixel of every frame
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

for (const [name, list] of [
  ['idle', idleFrames],
  ['cheer', cheerFrames],
]) {
  const lines = list.map(({ rgba, delay }, i) => {
    const png = new PNG({ width: ow, height: oh });
    png.data = Buffer.from(resample(rgba));
    const file = join(outDir, `${name}-${String(i).padStart(3, '0')}.png`);
    writeFileSync(file, PNG.sync.write(png));
    return `-d ${delay} ${file}`;
  });
  writeFileSync(join(outDir, `${name}.txt`), lines.join('\n') + '\n');
}
console.log(
  JSON.stringify({
    idle: {
      frames: idleFrames.length,
      ms: idleFrames.reduce((s, f) => s + f.delay, 0),
    },
    cheer: {
      frames: cheerFrames.length,
      ms: cheerFrames.reduce((s, f) => s + f.delay, 0),
    },
    k: +k.toFixed(3),
    crop: { x: minX, y: minY, w: cw, h: ch },
    out: { w: ow, h: oh },
    onScreen: { w: ow / 2, h: oh / 2 },
  })
);
