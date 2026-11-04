import { Component } from '@angular/core';
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
  imports: [MacWindow, Wrapper],
  templateUrl: './micro-frontends.html',
  styleUrl: './micro-frontends.scss',
})
export class MicroFrontends {
  protected readonly cvMfe: WrapperConfig = cvMfeWrapperConfig;
  protected readonly remoteUrl = 'https://cv-angular-mfe.web.app';
}
