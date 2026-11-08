import { TestBed } from '@angular/core/testing';
import { provideTolgee, Tolgee } from '@tolgee/ngx';
import { FontSwitcher } from './font-switcher';

describe('FontSwitcher', () => {
  async function render(font: string) {
    TestBed.configureTestingModule({
      providers: [
        provideTolgee(() =>
          Tolgee().init({
            language: 'en',
            staticData: { en: { t: { font: { switch: 'Font' } } } },
          })
        ),
      ],
    });
    const fixture = TestBed.createComponent(FontSwitcher);
    fixture.componentRef.setInput('fonts', [
      { id: 'red-hat', label: 'Red Hat Display' },
      { id: 'goldman', label: 'Goldman' },
    ]);
    fixture.componentRef.setInput('font', font);
    await fixture.whenStable();
    const trigger: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    return { fixture, trigger };
  }

  /** The menu renders in an overlay outside the component, hence `document` */
  async function openMenu(
    fixture: { whenStable(): Promise<unknown> },
    trigger: HTMLButtonElement
  ) {
    trigger.click();
    await fixture.whenStable();
    return Array.from(
      document.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]')
    );
  }

  it('is a labelled menu button', async () => {
    // Arrange
    const font = 'red-hat';

    // Act
    const { trigger } = await render(font);

    // Assert
    expect(trigger.getAttribute('aria-label')).toBe('Font');
  });

  it('lists the fonts in their own face and marks the active one', async () => {
    // Arrange
    const { fixture, trigger } = await render('goldman');

    // Act
    const labels = (await openMenu(fixture, trigger)).map((item) =>
      item.querySelector('.font-switcher__label')
    );

    // Assert
    expect(labels.map((label) => label?.textContent?.trim())).toEqual([
      'Red Hat Display',
      'Goldman',
    ]);
    expect(labels.map((label) => label?.getAttribute('data-font'))).toEqual([
      'red-hat',
      'goldman',
    ]);
    expect(
      Array.from(document.querySelectorAll('[role="menuitemradio"]'), (item) =>
        item.getAttribute('aria-checked')
      )
    ).toEqual(['false', 'true']);
  });

  it('emits the chosen font', async () => {
    // Arrange
    const { fixture, trigger } = await render('red-hat');
    const chosen: string[] = [];
    fixture.componentInstance.fontChange.subscribe((id) => chosen.push(id));

    // Act
    const items = await openMenu(fixture, trigger);
    items[1].click();

    // Assert
    expect(chosen).toEqual(['goldman']);
  });

  it('emits a reset from the last menu item', async () => {
    // Arrange
    const { fixture, trigger } = await render('red-hat');
    let resets = 0;
    fixture.componentInstance.fontReset.subscribe(() => resets++);

    // Act
    await openMenu(fixture, trigger);
    document.querySelector<HTMLButtonElement>('.font-switcher__reset')?.click();

    // Assert
    expect(resets).toBe(1);
  });
});
