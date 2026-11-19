The figure standing on the footer of the contact page (`cv-contact-form`), decorative (`alt=""`). Both
animations play once (`-loop 1`) and stay on their last frame, the same standing pose, and share one crop
(206x340 → 104x170 on screen), so the page swaps one for the other without a jump:

- `idle.webp`: `../gifs/Standing-Idle-512x512.gif`, every third frame (51 frames, ~5s), ~155 kB. Shown by
  default, loaded lazily with a low priority.
- `cheer.webp`: `../gifs/Cheering-512x512.gif` frames 0-75 (~2.5s), scaled 1.019× and moved so its frame 0
  lines up with Standing-Idle's last frame. ~320 kB, fetched while the message is being sent and shown once it
  went out.
- `still.webp`: Standing-Idle frame 0, for `prefers-reduced-motion: reduce` (~4 kB).

Made with `node tools/contact-figure.mjs apps/cv/public/assets/gifs <out-dir>` (PNG frames), then
`img2webp -loop 1 -min_size -lossy -q 70 -m 6 $(cat <out-dir>/idle.txt) -o idle.webp`, the same with `-q 75`
for `cheer.txt` → `cheer.webp`, and `cwebp -q 80 <out-dir>/idle-000.png -o still.webp`. The cut was picked on
`/gif-preview-2.html`.
