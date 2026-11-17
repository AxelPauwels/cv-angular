import {
  email,
  maxLength,
  minLength,
  required,
  schema,
} from '@angular/forms/signals';
import { CONTACT_LIMITS, ContactMessage } from './types/contact-message';

export const contactSchema = schema<ContactMessage>((path) => {
  required(path.name, { message: 't.contact.error.name.required' });
  maxLength(path.name, CONTACT_LIMITS.nameMax, {
    message: 't.contact.error.name.max-length',
  });

  required(path.email, { message: 't.contact.error.email.required' });
  email(path.email, { message: 't.contact.error.email.invalid' });

  required(path.subject, { message: 't.contact.error.subject.required' });
  maxLength(path.subject, CONTACT_LIMITS.subjectMax, {
    message: 't.contact.error.subject.max-length',
  });

  required(path.message, { message: 't.contact.error.message.required' });
  minLength(path.message, CONTACT_LIMITS.messageMin, {
    message: 't.contact.error.message.min-length',
  });
  maxLength(path.message, CONTACT_LIMITS.messageMax, {
    message: 't.contact.error.message.max-length',
  });
});
