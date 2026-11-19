/**
 * On-screen scale of a walking figure: the original 512px GIF frames shown at
 * 240px. The walking images are cropped to the figure at twice this scale.
 */
export const WALKER_SCALE = 240 / 512;

/**
 * The on-screen speed in px/ms of a walk whose planted foot moves
 * `framePxPerMs` in the 512px GIF frames: at that speed the feet don't slide.
 */
export function walkSpeed(framePxPerMs: number): number {
  return framePxPerMs * WALKER_SCALE;
}

/**
 * The normal walk's speed (Walking-Left/Right: 0.185 px/ms in the frames),
 * about 15 seconds across a 1200px screen
 */
export const WALK_SPEED_PX_PER_MS = walkSpeed(0.185);

/**
 * How long one walk across a viewport of this width takes, in ms: from just
 * off one edge to just off the other, so narrower screens take less time
 */
export function walkDuration(
  viewportWidth: number,
  figureWidth: number,
  speed = WALK_SPEED_PX_PER_MS
): number {
  return Math.round((viewportWidth + figureWidth) / speed);
}
