import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslatePipe } from '@tolgee/ngx';
import { LanguageTranslationKey, TranslationKey } from '@cv/shared-util-i18n';

export interface DownloadOption {
  href: string;
  fileName: string;
  labelKey: LanguageTranslationKey;
  lang?: string;
}

@Component({
  selector: 'ds-download-menu',
  imports: [
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatTooltip,
    TranslatePipe,
  ],
  templateUrl: './download-menu.html',
  styleUrl: './download-menu.scss',
})
export class DownloadMenu {
  readonly options = input.required<readonly DownloadOption[]>();
  readonly labelKey = input.required<TranslationKey>();
  readonly hintKey = input<string>();
}
