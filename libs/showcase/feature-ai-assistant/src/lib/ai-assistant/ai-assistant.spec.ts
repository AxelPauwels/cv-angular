import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideI18nTesting } from '@cv/shared-data-access-i18n';
import { provideAssistantConfig } from '@cv/showcase-data-access-assistant';
import { AiAssistant, withoutInvisibleCharacters } from './ai-assistant';

async function render(configured: boolean): Promise<HTMLElement> {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideI18nTesting(),
      provideAssistantConfig(
        configured
          ? {
              firebase: { apiKey: 'key', projectId: 'project', appId: 'app' },
              recaptchaSiteKey: 'site-key',
              model: 'gemini-test',
            }
          : null
      ),
    ],
  });
  const fixture = TestBed.createComponent(AiAssistant);
  await fixture.whenStable();
  return fixture.nativeElement;
}

describe('AiAssistant', () => {
  it('says it is switched off without a config, and offers no form', async () => {
    // Act
    const element = await render(false);

    // Assert
    expect(element.textContent).toContain('switched off');
    expect(element.querySelector('form')).toBeNull();
  });

  it('offers suggestions and a labelled question field', async () => {
    // Act
    const element = await render(true);
    const field = element.querySelector('textarea');
    const label = element.querySelector(`label[for="${field?.id}"]`);

    // Assert
    expect(
      element.querySelectorAll('.ai-assistant__suggestions button')
    ).toHaveLength(3);
    expect(label?.textContent?.trim()).toBe('Your question');
    expect(field?.maxLength).toBe(500);
    expect(element.querySelector('[role="log"]')).not.toBeNull();
  });

  it('keeps the send button disabled while the question is empty', async () => {
    // Act
    const element = await render(true);
    const send = element.querySelector<HTMLButtonElement>(
      'button[type="submit"]'
    );

    // Assert
    expect(send?.disabled).toBe(true);
  });

  it('drops the invisible characters Tolgee hides in texts', () => {
    expect(withoutInvisibleCharacters('Hi\u200C\u200D\u200B\uFEFF?')).toBe(
      'Hi?'
    );
  });
});
