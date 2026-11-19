import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideSignalFormsConfig } from '@angular/forms/signals';
import { NG_STATUS_CLASSES } from '@angular/forms/signals/compat';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { provideContact, WEB3FORMS_ENDPOINT } from '@cv/cv-data-access-contact';
import { ContactForm } from './contact-form';

/** The submission action resolves after the response: let it finish and render */
async function settle(fixture: { whenStable(): Promise<unknown> }) {
  await new Promise((resolve) => setTimeout(resolve));
  await fixture.whenStable();
}

async function setup() {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideI18nTesting(),
      provideContact({ web3formsAccessKey: 'test-key' }),
      provideSignalFormsConfig({ classes: NG_STATUS_CLASSES }),
    ],
  });
  const http = TestBed.inject(HttpTestingController);
  const fixture = TestBed.createComponent(ContactForm);
  await fixture.whenStable();
  const element: HTMLElement = fixture.nativeElement;

  const control = (id: string) => {
    const found = element.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      `#contact-${id}`
    );
    if (!found) {
      throw new Error(`No field #contact-${id}`);
    }
    return found;
  };
  const type = async (id: string, value: string) => {
    const input = control(id);
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
  };
  const send = async () => {
    element.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await fixture.whenStable();
  };
  const errors = (id: string) =>
    Array.from(element.querySelectorAll(`#contact-${id}-errors li`), (li) =>
      li.textContent?.trim()
    );

  const fillIn = async () => {
    await type('name', 'Ada Lovelace');
    await type('email', 'ada@example.com');
    await type('subject', 'A project');
    await type('message', 'I would like to work together on an app.');
  };
  const status = (role: 'status' | 'alert') =>
    element.querySelector(`[role="${role}"]`)?.textContent?.trim();

  return {
    fixture,
    element,
    control,
    type,
    send,
    errors,
    http,
    fillIn,
    status,
  };
}

describe('ContactForm', () => {
  it('labels every field and shows no errors before the visitor did anything', async () => {
    // Arrange
    const { element, control } = await setup();

    // Act
    const labels = Array.from(
      element.querySelectorAll('.contact-form__label'),
      (label) => label.textContent?.replace('*', '').trim()
    );

    // Assert
    expect(element.querySelector('h1')?.textContent?.trim()).toBe('Contact');
    expect(labels).toEqual(['Name', 'Email', 'Subject', 'Message']);
    expect(control('email').type).toBe('email');
    // every field reserves its (empty) error line, so nothing shifts when errors come
    expect(element.querySelectorAll('.contact-form__errors')).toHaveLength(4);
    expect(element.querySelectorAll('.contact-form__errors li')).toHaveLength(
      0
    );
  });

  it('shows the errors of a field once it was left', async () => {
    // Arrange
    const { type, errors, control } = await setup();

    // Act
    await type('email', 'not-an-email');
    await type('message', 'Too short');

    // Assert
    expect(errors('email')).toEqual([
      'Enter a valid email address, like name@example.com.',
    ]);
    expect(errors('message')).toEqual(['Write at least 20 characters.']);
    expect(control('email').getAttribute('aria-invalid')).toBe('true');
    expect(control('email').getAttribute('aria-describedby')).toBe(
      'contact-email-errors'
    );
    expect(control('email').classList).toContain('ng-invalid');
    expect(errors('name')).toEqual([]);
  });

  it('does not send an invalid form, shows all errors and focuses the first invalid field', async () => {
    // Arrange
    const { send, errors, control, http } = await setup();

    // Act
    await send();

    // Assert
    http.expectNone(WEB3FORMS_ENDPOINT);
    expect(errors('name')).toEqual(['Enter your name.']);
    expect(errors('subject')).toEqual(['Enter a subject.']);
    expect(errors('message')).toEqual(['Enter a message.']);
    expect(document.activeElement).toBe(control('name'));
  });

  it('sends a valid form to Web3Forms, confirms it and empties the form', async () => {
    // Arrange
    const { fixture, element, fillIn, send, http, status, control } =
      await setup();
    await fillIn();
    const cheer = () => element.querySelector('.contact-form__cheer img');
    expect(cheer()).toBeNull();

    // Act
    await send();
    const request = http.expectOne(WEB3FORMS_ENDPOINT);
    request.flush({ success: true });
    await settle(fixture);

    // Assert
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(
      expect.objectContaining({
        access_key: 'test-key',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        replyto: 'ada@example.com',
        subject: 'A project',
        message: 'I would like to work together on an app.',
        botcheck: false,
      })
    );
    expect(status('status')).toBe(
      'Thanks! Your message has been sent. I will get back to you soon.'
    );
    expect(control('name').value).toBe('');
    // the form collapses and is out of reach; the focus moves to the message
    const body = element.querySelector<HTMLElement>('.contact-form__body');
    expect(body?.classList).toContain('contact-form__body--collapsed');
    expect(body?.inert).toBe(true);
    expect(document.activeElement).toBe(
      element.querySelector('[role="status"]')
    );
    // he drops in and cheers, decorative only; reduce motion gets the still
    expect(cheer()?.getAttribute('src')).toBe(
      '/assets/contact/drop-in-cheer.webp'
    );
    expect(cheer()?.getAttribute('alt')).toBe('');
    expect(
      element
        .querySelector('.contact-form__cheer source')
        ?.getAttribute('media')
    ).toBe('(prefers-reduced-motion: reduce)');
    http.verify();
  });

  it('shows an alert when Web3Forms refuses the message, and keeps it', async () => {
    // Arrange
    const { fixture, element, fillIn, send, http, status, control } =
      await setup();
    await fillIn();

    // Act
    await send();
    http
      .expectOne(WEB3FORMS_ENDPOINT)
      .flush({ success: false, message: 'Invalid key' });
    await settle(fixture);

    // Assert
    expect(status('alert')).toBe(
      'Your message could not be sent. Try again later, or reach me on LinkedIn.'
    );
    expect(status('status')).toBe('');
    expect(control('name').value).toBe('Ada Lovelace');
    // the form stays open to try again
    const body = element.querySelector<HTMLElement>('.contact-form__body');
    expect(body?.classList).not.toContain('contact-form__body--collapsed');
    expect(body?.inert).toBe(false);
    expect(element.querySelector('.contact-form__cheer')).toBeNull();
  });
});
