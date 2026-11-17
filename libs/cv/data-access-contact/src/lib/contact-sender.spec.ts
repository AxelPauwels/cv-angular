import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideContact } from './contact-config';
import { ContactSender, WEB3FORMS_ENDPOINT } from './contact-sender';
import { EMPTY_CONTACT_MESSAGE } from './types/contact-message';

const message = {
  ...EMPTY_CONTACT_MESSAGE,
  name: ' Ada ',
  email: 'ada@example.com ',
  subject: 'Hi',
  message: 'A message of twenty characters or more ',
};

function setup(web3formsAccessKey: string) {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideContact({ web3formsAccessKey }),
    ],
  });
  return {
    sender: TestBed.inject(ContactSender),
    http: TestBed.inject(HttpTestingController),
  };
}

describe('ContactSender', () => {
  it('posts the trimmed message with the access key to Web3Forms', async () => {
    // Arrange
    const { sender, http } = setup('key');

    // Act
    const sent = sender.send(message);
    const request = http.expectOne(WEB3FORMS_ENDPOINT);
    request.flush({ success: true });

    // Assert
    await expect(sent).resolves.toBeUndefined();
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      access_key: 'key',
      from_name: 'cv website',
      name: 'Ada',
      email: 'ada@example.com',
      replyto: 'ada@example.com',
      subject: 'Hi',
      message: 'A message of twenty characters or more',
      botcheck: false,
    });
  });

  it('rejects when Web3Forms refuses the message', async () => {
    // Arrange
    const { sender, http } = setup('key');

    // Act
    const sent = sender.send(message);
    http.expectOne(WEB3FORMS_ENDPOINT).flush({ success: false });

    // Assert
    await expect(sent).rejects.toThrow('Web3Forms refused the message');
  });

  it('rejects without a request when no access key is configured', async () => {
    // Arrange
    const { sender, http } = setup('');

    // Act
    const sent = sender.send(message);

    // Assert
    await expect(sent).rejects.toThrow('No Web3Forms access key configured');
    http.expectNone(WEB3FORMS_ENDPOINT);
  });
});
