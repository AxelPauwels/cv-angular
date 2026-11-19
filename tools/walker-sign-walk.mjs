// Builds the frames of the "carrying the ZoneJs sign" walking loop for ds-walker
// (apps/cv/public/assets/walker/carrying-zonejs-right.webp) from Injured-Walk-Right:
// one seamless two-step cycle (GIF frames 86-155), the sign at the hands and the
// hands drawn back on top (as gif-preview.html does), cropped to the figure and
// scaled to twice the on-screen size. Writes PNG frames and a frames.txt with
// their durations, then:
//   node tools/walker-sign-walk.mjs apps/cv/public/assets/gifs/Injured-Walk-Right-512x512.gif \
//     <sign.png> apps/cv/public/gif-preview.html <out-dir>
//   img2webp -loop 0 -min_size -lossy -q 80 -m 6 $(cat <out-dir>/frames.txt) -o carrying-zonejs-right.webp
// <sign.png>: the straight 128x56 sign (#f7df1e, 3px black border, bold 30px
// black "ZoneJs"), drawn with the same canvas code as gif-preview.html; this
// script tilts it by SIGN_TILT_DEG.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PNG } from 'pngjs';
import { decodeGif } from './gif-decode.mjs';

const [gifPath, signPath, previewPath, outDir] = process.argv.slice(2);
// frame 156 matches frame 86 better than neighbouring frames match: no seam
const FIRST_FRAME = 86;
const LAST_FRAME = 155;
const SCALE = 480 / 512; // twice the on-screen 240/512 of the other walker
const SIGN_GRIP = 25; // the (straight) sign's top edge sits this far above the hands
const SIGN_TILT_DEG = 7; // turned clockwise around its centre, so it isn't quite straight
// played faster than the GIF (shorter frames); the walker's speed in
// apps/cv/src/app/shell/walker-images.ts goes up by the same factor
const SPEED_UP = 1.2;
mkdirSync(outDir, { recursive: true });

// ---------- compositing ----------
const gif = decodeGif(readFileSync(gifPath));
const sign = rotate(PNG.sync.read(readFileSync(signPath)), SIGN_TILT_DEG);
// where the centre of the straight sign is, relative to the hands
const SIGN_CENTER_BELOW_HANDS =
  PNG.sync.read(readFileSync(signPath)).height / 2 - SIGN_GRIP;

/** Turns an RGBA image clockwise by `deg`, bilinear, on a canvas that fits it */
function rotate(img, deg) {
  const a = (deg * Math.PI) / 180,
    cos = Math.cos(a),
    sin = Math.sin(a);
  const w = Math.ceil(img.width * cos + img.height * sin) + 2;
  const h = Math.ceil(img.width * sin + img.height * cos) + 2;
  const out = { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) };
  const at = (x, y, k) =>
    x < 0 || y < 0 || x >= img.width || y >= img.height
      ? 0
      : img.data[(y * img.width + x) * 4 + k];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      // back to the source: rotate the other way around both centres
      const dx = x + 0.5 - w / 2,
        dy = y + 0.5 - h / 2;
      const sx = dx * cos + dy * sin + img.width / 2 - 0.5,
        sy = -dx * sin + dy * cos + img.height / 2 - 0.5;
      const x0 = Math.floor(sx),
        y0 = Math.floor(sy),
        fx = sx - x0,
        fy = sy - y0;
      const wts = [(1 - fx) * (1 - fy), fx * (1 - fy), (1 - fx) * fy, fx * fy];
      const pts = [
        [x0, y0],
        [x0 + 1, y0],
        [x0, y0 + 1],
        [x0 + 1, y0 + 1],
      ];
      let al = 0;
      const c = [0, 0, 0];
      pts.forEach(([px, py], i) => {
        const pa = at(px, py, 3) * wts[i];
        al += pa;
        for (let k = 0; k < 3; k++) c[k] += at(px, py, k) * pa;
      });
      const o = (y * w + x) * 4;
      if (al > 0) for (let k = 0; k < 3; k++) out.data[o + k] = c[k] / al;
      out.data[o + 3] = al;
    }
  return out;
}
const html = readFileSync(previewPath, 'utf8');
const HANDS = JSON.parse(
  html.match(/const HANDS = (\[[\s\S]*?\]);/)[1].replace(/,\s*\]$/, ']')
);
if (HANDS.length !== gif.frames.length)
  throw new Error(`HANDS ${HANDS.length} vs frames ${gif.frames.length}`);
const { W, H } = gif;
const HAND_BOX = { w: 120, h: 44, above: 40 };

function compose(f) {
  const src = gif.frames[f].rgba;
  const out = src.slice();
  const [hx, hy] = HANDS[f];
  const sx0 = Math.round(hx - sign.width / 2);
  const sy0 = Math.round(hy + SIGN_CENTER_BELOW_HANDS - sign.height / 2);
  // the sign, over the figure
  for (let y = 0; y < sign.height; y++)
    for (let x = 0; x < sign.width; x++) {
      const X = sx0 + x,
        Y = sy0 + y;
      if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
      const s = (y * sign.width + x) * 4,
        o = (Y * W + X) * 4,
        a = sign.data[s + 3] / 255;
      for (let k = 0; k < 3; k++)
        out[o + k] = sign.data[s + k] * a + out[o + k] * (1 - a);
      out[o + 3] = Math.max(out[o + 3], sign.data[s + 3]);
    }
  // the hands back on top: the skin pixels around them, as in gif-preview.html
  const bx = Math.round(hx - HAND_BOX.w / 2),
    by = Math.round(hy - HAND_BOX.above);
  for (let y = 0; y < HAND_BOX.h; y++)
    for (let x = 0; x < HAND_BOX.w; x++) {
      const X = bx + x,
        Y = by + y;
      if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
      const o = (Y * W + X) * 4,
        r = src[o],
        g = src[o + 1],
        b = src[o + 2],
        al = src[o + 3];
      if (al > 120 && r > 140 && r > g + 20 && g > b && g > 80) {
        out[o] = r;
        out[o + 1] = g;
        out[o + 2] = b;
        out[o + 3] = al;
      }
    }
  return out;
}

const selected = [];
for (let f = FIRST_FRAME; f <= LAST_FRAME; f++)
  selected.push({
    f,
    rgba: compose(f),
    delay: Math.round(gif.frames[f].delay / SPEED_UP),
  });

// crop: every opaque pixel of every frame; the bottom is the soles of the feet
let minX = W,
  minY = H,
  maxX = 0,
  maxY = 0;
for (const { rgba } of selected)
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (rgba[(y * W + x) * 4 + 3] > 16) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
const cw = maxX - minX + 1,
  ch = maxY - minY + 1;
const ow = Math.round(cw * SCALE),
  oh = Math.round(ch * SCALE);

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
        b = 0,
        a = 0,
        wsum = 0;
      for (let y = Math.floor(y0); y < Math.ceil(y1); y++)
        for (let x = Math.floor(x0); x < Math.ceil(x1); x++) {
          const wx = Math.min(x + 1, x1) - Math.max(x, x0),
            wy = Math.min(y + 1, y1) - Math.max(y, y0),
            w = wx * wy;
          if (w <= 0) continue;
          const o = (y * W + x) * 4,
            al = rgba[o + 3] / 255;
          r += rgba[o] * al * w;
          g += rgba[o + 1] * al * w;
          b += rgba[o + 2] * al * w;
          a += al * w;
          wsum += w;
        }
      const o = (oy * ow + ox) * 4;
      if (a > 0) {
        out[o] = r / a;
        out[o + 1] = g / a;
        out[o + 2] = b / a;
      }
      out[o + 3] = Math.round((a / wsum) * 255);
    }
  return out;
}

const list = [];
selected.forEach(({ rgba, delay }, i) => {
  const png = new PNG({ width: ow, height: oh });
  png.data = Buffer.from(resample(rgba));
  const name = join(outDir, `frame-${String(i).padStart(3, '0')}.png`);
  writeFileSync(name, PNG.sync.write(png));
  list.push(`-d ${delay} ${name}`);
});
writeFileSync(join(outDir, 'frames.txt'), list.join('\n') + '\n');
const loop = selected.reduce((s, { delay }) => s + delay, 0);
console.log(
  JSON.stringify({
    frames: selected.length,
    loopMs: loop,
    crop: { x: minX, y: minY, w: cw, h: ch },
    out: { w: ow, h: oh },
    onScreen: { w: ow / 2, h: oh / 2 },
  })
);
