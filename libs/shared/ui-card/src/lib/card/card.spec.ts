import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Card } from './card';

@Component({
  imports: [Card],
  template: `
    <ds-card title="Frameworks" icon="angular">
      <p class="projected">Body</p>
    </ds-card>
    <ds-card title="Without icon" />
    <ds-card title="Material" icon="school" iconFont="material" />
    <ds-card title="Roel Frison" subtitle="Front-end Lead" [headingLevel]="3" />
    <ds-card title="Board games" appearance="brand" />
    <ds-card title="Dutch" tag="Native" />
    <ds-card icon="angular" subtitle="Ignored"
      ><p class="projected">Body</p></ds-card
    >
  `,
})
class Host {}

describe('Card', () => {
  it('renders no header without a title, only the content', async () => {
    // Arrange
    const fixture = TestBed.createComponent(Host);

    // Act
    await fixture.whenStable();
    const headerless = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('ds-card')
    ).at(-1);

    // Assert
    expect(headerless?.querySelector('mat-card-header')).toBeNull();
    expect(
      headerless?.querySelector('.card__icon, .card__subtitle')
    ).toBeNull();
    expect(
      headerless?.querySelector('mat-card-content .projected')?.textContent
    ).toBe('Body');
  });

  it('shows the title as a heading, the icon and the projected content', async () => {
    // Arrange
    const fixture = TestBed.createComponent(Host);

    // Act
    await fixture.whenStable();
    const [withIcon, withoutIcon, material, nested, brand] = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('ds-card')
    );

    // Assert
    expect(withIcon.querySelector('h2')?.textContent?.trim()).toBe(
      'Frameworks'
    );
    const icon = withIcon.querySelector('.card__icon');
    expect(icon?.classList).toContain('cv-icon');
    expect(icon?.classList).toContain('cv-icon-angular');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
    // in Material's avatar slot, in front of the title
    expect(icon?.nextElementSibling?.classList).toContain(
      'mat-mdc-card-header-text'
    );
    expect(
      withIcon.querySelector('mat-card-content .projected')?.textContent
    ).toBe('Body');

    expect(withoutIcon.querySelector('.card__icon')).toBeNull();

    const materialIcon = material.querySelector('mat-icon.card__icon');
    expect(materialIcon?.textContent?.trim()).toBe('school');
    expect(materialIcon?.classList).toContain('material-symbols-outlined');
    expect(materialIcon?.getAttribute('aria-hidden')).toBe('true');
    expect(materialIcon?.nextElementSibling?.classList).toContain(
      'mat-mdc-card-header-text'
    );
    expect(withoutIcon.querySelector('.card__subtitle')).toBeNull();

    expect(nested.querySelector('h2')).toBeNull();
    expect(nested.querySelector('h3')?.textContent?.trim()).toBe('Roel Frison');
    expect(nested.querySelector('.card__subtitle')?.textContent?.trim()).toBe(
      'Front-end Lead'
    );

    expect(withIcon.querySelector('.card--brand')).toBeNull();
    expect(brand.querySelector('mat-card.card--brand')).not.toBeNull();
  });

  it('sizes the title with the title-medium type scale (1rem)', async () => {
    // Arrange
    const fixture = TestBed.createComponent(Host);
    // Material's theme isn't loaded in a unit test: set the variable the title uses
    (fixture.nativeElement as HTMLElement).style.setProperty(
      '--mat-sys-title-medium-size',
      '17px'
    );

    // Act
    await fixture.whenStable();
    const title = (fixture.nativeElement as HTMLElement).querySelector(
      'h2'
    ) as HTMLElement;

    // Assert
    expect(getComputedStyle(title).fontSize).toBe('17px');
  });
});

@Component({
  imports: [Card],
  template: `
    <ds-card title="Roel Frison" initials="RF" />
    <ds-card title="Both" icon="angular" initials="BO" />
  `,
})
class InitialsHost {}

describe('Card initials', () => {
  it('shows the initials in the avatar, in front of the title, unless there is an icon', async () => {
    // Arrange
    const fixture = TestBed.createComponent(InitialsHost);

    // Act
    await fixture.whenStable();
    const [person, both] = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('ds-card')
    );

    // Assert
    const avatar = person.querySelector('.card__icon--initials');
    expect(avatar?.textContent?.trim()).toBe('RF');
    expect(avatar?.getAttribute('aria-hidden')).toBe('true');
    expect(avatar?.nextElementSibling?.classList).toContain(
      'mat-mdc-card-header-text'
    );

    expect(both.querySelector('.card__icon--initials')).toBeNull();
    expect(both.querySelector('.cv-icon-angular')).not.toBeNull();
  });

  it('shows a tag on the title line, inside the heading', async () => {
    // Arrange
    const fixture = TestBed.createComponent(Host);

    // Act
    await fixture.whenStable();
    const cards = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('ds-card')
    );
    const tagged = cards.find((card) => card.querySelector('.card__tag'));

    // Assert
    expect(tagged?.querySelector('h2 .card__tag')?.textContent?.trim()).toBe(
      'Native'
    );
    expect(tagged?.querySelector('h2')?.textContent?.trim()).toBe(
      'Dutch Native'
    );
    expect(
      cards.filter((card) => card.querySelector('.card__tag')).length
    ).toBe(1);
  });
});
