Shown once on the contact page after the message went out (`cv-contact-form`), decorative (`alt=""`):

- `drop-in-cheer.webp`: he falls in from above, lands (`../gifs/Hard-Landing-Front-512x512.gif` frames 0-27),
  cross-fades into `../gifs/Cheering-512x512.gif` (frames 0-75, scaled 1.015× and moved so its frame 0 lines up
  with landing frame 27) and stays on the last frame, the calm standing pose. Plays once (`-loop 1`), 112 frames,
  ~3.7s, 206x354 (103x177 on screen), ~430 kB, loaded only after sending instead of 2 GIFs of several MB.
- `drop-in-cheer-still.webp`: that last frame, for `prefers-reduced-motion: reduce`.

Made with `node tools/contact-cheer.mjs apps/cv/public/assets/gifs <out-dir>` (PNG frames), then
`img2webp -loop 1 -min_size -lossy -q 75 -m 6 $(cat <out-dir>/frames.txt) -o drop-in-cheer.webp` and
`cwebp -q 80 <out-dir>/frame-111.png -o drop-in-cheer-still.webp`. The cuts were picked on `/gif-preview-2.html`.
