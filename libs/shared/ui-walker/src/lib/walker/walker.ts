import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { walkDuration } from './walk-speed';

export type WalkDirection = 'left' | 'right';

/** A walking loop that walks in place, cropped to the figure */
export interface WalkerImage {
  readonly src: string;
  /** Its size on screen, in px (the image itself is twice as big) */
  readonly width: number;
  readonly height: number;
  /** How fast it moves across the screen, in px/ms, so its feet don't slide */
  readonly speed: number;
  /** Lifts this figure's feet above the walking line, in px (default 0) */
  readonly lift?: number;
}

/**
 * A speed factor from a screen width up (the widest matching one applies),
 * to tune the walking speed per breakpoint; 1 keeps the planted-foot speed,
 * other values let the feet slide a little
 */
export interface WalkerSpeedFactor {
  readonly minWidth: number;
  readonly factor: number;
}

/** The factor for this viewport width: the widest breakpoint it reaches */
export function speedFactor(
  factors: readonly WalkerSpeedFactor[],
  viewportWidth: number
): number {
  return (
    [...factors]
      .sort((a, b) => b.minWidth - a.minWidth)
      .find(({ minWidth }) => viewportWidth >= minWidth)?.factor ?? 1
  );
}

/** Where the figure is at the start and end of a walk in each direction */
const KEYFRAMES: Record<WalkDirection, Keyframe[]> = {
  left: [
    { transform: 'translateX(100vw)' },
    { transform: 'translateX(-100%)' },
  ],
  right: [
    { transform: 'translateX(-100%)' },
    { transform: 'translateX(100vw)' },
  ],
};

/**
 * A decorative figure that walks across the bottom of the viewport, one walk
 * at a time and turning around after each: `first` sets the first direction
 * and `pauses` the waits before each walk (once the page has loaded); the last
 * pause repeats for every walk after it. Only ever one figure on screen.
 *
 * The images are walking loops that walk in place; the page moves them, as a
 * transform on the compositor. Each walk first waits its pause and only then
 * loads its image (the first pause starts once the page has fully loaded and
 * the browser is idle), so it never competes with the page's own loading; never
 * when the visitor asked to save data. Leave it out
 * when the visitor wants reduced motion. `--ds-walker-bottom` lifts the path
 * the feet walk on above the bottom of the viewport.
 */
@Component({
  selector: 'ds-walker',
  templateUrl: './walker.html',
  styleUrl: './walker.scss',
  host: {
    'aria-hidden': 'true',
    '[style.--ds-walker-height.px]': 'height()',
  },
})
export class Walker {
  /** The walking loop facing left */
  readonly left = input.required<WalkerImage>();
  /** The walking loop facing right */
  readonly right = input.required<WalkerImage>();
  /** The direction of the first walk */
  readonly first = input<WalkDirection>('left');
  /** The wait before each walk in ms; the last one repeats */
  readonly pauses = input<readonly number[]>([2_000, 6_000]);
  /** Speed factors per breakpoint, on top of each image's own speed */
  readonly speedFactors = input<readonly WalkerSpeedFactor[]>([]);

  /** The strip is as high as the taller (lifted) figure */
  protected readonly height = computed(() =>
    Math.max(
      this.left().height + (this.left().lift ?? 0),
      this.right().height + (this.right().lift ?? 0)
    )
  );
  private readonly figure =
    viewChild.required<ElementRef<HTMLImageElement>>('figure');

  constructor() {
    const document = inject(DOCUMENT);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const window = document.defaultView;
      if (!window || saveData(window)) {
        return;
      }
      const stop = new AbortController();
      const cancel = afterPageLoad(window, () => {
        this._walk(window, stop.signal).catch(() => undefined);
      });
      destroyRef.onDestroy(() => {
        cancel();
        stop.abort();
      });
    });
  }

  /** Walks back and forth until `stop` aborts */
  private async _walk(window: Window, stop: AbortSignal): Promise<void> {
    const figure = this.figure().nativeElement;
    let direction = this.first();
    let walks = 0;
    let previous: Animation | undefined;

    while (!stop.aborted) {
      const pauses = this.pauses();
      const pause = pauses[Math.min(walks, pauses.length - 1)] ?? 0;
      // first the pause, then the image: so its download never competes with
      // the page's own (the first walk's starts a pause after the page is idle)
      await sleep(window, pause, stop);
      const image = direction === 'left' ? this.left() : this.right();
      await preload(window.document, image.src);
      if (stop.aborted) {
        return;
      }
      figure.src = image.src;
      figure.style.inlineSize = `${image.width}px`;
      figure.style.blockSize = `${image.height}px`;
      figure.style.insetBlockEnd = `${image.lift ?? 0}px`;
      await figure.decode();

      const animation = figure.animate(KEYFRAMES[direction], {
        // read at the start of every walk, so a resized window walks at the same speed
        duration: walkDuration(
          window.innerWidth,
          image.width,
          image.speed * speedFactor(this.speedFactors(), window.innerWidth)
        ),
        easing: 'linear',
        // off screen at the end, until the next walk replaces it
        fill: 'forwards',
      });
      previous?.cancel();
      previous = animation;
      const cancel = () => animation.cancel();
      stop.addEventListener('abort', cancel, { once: true });
      // rejects when cancelled, which ends the walk
      await animation.finished;
      stop.removeEventListener('abort', cancel);

      walks++;
      direction = direction === 'left' ? 'right' : 'left';
    }
  }
}

/** Waits `ms`; rejects when `stop` aborts */
function sleep(window: Window, ms: number, stop: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const id = window.setTimeout(resolve, ms);
    stop.addEventListener(
      'abort',
      () => {
        window.clearTimeout(id);
        reject(stop.reason);
      },
      { once: true }
    );
  });
}

/** Downloads and decodes an image without showing it, at low priority */
async function preload(document: Document, src: string): Promise<void> {
  const image = document.createElement('img');
  image.fetchPriority = 'low';
  image.src = src;
  await image.decode();
}

/** The visitor asked to save data (e.g. on a metered connection) */
function saveData(window: Window): boolean {
  const { connection } = window.navigator as Navigator & {
    connection?: { saveData?: boolean };
  };
  return connection?.saveData === true;
}

/**
 * Runs `callback` once the page and all its resources have loaded and the
 * browser is idle. Returns a function that cancels it.
 */
function afterPageLoad(window: Window, callback: () => void): () => void {
  const controller = new AbortController();
  let cancelIdle: () => void = () => undefined;

  const whenIdle = () => {
    // Safari has no requestIdleCallback
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(callback, { timeout: 5_000 });
      cancelIdle = () => window.cancelIdleCallback(id);
    } else {
      const id = window.setTimeout(callback, 200);
      cancelIdle = () => window.clearTimeout(id);
    }
  };

  if (window.document.readyState === 'complete') {
    whenIdle();
  } else {
    window.addEventListener('load', whenIdle, {
      once: true,
      signal: controller.signal,
    });
  }

  return () => {
    controller.abort();
    cancelIdle();
  };
}
