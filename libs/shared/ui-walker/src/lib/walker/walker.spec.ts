import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { speedFactor, Walker, WalkerImage } from './walker';
import { walkDuration, walkSpeed, WALK_SPEED_PX_PER_MS } from './walk-speed';

// a 1×1 transparent GIF, so the images load without a network request; the
// fragments tell the two directions apart
const GIF =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const LEFT: WalkerImage = {
  src: `${GIF}#left`,
  width: 98.5,
  height: 131,
  speed: WALK_SPEED_PX_PER_MS,
};
// a slower, smaller figure, like the one carrying the sign
const RIGHT: WalkerImage = {
  src: `${GIF}#right`,
  width: 78,
  height: 114,
  speed: walkSpeed(0.072),
  lift: 2,
};
const PAUSES = [100, 200, 300, 400] as const;

@Component({
  imports: [Walker],
  template: `<ds-walker
    [left]="left"
    [right]="right"
    first="right"
    [pauses]="pauses" />`,
})
class Host {
  readonly left = LEFT;
  readonly right = RIGHT;
  readonly pauses = PAUSES;
}

describe('Walker', () => {
  afterEach(() => vi.restoreAllMocks());

  async function render() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const walker = (fixture.nativeElement as HTMLElement).querySelector(
      'ds-walker'
    ) as HTMLElement;
    const figure = walker.querySelector('img') as HTMLImageElement;
    return { fixture, walker, figure };
  }

  /** Waits for the walk after `previous` to start */
  async function nextWalk(figure: HTMLImageElement, previous?: Animation) {
    const waitStart = performance.now();
    let walk: Animation | undefined;
    await vi.waitFor(() => {
      walk = figure.getAnimations().find((a) => a !== previous);
      expect(walk).toBeTruthy();
    });
    const animation = walk as Animation;
    const timing = animation.effect?.getComputedTiming();
    const [from, to] = (animation.effect as KeyframeEffect).getKeyframes();
    return {
      animation,
      // how long it took to start: the pause, then the image
      waited: performance.now() - waitStart,
      src: figure.src,
      width: figure.style.inlineSize,
      delay: Number(timing?.delay),
      duration: Number(timing?.duration),
      from: from['transform'],
      to: to['transform'],
    };
  }

  /** Finishes `walk` and returns the next one */
  async function then(
    figure: HTMLImageElement,
    walk: Awaited<ReturnType<typeof nextWalk>>
  ) {
    walk.animation.finish();
    return nextWalk(figure, walk.animation);
  }

  it('is decorative and never in the way, as high as the taller figure', async () => {
    // Act
    const { walker, figure } = await render();

    // Assert
    expect(walker.getAttribute('aria-hidden')).toBe('true');
    expect(figure.getAttribute('alt')).toBe('');
    expect(getComputedStyle(walker).pointerEvents).toBe('none');
    expect(getComputedStyle(walker).position).toBe('fixed');
    expect(getComputedStyle(walker).height).toBe('131px');
    // the lifted figure walks 2px higher
    const first = await nextWalk(figure);
    expect(first.src).toBe(RIGHT.src);
    expect(figure.style.insetBlockEnd).toBe('2px');
  });

  it('starts with the first direction and turns around after each walk, at each image’s own speed', async () => {
    // Arrange
    const { figure } = await render();

    // Act + Assert: in from the left first, as the smaller, slower figure
    const first = await nextWalk(figure);
    expect(first).toMatchObject({
      src: RIGHT.src,
      width: '78px',
      duration: walkDuration(innerWidth, RIGHT.width, RIGHT.speed),
      from: 'translateX(-100%)',
      to: 'translateX(100vw)',
    });

    // back from the right, as the other figure
    const second = await then(figure, first);
    expect(second).toMatchObject({
      src: LEFT.src,
      width: '98.5px',
      duration: walkDuration(innerWidth, LEFT.width, LEFT.speed),
      from: 'translateX(100vw)',
      to: 'translateX(-100%)',
    });
    expect(figure.getAnimations()).toHaveLength(1); // never two figures
  });

  it('waits the given pause before each walk, then loads its image, and repeats the last pause', async () => {
    // Arrange
    const { figure } = await render();

    // Act
    const walks = [await nextWalk(figure)];
    for (let i = 0; i < 4; i++) {
      walks.push(await then(figure, walks[walks.length - 1]));
    }

    // Assert: each walk starts after its pause (and its image, at once here);
    // the first pause counts from when the page was idle, before the wait started
    const expected = [100, 200, 300, 400, 400];
    walks.forEach((walk, i) => {
      expect(walk.delay).toBe(0);
      if (i > 0) {
        expect(walk.waited).toBeGreaterThanOrEqual(expected[i] - 20);
        expect(walk.waited).toBeLessThan(expected[i] + 250);
      }
    });
    expect(walks.map((walk) => walk.src)).toEqual([
      RIGHT.src,
      LEFT.src,
      RIGHT.src,
      LEFT.src,
      RIGHT.src,
    ]);
  });

  it('stops walking once removed', async () => {
    // Arrange
    const { fixture, figure } = await render();
    const { animation } = await nextWalk(figure);

    // Act
    fixture.destroy();

    // Assert
    expect(animation.playState).toBe('idle');
  });

  it('never loads an image when the visitor asked to save data', async () => {
    // Arrange
    vi.spyOn(
      navigator as Navigator & { connection?: unknown },
      'connection',
      'get'
    ).mockReturnValue({ saveData: true });

    // Act
    const { figure } = await render();
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Assert
    expect(figure.getAttribute('src')).toBeNull();
    expect(figure.getAnimations()).toHaveLength(0);
  });

  it('crosses a 1200px screen in about 15 seconds at the normal walk, narrower screens faster', () => {
    expect(walkDuration(1200, LEFT.width)).toBeGreaterThan(14_500);
    expect(walkDuration(1200, LEFT.width)).toBeLessThan(15_500);
    expect(walkDuration(375, LEFT.width)).toBeLessThan(
      walkDuration(1200, LEFT.width)
    );
    // the slow, heavy walk takes longer over the same screen
    expect(walkDuration(1200, RIGHT.width, RIGHT.speed)).toBeGreaterThan(
      walkDuration(1200, LEFT.width)
    );
  });

  it('picks the speed factor of the widest breakpoint a screen reaches', () => {
    // Arrange
    const factors = [
      { minWidth: 768, factor: 1.2 },
      { minWidth: 0, factor: 0.8 },
      { minWidth: 1200, factor: 1.5 },
    ];

    // Act + Assert
    expect(speedFactor(factors, 375)).toBe(0.8);
    expect(speedFactor(factors, 768)).toBe(1.2);
    expect(speedFactor(factors, 1440)).toBe(1.5);
    expect(speedFactor([], 1440)).toBe(1);
  });

  it('uses the first image for the first walk only, then the normal figures', async () => {
    // Arrange
    @Component({
      imports: [Walker],
      template: `<ds-walker
        [left]="left"
        [right]="normalRight"
        [firstImage]="carrying"
        first="right"
        [pauses]="pauses" />`,
    })
    class IntroHost {
      readonly left = LEFT;
      readonly normalRight = { ...LEFT, src: `${GIF}#normal-right` };
      readonly carrying = RIGHT;
      readonly pauses = [0, 0];
    }
    const fixture = TestBed.createComponent(IntroHost);
    await fixture.whenStable();
    const figure = (fixture.nativeElement as HTMLElement).querySelector(
      'ds-walker img'
    ) as HTMLImageElement;

    // Act
    const walks = [await nextWalk(figure)];
    for (let i = 0; i < 2; i++) {
      walks.push(await then(figure, walks[walks.length - 1]));
    }

    // Assert: carrying to the right, then left, then the normal walk to the right
    expect(walks.map((walk) => walk.src)).toEqual([
      RIGHT.src,
      LEFT.src,
      `${GIF}#normal-right`,
    ]);
    expect(walks[2].from).toBe('translateX(-100%)');
  });
});
