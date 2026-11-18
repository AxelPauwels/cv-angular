import { Pipe, PipeTransform } from '@angular/core';

/**
 * A date in the given language, through the browser's `Intl`: `2 januari 1986`
 * in `nl`, `2. januar 1986` in `nb`. Unlike Angular's `date` pipe it needs no
 * registered locale data, so every language works without growing the bundle.
 * Pass the active language, so the pipe runs again when it changes:
 *
 * ```html
 * {{ birthday | localDate: language() }}
 * ```
 */
@Pipe({ name: 'localDate' })
export class LocalDatePipe implements PipeTransform {
  transform(
    date: Date | null | undefined,
    language: string,
    dateStyle: Intl.DateTimeFormatOptions['dateStyle'] = 'long'
  ): string {
    return date
      ? new Intl.DateTimeFormat(language, { dateStyle }).format(date)
      : '';
  }
}
