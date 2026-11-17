import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CONTACT_CONFIG } from './contact-config';
import { ContactMessage } from './types/contact-message';

export const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

interface Web3FormsResponse {
  success: boolean;
  message?: string;
}

/**
 * Sends a contact message with Web3Forms: the site is static (Firebase Spark),
 */
@Service()
export class ContactSender {
  private readonly http = inject(HttpClient);
  private readonly config = inject(CONTACT_CONFIG);

  /** Resolves once Web3Forms accepted the message, rejects otherwise */
  async send(message: ContactMessage): Promise<void> {
    const accessKey = this.config.web3formsAccessKey;
    if (!accessKey) {
      throw new Error('No Web3Forms access key configured');
    }

    const response = await firstValueFrom(
      this.http.post<Web3FormsResponse>(
        WEB3FORMS_ENDPOINT,
        {
          access_key: accessKey,
          from_name: 'cv website',
          name: message.name.trim(),
          email: message.email.trim(),
          replyto: message.email.trim(),
          subject: message.subject.trim(),
          message: message.message.trim(),
          botcheck: message.botcheck,
        },
        { headers: { Accept: 'application/json' } }
      )
    );

    if (!response.success) {
      throw new Error(response.message ?? 'Web3Forms refused the message');
    }
  }
}
