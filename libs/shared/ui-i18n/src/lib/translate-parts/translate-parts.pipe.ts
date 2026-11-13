import { OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { TranslatePipe } from '@tolgee/ngx';
import { TranslationKey } from '@cv/shared-util-i18n';

/** A piece of a translation: plain text, or text the template marks up */
export interface TranslationPart {
  text: string;
  tag?: 'code' | 'strong';
}

const TAGS = /<(code|strong)>([\s\S]*?)<\/\1>/g;

/**
 * `Run <code>npm test</code>.` -> `Run `, `npm test` (code), `.`.
 * Only `<code>` and `<strong>` are recognised; anything else stays text.
 */
export function toTranslationParts(text: string): TranslationPart[] {
  const parts: TranslationPart[] = [];
  let index = 0;
  for (const match of text.matchAll(TAGS)) {
    if (match.index > index) {
      parts.push({ text: text.slice(index, match.index) });
    }
    parts.push({ text: match[2], tag: match[1] as TranslationPart['tag'] });
    index = match.index + match[0].length;
  }
  if (index < text.length) {
    parts.push({ text: text.slice(index) });
  }
  return parts;
}

/**
 * Translates a key whose text holds inline `<code>` or `<strong>`, and splits
 * it into parts, so the template renders real elements without `innerHTML`
 * (every part is still interpolated, so escaped):
 *
 * ```html
 * <p>
 *   @for (part of 't.versions.not-available.text' | translateParts; track $index) {
 *     @if (part.tag === 'code') { <code>{{ part.text }}</code> }
 *     @else { {{ part.text }} }
 *   }
 * </p>
 * ```
 *
 * Follows language changes like the `translate` pipe it wraps.
 */
@Pipe({ name: 'translateParts', pure: false })
export class TranslatePartsPipe implements PipeTransform, OnDestroy {
  private readonly translate = new TranslatePipe();
  private text?: string;
  private parts: TranslationPart[] = [];

  transform(
    key: TranslationKey,
    params?: Record<string, string>
  ): TranslationPart[] {
    const text = this.translate.transform(key, params ?? {});
    // the same array while the text stays, so @for keeps its DOM
    if (text !== this.text) {
      this.text = text;
      this.parts = toTranslationParts(text);
    }
    return this.parts;
  }

  ngOnDestroy(): void {
    this.translate.ngOnDestroy();
  }
}
