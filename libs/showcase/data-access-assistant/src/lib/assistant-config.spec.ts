import { TestBed } from '@angular/core/testing';
import {
  ASSISTANT_CONFIG,
  provideAssistantConfig,
  type AssistantConfig,
} from './assistant-config';

const complete: AssistantConfig = {
  firebase: { apiKey: 'key', projectId: 'project', appId: 'app' },
  recaptchaSiteKey: 'site-key',
  model: 'gemini-test',
};

function configWith(config: AssistantConfig | null) {
  TestBed.configureTestingModule({
    providers: [provideAssistantConfig(config)],
  });
  return TestBed.inject(ASSISTANT_CONFIG);
}

describe('provideAssistantConfig', () => {
  it('provides a complete config', () => {
    expect(configWith(complete)).toBe(complete);
  });

  it('switches the assistant off when a value is missing', () => {
    expect(configWith({ ...complete, recaptchaSiteKey: '' })).toBeNull();
  });
});
