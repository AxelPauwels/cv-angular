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

const [gifPath, signPath, previewPath, outDir] = process.argv.slice(2);
// frame 156 matches frame 86 better than neighbouring frames match: no seam
const FIRST_FRAME = 86;
const LAST_FRAME = 155;
const SCALE = 480 / 512; // twice the on-screen 240/512 of the other walker
const SIGN_GRIP = 25; // the (straight) sign's top edge sits this far above the hands
const SIGN_TILT_DEG = 7; // turned clockwise around its centre, so it isn't quite straight
mkdirSync(outDir, { recursive: true });

// ---------- GIF decoding (frames composited onto a 512x512 RGBA canvas) ----------
function decodeGif(buf) {
  let p = 0;
  const u8 = () => buf[p++];
  const u16 = () => buf[p++] | (buf[p++] << 8);
  const sig = buf.toString('ascii', 0, 6);
  if (!sig.startsWith('GIF')) throw new Error('not a GIF');
  p = 6;
  const W = u16(),
    H = u16(),
    flags = u8();
  u8();
  u8(); // background, aspect
  let gct = null;
  if (flags & 0x80) {
    const n = 3 * (1 << ((flags & 7) + 1));
    gct = buf.subarray(p, p + n);
    p += n;
  }
  const canvas = new Uint8ClampedArray(W * H * 4);
  const frames = [];
  let gce = { delay: 0, transparent: -1, dispose: 0 };
  while (p < buf.length) {
    const b = u8();
    if (b === 0x3b) break;
    if (b === 0x21) {
      const label = u8();
      if (label === 0xf9) {
        u8();
        const f = u8();
        const delay = u16();
        const ti = u8();
        u8();
        gce = {
          delay: delay * 10,
          transparent: f & 1 ? ti : -1,
          dispose: (f >> 2) & 7,
        };
      } else {
        let s;
        while ((s = u8())) p += s;
      }
      continue;
    }
    if (b !== 0x2c) throw new Error('bad block ' + b + ' at ' + p);
    const x = u16(),
      y = u16(),
      w = u16(),
      h = u16(),
      lf = u8();
    let ct = gct;
    if (lf & 0x80) {
      const n = 3 * (1 << ((lf & 7) + 1));
      ct = buf.subarray(p, p + n);
      p += n;
    }
    const interlace = !!(lf & 0x40);
    const minCode = u8();
    const chunks = [];
    let s;
    while ((s = u8())) {
      chunks.push(buf.subarray(p, p + s));
      p += s;
    }
    const data = Buffer.concat(chunks);
    const idx = lzw(data, minCode, w * h);
    const before = gce.dispose === 3 ? canvas.slice() : null;
    const rows = interlace ? interlaceRows(h) : [...Array(h).keys()];
    for (let r = 0; r < h; r++) {
      const ry = rows[r];
      for (let c = 0; c < w; c++) {
        const ci = idx[r * w + c];
        if (ci === gce.transparent) continue;
        const o = ((y + ry) * W + (x + c)) * 4;
        canvas[o] = ct[ci * 3];
        canvas[o + 1] = ct[ci * 3 + 1];
        canvas[o + 2] = ct[ci * 3 + 2];
        canvas[o + 3] = 255;
      }
    }
    frames.push({ rgba: canvas.slice(), delay: gce.delay || 100 });
    if (gce.dispose === 2) {
      for (let ry = 0; ry < h; ry++)
        canvas.fill(0, ((y + ry) * W + x) * 4, ((y + ry) * W + x + w) * 4);
    } else if (gce.dispose === 3 && before) canvas.set(before);
    gce = { delay: 0, transparent: -1, dispose: 0 };
  }
  return { W, H, frames };
}
function interlaceRows(h) {
  const rows = [];
  for (const [start, step] of [
    [0, 8],
    [4, 8],
    [2, 4],
    [1, 2],
  ])
    for (let r = start; r < h; r += step) rows.push(r);
  return rows;
}
function lzw(data, minCode, pixels) {
  const clear = 1 << minCode,
    end = clear + 1;
  let size = minCode + 1,
    next = end + 1;
  const prefix = new Int32Array(4096),
    suffix = new Uint8Array(4096),
    len = new Int32Array(4096);
  for (let i = 0; i < clear; i++) {
    prefix[i] = -1;
    suffix[i] = i;
    len[i] = 1;
  }
  const out = new Uint8Array(pixels);
  let op = 0,
    bits = 0,
    acc = 0,
    dp = 0,
    prev = -1;
  const emit = (code) => {
    const l = len[code];
    let c = code;
    for (let i = l - 1; i >= 0; i--) {
      if (op + i < pixels) out[op + i] = suffix[c];
      c = prefix[c];
    }
    op += l;
  };
  const first = (code) => {
    let c = code;
    while (prefix[c] !== -1) c = prefix[c];
    return suffix[c];
  };
  while (op < pixels) {
    while (bits < size) {
      if (dp >= data.length) return out;
      acc |= data[dp++] << bits;
      bits += 8;
    }
    const code = acc & ((1 << size) - 1);
    acc >>= size;
    bits -= size;
    if (code === clear) {
      size = minCode + 1;
      next = end + 1;
      prev = -1;
      continue;
    }
    if (code === end) break;
    if (prev === -1) {
      emit(code);
      prev = code;
      continue;
    }
    if (code < next) {
      if (next < 4096) {
        prefix[next] = prev;
        suffix[next] = first(code);
        len[next] = len[prev] + 1;
        next++;
      }
      emit(code);
    } else {
      const f = first(prev);
      if (next < 4096) {
        prefix[next] = prev;
        suffix[next] = f;
        len[next] = len[prev] + 1;
        next++;
      }
      emit(code);
    }
    if (next === 1 << size && size < 12) size++;
    prev = code;
  }
  return out;
}

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
  selected.push({ f, rgba: compose(f), delay: gif.frames[f].delay });

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
