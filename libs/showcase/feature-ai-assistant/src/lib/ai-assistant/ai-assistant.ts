import {
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  inject,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  provideHashbrown,
  RenderMessageComponent,
  uiChatResource,
  type UiChatMessage,
} from '@hashbrownai/angular';
import { TranslatePipe } from '@tolgee/ngx';
import { LanguageService } from '@cv/shared-data-access-i18n';
import { PageLayout, PageTitle } from '@cv/shared-ui-page';
import { TranslateListPipe, TranslationPart } from '@cv/shared-ui-i18n';
import {
  ASSISTANT_CONFIG,
  ASSISTANT_QUOTA_EXCEEDED,
  FirebaseAiTransport,
} from '@cv/showcase-data-access-assistant';
import { ASSISTANT_COMPONENTS } from '../internal/assistant-components';
import { ASSISTANT_TOOLS } from '../internal/assistant-tools';
import { systemPrompt } from '../internal/system-prompt';

/** Keeps questions short: they cost tokens of the free tier */
export const MAX_QUESTION_LENGTH = 500;
/** Questions per visit, so one visitor cannot use up the free quota */
export const MAX_QUESTIONS = 20;
/** Within this distance of the end, the conversation follows new messages */
const STICK_TO_BOTTOM_PX = 48;

/**
 * Drops zero-width characters: Tolgee's dev tools hide them in every text
 * (also the suggestions), and pasted text can carry them. The model should
 * only get what the visitor sees.
 */
export function withoutInvisibleCharacters(text: string): string {
  return text.replace(/[\u200B-\u200D\u2060\uFEFF]/g, '');
}

/**
 * A chat about the CV (Hashbrown, chapter 13 of Modern Angular): Gemini
 * answers with components (text, person cards) and reads the CV through
 * tools on the GraphQL API. It runs on Firebase AI Logic, see
 * `@cv/showcase-data-access-assistant`.
 */
@Component({
  selector: 'showcase-ai-assistant',
  imports: [
    MatButton,
    MatIcon,
    PageLayout,
    PageTitle,
    RenderMessageComponent,
    TranslatePipe,
    TranslateListPipe,
  ],
  // no collection of usage data by Hashbrown, not even in development
  providers: [provideHashbrown({ telemetry: false })],
  // the showcase shell then passes the panel's height down (from md up)
  host: { class: 'showcase-fills-panel' },
  templateUrl: './ai-assistant.html',
  styleUrl: './ai-assistant.scss',
})
export class AiAssistant {
  private readonly language = inject(LanguageService).language;

  protected readonly configured = inject(ASSISTANT_CONFIG) !== null;
  protected readonly maxLength = MAX_QUESTION_LENGTH;
  /** A suggested question as the visitor sees it (plain text, no markup) */
  protected suggestionText(parts: readonly TranslationPart[]): string {
    return parts.map(({ text }) => text).join('');
  }

  protected readonly chat = uiChatResource({
    debugName: 'ai-assistant',
    system: computed(() =>
      systemPrompt(
        this.language() ?? 'en',
        new Date().toISOString().slice(0, 10)
      )
    ),
    components: ASSISTANT_COMPONENTS,
    tools: ASSISTANT_TOOLS,
    transport: inject(FirebaseAiTransport),
  });

  /** The messages so far; kept while the resource is in error (its value then throws) */
  protected readonly messages = linkedSignal<
    UiChatMessage[] | null,
    UiChatMessage[]
  >({
    source: () => (this.chat.status() === 'error' ? null : this.chat.value()),
    computation: (messages, previous) => messages ?? previous?.value ?? [],
  });

  protected readonly failed = computed(
    () =>
      this.chat.status() === 'error' || this.messages().at(-1)?.role === 'error'
  );

  /** Why the last run failed: an error message in the chat, or the resource's error */
  private readonly errorText = computed(() => {
    const last = this.messages().at(-1);
    if (last?.role === 'error') return String(last.content);
    return this.chat.status() === 'error'
      ? String(this.chat.error()?.message ?? '')
      : '';
  });

  /** The free tier's quota (e.g. requests per day) is used up: no retry until it resets */
  protected readonly quotaReached = computed(() =>
    this.errorText().includes(ASSISTANT_QUOTA_EXCEEDED)
  );

  protected readonly busy = computed(() => this.chat.isLoading());

  private readonly questionsAsked = computed(
    () => this.messages().filter(({ role }) => role === 'user').length
  );
  protected readonly limitReached = computed(
    () => this.questionsAsked() >= MAX_QUESTIONS
  );

  protected readonly question = signal('');

  private readonly conversation =
    viewChild<ElementRef<HTMLElement>>('conversation');
  /** Follows new messages, unless the visitor scrolled up to read */
  private stickToBottom = true;

  constructor() {
    afterRenderEffect(() => {
      this.messages();
      this.busy();
      this.failed();
      const element = this.conversation()?.nativeElement;
      if (element && this.stickToBottom) {
        element.scrollTop = element.scrollHeight;
      }
    });
  }

  protected onScroll(element: HTMLElement): void {
    this.stickToBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight <
      STICK_TO_BOTTOM_PX;
  }

  protected ask(text: string): void {
    const content = withoutInvisibleCharacters(text)
      .trim()
      .slice(0, MAX_QUESTION_LENGTH);
    if (
      !content ||
      this.busy() ||
      this.limitReached() ||
      this.quotaReached() ||
      !this.configured
    ) {
      return;
    }
    this.stickToBottom = true;
    this.chat.sendMessage({ role: 'user', content });
    this.question.set('');
  }

  protected submit(event: Event): void {
    event.preventDefault();
    this.ask(this.question());
  }

  /** Enter sends, Shift+Enter starts a new line */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      this.submit(event);
    }
  }

  protected stop(): void {
    this.chat.stop();
  }

  protected retry(): void {
    this.chat.resendMessages();
  }

  /** `getReferences` -> `t.ai-assistant.tool.getReferences` */
  protected toolLabel(name: string): string {
    return `t.ai-assistant.tool.${name}`;
  }

  protected userText(content: unknown): string {
    return typeof content === 'string' ? content : JSON.stringify(content);
  }
}
