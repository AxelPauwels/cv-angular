// Decodes a GIF into full RGBA frames (each one composited onto the W x H canvas,
// with its delay in ms), for the tools that build the walker and contact WebPs.
export function decodeGif(buf) {
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
