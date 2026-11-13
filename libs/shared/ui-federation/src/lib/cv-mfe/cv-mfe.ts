import { Component, computed, input } from '@angular/core';
import { Wrapper, WrapperConfig } from '../wrapper/wrapper';
import { CodeBlockLanguage, CvMfeInputs } from '../internal/cv-mfe';

/** Where the `<cv-mfe>` micro-frontend comes from (see the federation manifest) */
export const cvMfeWrapperConfig: WrapperConfig = {
  remoteName: 'cv-mfe',
  exposedModule: './web-components',
  elementName: 'cv-mfe',
};

/**
 * The `<cv-mfe>` micro-frontend with typed inputs: renders it through the
 * generic `Wrapper`. Inputs left unset are not passed, so the remote's own
 * defaults apply.
 */
@Component({
  selector: 'shared-cv-mfe',
  imports: [Wrapper],
  template: `<shared-wrapper [config]="config" [inputs]="inputs()" />`,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class CvMfe {
  readonly snippet = input<CvMfeInputs['snippet']>();
  readonly language = input<CodeBlockLanguage>();
  readonly lineNumbers = input<boolean>();
  readonly copyable = input<boolean>();

  protected readonly config = cvMfeWrapperConfig;

  protected readonly inputs = computed(() => {
    const inputs: Partial<CvMfeInputs> = {
      snippet: this.snippet(),
      language: this.language(),
      lineNumbers: this.lineNumbers(),
      copyable: this.copyable(),
    };
    return Object.fromEntries(
      Object.entries(inputs).filter(([, value]) => value !== undefined)
    ) as Partial<CvMfeInputs>;
  });
}
