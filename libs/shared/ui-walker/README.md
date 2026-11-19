# shared-ui-walker

`ds-walker`: a decorative figure that walks across the bottom of the viewport,
one walk at a time and turning around after each. `first` sets the direction of
the first walk and `pauses` the waits before each walk (the last one repeats).
It takes two walking loops (`WalkerImage`: an animated WebP cropped to the
figure, its on-screen size and its speed, see `apps/cv/public/assets/walker`).
The first loads only after the page has fully loaded and the browser is idle;
the other one during the pause before its walk. `--ds-walker-bottom` lifts the
path its feet walk on.

Each image walks at its own speed, the speed of its planted foot, so the feet
never slide: `walkSpeed(framePxPerMs)` for a gait's speed in the 512px GIF
frames, `WALK_SPEED_PX_PER_MS` for the normal walk (about 15 seconds across a
1200px screen) and `walkDuration(viewportWidth, figureWidth, speed)` in ms.

Run `nx test shared-ui-walker` to execute the unit tests.
