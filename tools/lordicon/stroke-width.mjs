// Writes a thick copy of every self-hosted Lordicon, for `<ds-lordicon thick>`.
// Lordicon's heaviest setting (`stroke="bold"`) still draws about half the line width
// of an Icomoon or Material Symbols glyph at the same size, and the player accepts no
// heavier value. So this makes the base width of every stroke 1.5 times as wide (12
// becomes 18: about 1.75px instead of 1.17px at 28px with `bold`), close to the
// glyphs while still lighter. The `stroke` control still multiplies it, the
// animations are untouched.
//
// The originals stay as they are (the footer uses them): `<id>.json` gives
// `<id>.thick.json` next to it. Run it after adding an icon to
// libs/shared/ui-lordicon/src/assets:
//   node tools/lordicon/stroke-width.mjs
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ASSETS = 'libs/shared/ui-lordicon/src/assets';
const SCALE = 1.5;
const THICK = '.thick.json';

/** Every stroke shape (`ty: 'st'`) in the Lottie tree */
const strokes = (node) =>
  Array.isArray(node)
    ? node.flatMap(strokes)
    : node && typeof node === 'object'
      ? [
          ...(node.ty === 'st' && node.w ? [node] : []),
          ...Object.values(node).flatMap(strokes),
        ]
      : [];

/** A width is a number, or keyframes whose start (`s`) values hold the width */
const scale = (width) => {
  if (typeof width.k === 'number') {
    width.k *= SCALE;
    return;
  }
  for (const frame of width.k) {
    if (Array.isArray(frame.s)) frame.s = frame.s.map((value) => value * SCALE);
  }
};

const originals = readdirSync(ASSETS).filter(
  (file) => file.endsWith('.json') && !file.endsWith(THICK)
);

for (const name of originals) {
  const icon = JSON.parse(readFileSync(join(ASSETS, name), 'utf8'));
  // the shapes sit in the layers and in the precomposed `assets` they use
  const shapes = strokes([icon.layers, icon.assets]);
  if (!shapes.length) throw new Error(`${name}: no strokes found`);
  shapes.forEach((shape) => scale(shape.w));
  const thick = name.replace(/\.json$/, THICK);
  writeFileSync(join(ASSETS, thick), JSON.stringify(icon));
  console.log(`${thick}: ${shapes.length} strokes x${SCALE}`);
}
