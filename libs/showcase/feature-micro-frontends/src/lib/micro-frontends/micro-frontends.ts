import { Component } from '@angular/core';
import { PageTitle } from '@cv/shared-ui-design-system';
import { MatButton } from '@angular/material/button';
import {
  MatCard,
  MatCardActions,
  MatCardAvatar,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MacWindow } from '@axel-pauwels/mac-window';
import {
  cvMfeWrapperConfig,
  Wrapper,
  WrapperConfig,
} from '@cv/shared-ui-federation';

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
    Wrapper,
    MatButton,
    MatCard,
    MatCardActions,
    MatCardAvatar,
    MatCardContent,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    MatChip,
    MatChipSet,
    MatIcon,
  ],
  templateUrl: './micro-frontends.html',
  styleUrl: './micro-frontends.scss',
})
export class MicroFrontends {
  protected readonly cvMfe: WrapperConfig = cvMfeWrapperConfig;
  protected readonly remoteUrl = 'https://cv-angular-mfe.web.app';
  protected readonly npmUrl =
    'https://www.npmjs.com/package/@axel-pauwels/mac-window';
}
