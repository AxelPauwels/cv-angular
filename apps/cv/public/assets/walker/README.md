Walking loops for `ds-walker` (shown on every page by the app shell). Each is one seamless walk cycle
that walks in place, cropped to the figure, at twice its on-screen size, as animated WebP (quality 80):

- `walking-left.webp` and `walking-right.webp`, from `../gifs/Walking-{Left,Right}-512x512.gif`: one
  seamless walk cycle each (31 frames, ~1s; left from frame 191, right from frame 82), cropped to
  x 152-362, y 86-365 of the 512px frames, scaled to 197x262 (98.5x131 on screen). ~175 kB each
  instead of 3.6 MB.
- `carrying-zonejs-right.webp`, the first walk only, from `../gifs/Injured-Walk-Right-512x512.gif`: carrying a "ZoneJs" sign
  (JavaScript yellow, thin black border, black text, tilted 7° clockwise) at his hands, the hands drawn back on top. Two steps,
  70 frames, played 1.2× faster than the GIF (1.93s instead of 2.33s), GIF frames 86-155: frame 156 matches frame 86 more closely than two neighbouring
  frames match each other, so the loop has no seam. Cropped to x 205-370, y 115-357, scaled to 156x228
  (78x114 on screen). ~420 kB instead of 2.5 MB. Made with `node tools/walker-sign-walk.mjs`
  (frames as PNG) and `img2webp -loop 0 -min_size -lossy -q 80 -m 6`.
