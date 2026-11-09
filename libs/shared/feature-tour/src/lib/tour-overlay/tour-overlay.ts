import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { Router } from '@angular/router';
import { A11yModule } from '@angular/cdk/a11y';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@tolgee/ngx';
import { FeatureToggleService, TourService } from '@cv/shared-data-access';
import { LOADING_DELAY_MS } from '@cv/shared-util-loading';
import { TourStep, TOUR_STEPS } from '../tour-steps';

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Space between the highlighted element and the edge of the spotlight */
const SPOTLIGHT_PADDING = 8;
/** Give up on a target that does not show up, and center the step instead */
const TARGET_TIMEOUT_MS = 5000;

/**
 * The guided tour: a scrim with a spotlight on the step's target, an arrow
 * pointing at it, the step's text in the middle and back/exit/next at the
 * bottom. It navigates to each step's page and waits for the target to render.
 *
 * A modal dialog: focus stays inside, Escape exits and the arrow keys step
 * back and forth. Step changes are announced through a live region.
 */
@Component({
  selector: 'shared-tour',
  imports: [A11yModule, MatButton, MatIcon, TranslatePipe],
  templateUrl: './tour-overlay.html',
  styleUrl: './tour-overlay.scss',
  host: {
    '(document:keydown)': 'onKeydown($event)',
    '(window:resize)': 'scheduleMeasure()',
    // capture, so scrolling inside any container moves the spotlight too
    '(document:scroll.capture)': 'scheduleMeasure()',
  },
})
export class TourOverlay {
  private readonly document = inject(DOCUMENT);
  private readonly window = this.document.defaultView;
  private readonly router = inject(Router);
  private readonly tour = inject(TourService);

  /** Without the steps whose feature is switched off on the admin page */
  protected readonly steps = this.visibleSteps();
  protected readonly index = signal(0);
  protected readonly step = computed(() => this.steps[this.index()]);
  protected readonly previous = computed(
    () => this.steps[this.index() - 1] as TourStep | undefined
  );
  protected readonly next = computed(
    () => this.steps[this.index() + 1] as TourStep | undefined
  );
  /** For "2 / 9": the translate pipe takes string params */
  protected readonly progress = computed(() => ({
    current: String(this.index() + 1),
    total: String(this.steps.length),
  }));

  /** The spotlight, in viewport coordinates; empty and centered without a target */
  protected readonly spotlight = signal<Box>(this.centerBox());
  protected readonly hasTarget = signal(false);
  /** Shown when a page or its target takes longer than LOADING_DELAY_MS */
  protected readonly loading = signal(false);

  /** Point down at targets in the lower half, up at the others */
  protected readonly pointer = computed(() => {
    const box = this.spotlight();
    const viewportHeight = this.window?.innerHeight ?? 0;
    const below = box.top + box.height / 2 < viewportHeight / 2;
    return {
      direction: below ? 'up' : 'down',
      left: box.left + box.width / 2,
      top: below ? box.top + box.height : box.top,
    } as const;
  });

  private targets: readonly Element[] = [];
  private readonly resizeObserver =
    typeof ResizeObserver === 'undefined'
      ? undefined
      : new ResizeObserver(() => this.scheduleMeasure());
  private frame = 0;
  /** Increased per step, so a slow page never overrides a later step */
  private run = 0;

  constructor() {
    effect(() => {
      const step = this.step();
      untracked(() => void this.show(step));
    });
    afterNextRender(() => this.scheduleMeasure());
    inject(DestroyRef).onDestroy(() => {
      this.run++;
      this.resizeObserver?.disconnect();
      if (this.frame) {
        this.window?.cancelAnimationFrame(this.frame);
      }
    });
  }

  private visibleSteps(): readonly TourStep[] {
    const toggles = inject(FeatureToggleService).states();
    return inject(TOUR_STEPS).filter(
      (step) =>
        !step.toggles?.some((toggle) => !toggles[toggle]) &&
        (!step.someToggles ||
          step.someToggles.some((toggle) => toggles[toggle]))
    );
  }

  protected goBack(): void {
    if (this.previous()) {
      this.index.update((index) => index - 1);
    }
  }

  protected goNext(): void {
    if (this.next()) {
      this.index.update((index) => index + 1);
    } else {
      this.exit();
    }
  }

  protected exit(): void {
    this.tour.stop();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.exit();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.goBack();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.goNext();
    }
  }

  /** Measure at most once per frame, however many scroll/resize events fire */
  protected scheduleMeasure(): void {
    if (!this.frame && this.window) {
      this.frame = this.window.requestAnimationFrame(() => {
        this.frame = 0;
        this.measure();
      });
    }
  }

  private async show(step: TourStep): Promise<void> {
    const run = ++this.run;
    const spinner = setTimeout(() => this.loading.set(true), LOADING_DELAY_MS);
    try {
      if (currentPath(this.router.url) !== step.route) {
        await this.router.navigateByUrl(step.route);
      }
      if (run !== this.run) {
        return;
      }
      // after navigating: every navigation closes the hamburger menu
      const inMenu = !!step.menuTarget && this.menuShown();
      this.tour.showMenu(inMenu);
      const target = inMenu ? step.menuTarget : step.target;
      const targets = target ? await this.waitFor(target, run) : [];
      if (run !== this.run) {
        return;
      }
      this.observe(targets);
      targets[0]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      this.measure();
    } finally {
      clearTimeout(spinner);
      if (run === this.run) {
        this.loading.set(false);
      }
    }
  }

  /** The hamburger menu replaces the domain tabs on phones */
  private menuShown(): boolean {
    const trigger = this.document.querySelector('[data-tour="menu"]');
    const rect = trigger?.getBoundingClientRect();
    return !!rect && (rect.width > 0 || rect.height > 0);
  }

  /** Resolves with the elements once they render (lazy pages, data), or none */
  private waitFor(selector: string, run: number): Promise<readonly Element[]> {
    const started = Date.now();
    return new Promise((resolve) => {
      const check = () => {
        const elements = [...this.document.querySelectorAll(selector)];
        if (elements.length || run !== this.run) {
          resolve(elements);
        } else if (Date.now() - started > TARGET_TIMEOUT_MS || !this.window) {
          resolve([]);
        } else {
          this.window.requestAnimationFrame(check);
        }
      };
      check();
    });
  }

  private observe(targets: readonly Element[]): void {
    for (const target of this.targets) {
      this.resizeObserver?.unobserve(target);
    }
    this.targets = targets;
    for (const target of targets) {
      this.resizeObserver?.observe(target);
    }
  }

  /** One spotlight around every rendered target */
  private measure(): void {
    const rects = this.targets
      .filter((target) => target.isConnected)
      .map((target) => target.getBoundingClientRect())
      .filter((rect) => rect.width || rect.height);
    this.hasTarget.set(rects.length > 0);
    if (!rects.length) {
      this.spotlight.set(this.centerBox());
      return;
    }
    const top = Math.min(...rects.map((rect) => rect.top));
    const left = Math.min(...rects.map((rect) => rect.left));
    const bottom = Math.max(...rects.map((rect) => rect.bottom));
    const right = Math.max(...rects.map((rect) => rect.right));
    this.spotlight.set({
      top: top - SPOTLIGHT_PADDING,
      left: left - SPOTLIGHT_PADDING,
      width: right - left + SPOTLIGHT_PADDING * 2,
      height: bottom - top + SPOTLIGHT_PADDING * 2,
    });
  }

  private centerBox(): Box {
    return {
      top: (this.window?.innerHeight ?? 0) / 2,
      left: (this.window?.innerWidth ?? 0) / 2,
      width: 0,
      height: 0,
    };
  }
}

function currentPath(url: string): string {
  return url.split(/[?#;]/)[0];
}
