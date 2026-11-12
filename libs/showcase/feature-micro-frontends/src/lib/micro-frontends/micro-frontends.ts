import { Component } from '@angular/core';
import { PageLayout, PageTitle } from '@cv/shared-ui-page';
import { MatButton } from '@angular/material/button';
import { Card, CardActions } from '@cv/shared-ui-card';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MacWindow } from '@axel-pauwels/mac-window';
import { CvMfe } from '@cv/shared-ui-federation';

/**
 * Two ways this app reuses UI built elsewhere: a micro-frontend loaded at
 * runtime from its own deployment, and a component library from this
 * repository, bundled at build time.
 */
@Component({
  selector: 'showcase-micro-frontends',
  imports: [
    PageTitle,
    MacWindow,
    CvMfe,
    MatButton,
    Card,
    CardActions,
    MatChip,
    MatChipSet,
    MatIcon,
    PageLayout,
  ],
  templateUrl: './micro-frontends.html',
  styleUrl: './micro-frontends.scss',
})
export class MicroFrontends {
  protected readonly remoteUrl = 'https://cv-angular-mfe.web.app';
  protected readonly remoteApiDocsUrl = `${this.remoteUrl}/api/`;
  protected readonly npmUrl =
    'https://www.npmjs.com/package/@axel-pauwels/mac-window';
  protected readonly cvMfeSnippet = `
    const me = signal({ role: 'Developer', coffee: 12 });
    const isHireable = computed(() => me().coffee > 5);
  `;
}
