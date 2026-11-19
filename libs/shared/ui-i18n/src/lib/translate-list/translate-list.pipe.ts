import { OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { TranslatePipe } from '@tolgee/ngx';
import { splitTranslationList, TranslationKey } from '@cv/shared-util-i18n';
import {
  toTranslationParts,
  TranslationPart,
} from '../translate-parts/translate-parts.pipe';

/**
 * Translates a key that holds a whole list (items separated by
 * `TRANSLATION_LIST_DELIMITER`, `||`) and returns one item per entry, each
 * already split into parts like `translateParts` does, so inline `<code>` and
 * `<strong>` render as elements without `innerHTML`:
 *
 * ```html
 * <ol>
 *   @for (item of 't.micro-frontends.mfe.steps' | translateList; track $index) {
 *     <li>
 *       @for (part of item; track $index) {
 *         @if (part.tag === 'code') { <code>{{ part.text }}</code> }
 *         @else { {{ part.text }} }
 *       }
 *     </li>
 *   }
 * </ol>
 * ```
 *
 * One Tolgee key per list instead of one per item. Follows language changes
 * like the `translate` pipe it wraps.
 */
@Pipe({ name: 'translateList', pure: false })
export class TranslateListPipe implements PipeTransform, OnDestroy {
  private readonly translate = new TranslatePipe();
  private text?: string;
  private items: TranslationPart[][] = [];

  transform(
    key: TranslationKey,
    params?: Record<string, string>
  ): TranslationPart[][] {
    const text = this.translate.transform(key, params ?? {});
    // the same array while the text stays, so @for keeps its DOM
    if (text !== this.text) {
      this.text = text;
      this.items = splitTranslationList(text).map(toTranslationParts);
    }
    return this.items;
  }

  ngOnDestroy(): void {
    this.translate.ngOnDestroy();
  }
}
