import {
  WALK_SPEED_PX_PER_MS,
  WalkerImage,
  WalkerSpeedFactor,
  walkSpeed,
} from '@cv/shared-ui-walker';

/**
 * The walking loops of the figure on every page, see
 * apps/cv/public/assets/walker/README.md for how they were made
 */
export const WALKER_IMAGES = {
  /** A normal walk to the left */
  left: {
    src: '/assets/walker/walking-left.webp',
    width: 98.5,
    height: 131,
    speed: WALK_SPEED_PX_PER_MS,
  },
  /**
   * Carrying the ZoneJs sign to the right: a slow, heavy walk, whose planted
   * foot moves 0.072 px/ms in the GIF frames (the speed of the preview page)
   */
  right: {
    src: '/assets/walker/carrying-zonejs-right.webp',
    width: 78,
    height: 114,
    speed: walkSpeed(0.072),
    // his feet sit a little low in this image
    lift: 2,
  },
} as const satisfies Record<'left' | 'right', WalkerImage>;

/**
 * The waits before each walk, in ms: once the page has loaded he carries the
 * sign to the right, walks back to the left 1 second later, to the right again
 * after 2 minutes, and from then on turns around every 4 minutes
 */
export const WALKER_PAUSES: readonly number[] = [
  2_000, 1_000, 120_000, 240_000,
];

/**
 * Speed per breakpoint (apps/cv/src/styles/1.settings/_breakpoints.scss), on
 * top of each walk's own speed: both figures move the same pixels per second
 * on every screen width, so a walk takes longer on a wider screen. 1 is the
 * speed of the planted foot, where the feet don't slide; tune a breakpoint
 * here to walk faster (above 1) or slower there.
 */
export const WALKER_SPEED_FACTORS: readonly WalkerSpeedFactor[] = [
  { minWidth: 0, factor: 1 }, // phones
  { minWidth: 768, factor: 1 }, // tablets (md)
  { minWidth: 1200, factor: 1 }, // desktops (xl)
];

/** How far the figure's feet sink into the footer, so he walks on it */
export const WALKER_FEET_IN_FOOTER_PX = 8;
