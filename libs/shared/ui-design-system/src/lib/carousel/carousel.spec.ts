import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormatSimple, provideTolgee, Tolgee } from '@tolgee/ngx';
import { Carousel, CarouselItem } from './carousel';

@Component({
  imports: [Carousel, CarouselItem],
  template: `
    <div [style.width.px]="width">
      <ds-carousel label="References">
        <h2 dsCarouselTitle>IT</h2>
        @for (item of items; track item) {
          <article dsCarouselItem class="item" style="height: 50px">
            {{ item }}
          </article>
        }
      </ds-carousel>
    </div>
  `,
})
class Host {
  // narrow enough for one item per view
  width = 400;
  items = ['one', 'two', 'three', 'four', 'five'];
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 700));

describe('Carousel', () => {
  async function render(items?: string[]) {
    TestBed.configureTestingModule({
      providers: [
        provideTolgee(() =>
          Tolgee()
            .use(FormatSimple())
            .init({
              language: 'en',
              staticData: {
                en: {
                  t: {
                    carousel: {
                      carousel: 'carousel',
                      previous: 'Previous',
                      next: 'Next',
                      page: 'Page {current} of {total}',
                    },
                  },
                },
              },
            })
        ),
      ],
    });
    const fixture = TestBed.createComponent(Host);
    if (items) {
      fixture.componentInstance.items = items;
    }
    await fixture.whenStable();
    await settle();
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    return {
      fixture,
      element,
      viewport: element.querySelector<HTMLElement>('.ds-carousel__viewport'),
      controls: () =>
        Array.from(
          element.querySelectorAll<HTMLButtonElement>('.ds-carousel__button')
        ),
      dots: () =>
        Array.from(
          element.querySelectorAll<HTMLButtonElement>('.ds-carousel__dot')
        ),
    };
  }

  it('shows the title and the items as a list in a labelled carousel region', async () => {
    // Arrange
    const items = ['one', 'two', 'three', 'four', 'five'];

    // Act
    const { element, viewport } = await render(items);

    // Assert
    expect(element.querySelector('.ds-carousel__header h2')?.textContent).toBe(
      'IT'
    );
    expect(viewport?.getAttribute('role')).toBe('region');
    expect(viewport?.getAttribute('aria-label')).toBe('References');
    expect(viewport?.getAttribute('aria-roledescription')).toBe('carousel');
    expect(viewport?.getAttribute('tabindex')).toBe('0');
    const list = viewport?.querySelector('[role="list"]');
    expect(list?.querySelectorAll('[role="listitem"].item').length).toBe(5);
  });

  it('shows whole items only, one per view in a narrow carousel', async () => {
    // Arrange
    const { viewport } = await render();

    // Act
    const list = viewport?.querySelector<HTMLElement>('[role="list"]');
    const item = list?.querySelector<HTMLElement>('.item');

    // Assert
    // the list is as wide as the visible part of the scroller
    expect(item?.getBoundingClientRect().width).toBe(
      list?.getBoundingClientRect().width
    );
  });

  it('starts on the first page', async () => {
    // Arrange
    const items = ['one', 'two', 'three', 'four', 'five'];

    // Act
    const { viewport, controls, dots } = await render(items);

    // Assert
    const [previous, next] = controls();
    expect(previous.getAttribute('aria-label')).toBe('Previous');
    expect(previous.getAttribute('aria-controls')).toBe(viewport?.id);
    expect(previous.disabled).toBe(true);
    expect(next.disabled).toBe(false);
    expect(dots().length).toBe(5);
    expect(dots()[0].getAttribute('aria-current')).toBe('true');
    expect(dots()[0].getAttribute('aria-label')).toBe('Page 1 of 5');
  });

  it('steps forward with "next"', async () => {
    // Arrange
    const { fixture, viewport, controls, dots } = await render();
    const [, next] = controls();

    // Act
    next.click();
    await settle();
    await fixture.whenStable();

    // Assert
    expect(viewport?.scrollLeft).toBeGreaterThan(0);
    expect(controls()[0].disabled).toBe(false);
    expect(dots()[1].getAttribute('aria-current')).toBe('true');
    expect(dots()[0].hasAttribute('aria-current')).toBe(false);
  });

  it('jumps to a page with its dot, and disables "next" on the last one', async () => {
    // Arrange
    const { fixture, controls, dots } = await render();

    // Act
    dots()[4].click();
    await settle();
    await fixture.whenStable();

    // Assert
    expect(dots()[4].getAttribute('aria-current')).toBe('true');
    expect(controls()[1].disabled).toBe(true);
  });

  it('hides the buttons and dots when all items fit', async () => {
    // Arrange
    const items = ['only one'];

    // Act
    const { controls, dots } = await render(items);

    // Assert
    expect(controls().length).toBe(0);
    expect(dots().length).toBe(0);
  });
});
