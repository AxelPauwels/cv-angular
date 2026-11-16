import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import {
  FieldTree,
  form,
  FormField,
  FormRoot,
  TreeValidationResult,
} from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@tolgee/ngx';
import { PageLayout, PageTitle } from '@cv/shared-ui-page';
import {
  CONTACT_LIMITS,
  ContactMessage,
  contactSchema,
  ContactSender,
  EMPTY_CONTACT_MESSAGE,
} from '@cv/cv-data-access-contact';
import { TranslationKey } from '@cv/shared-util-i18n';

type ContactFieldName = Exclude<keyof ContactMessage, 'botcheck'>;

/**
 * The contact page: a Signal Form with validation, sent with Web3Forms. Once
 * sent, the form collapses and only the thank-you message stays.
 *
 * Errors show once a field was left (touched) or after a send attempt (which
 * touches every field); the first invalid field then gets the focus.
 */
@Component({
  selector: 'cv-contact-form',
  imports: [
    FormRoot,
    FormField,
    MatButton,
    TranslatePipe,
    PageLayout,
    PageTitle,
  ],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactForm {
  private readonly sender = inject(ContactSender);
  private readonly injector = inject(Injector);
  private readonly status =
    viewChild.required<ElementRef<HTMLElement>>('status');

  /** Parameters for the translated limits, e.g. "At most {messageMax} characters"; the translate pipe takes string params */
  protected readonly limits: Record<string, string> = Object.fromEntries(
    Object.entries(CONTACT_LIMITS).map(([key, value]) => [key, String(value)])
  );

  protected readonly model = signal<ContactMessage>({
    ...EMPTY_CONTACT_MESSAGE,
  });

  protected readonly contactForm = form(this.model, contactSchema, {
    submission: {
      action: async (field) => this._send(field),
      onInvalid: (field) => this._focusFirstInvalid(field),
    },
  });

  /** "12 of 2000 characters" under the message */
  protected readonly messageCount = computed(() => ({
    count: String(this.contactForm.message().value().length),
    max: String(CONTACT_LIMITS.messageMax),
  }));

  /** Announced once the message went out */
  protected readonly sent = signal(false);

  protected readonly fields: readonly {
    name: ContactFieldName;
    labelKey: TranslationKey;
  }[] = [
    { name: 'name', labelKey: 't.contact.field.name' },
    { name: 'email', labelKey: 't.contact.field.email' },
    { name: 'subject', labelKey: 't.contact.field.subject' },
  ];

  protected field(name: ContactFieldName): FieldTree<string> {
    return this.contactForm[name];
  }

  protected shownErrors(name: ContactFieldName) {
    const state = this.contactForm[name]();
    return state.touched() ? state.errors() : [];
  }

  private async _send(
    field: FieldTree<ContactMessage>
  ): Promise<TreeValidationResult> {
    this.sent.set(false);
    try {
      await this.sender.send(field().value());
    } catch {
      // lands in the form's own errors, shown as an alert under the button
      return { kind: 'send', message: 't.contact.error.send' };
    }
    this.sent.set(true);
    field().reset({ ...EMPTY_CONTACT_MESSAGE });
    // the form collapses and turns inert, so the focus would drop to the page:
    // move it to the thank-you message instead
    afterNextRender(() => this.status().nativeElement.focus(), {
      injector: this.injector,
    });
    return null;
  }

  private _focusFirstInvalid(field: FieldTree<ContactMessage>): void {
    this.sent.set(false);
    field().errorSummary()[0]?.fieldTree().focusBoundControl();
  }
}
