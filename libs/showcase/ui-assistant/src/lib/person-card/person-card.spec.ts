import { TestBed } from '@angular/core/testing';
import { FormatSimple, provideTolgee, Tolgee } from '@tolgee/ngx';
import { initials, PersonCard } from './person-card';

// a ui lib can't use data-access-i18n: only the texts these tests read
const i18n = () =>
  provideTolgee(() =>
    Tolgee()
      .use(FormatSimple())
      .init({ language: 'en', staticData: { en: { 't.present': 'present' } } })
  );

async function render(inputs: Record<string, string>): Promise<HTMLElement> {
  TestBed.configureTestingModule({ providers: [i18n()] });
  const fixture = TestBed.createComponent(PersonCard);
  for (const [name, value] of Object.entries(inputs)) {
    fixture.componentRef.setInput(name, value);
  }
  await fixture.whenStable();
  return fixture.nativeElement;
}

describe('PersonCard', () => {
  it('shows the person, their work and an ongoing period', async () => {
    // Act
    const element = await render({
      name: 'Roel Frison',
      function: 'Lead developer',
      employer: 'Employer',
      client: 'Client',
      start: '2022-03',
      end: '',
    });

    // Assert
    expect(element.querySelector('h3')?.textContent).toContain('Roel Frison');
    expect(element.textContent).toContain('Lead developer');
    expect(element.textContent).toContain('Employer');
    expect(element.textContent).toContain('· Client');
    expect(element.textContent).toContain('2022 – present');
  });

  it('leaves out an empty client', async () => {
    // Act
    const element = await render({
      name: 'Lowie Cupers',
      function: 'Developer',
      employer: 'Employer',
      start: '2019-01',
      end: '2020-12',
    });

    // Assert
    expect(element.querySelector('.person-card__client')).toBeNull();
    expect(element.textContent).toContain('2019 – 2020');
  });

  it('takes the initials of the first and last name', () => {
    expect(initials('Jan van den Berg')).toBe('JB');
  });
});
