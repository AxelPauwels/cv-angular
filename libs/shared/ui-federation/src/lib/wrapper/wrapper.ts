import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { loadRemoteModule } from '@angular-architects/native-federation';

export interface WrapperConfig {
  remoteName: string;
  exposedModule: string;
  elementName: string;
}

export const initWrapperConfig: WrapperConfig = {
  remoteName: '',
  exposedModule: '',
  elementName: '',
};

/**
 * Loads a remote's web component (Native Federation) and renders it. Generic:
 * for a known remote, prefer its typed component (e.g. `CvMfe`).
 *
 * `inputs` are set as properties on the custom element. Angular Elements maps
 * each `input()` of the remote's component to a property of the same
 * (camelCase) name, so any value works, not only strings. They are set again
 * whenever `inputs` changes.
 */
@Component({
  selector: 'shared-wrapper',
  imports: [CommonModule],
  templateUrl: './wrapper.html',
  styleUrls: ['./wrapper.css'],
})
export class Wrapper {
  private elm = inject(ElementRef);

  // The router now assignes routing parameters
  // (query string, matrix paraters, the passed data object)
  // to inputs. To make this work, the function
  //       withComponentInputBinding()
  // needs to be added when bootstrapping the application
  // (see bootstrap.ts)
  config = input(initWrapperConfig);

  /** Values for the remote component's inputs, by input name */
  inputs = input<Readonly<Record<string, unknown>>>({});

  private readonly element = signal<HTMLElement | undefined>(undefined);

  constructor() {
    effect(async () => {
      const { exposedModule, remoteName, elementName } = this.config();
      if (!remoteName || !exposedModule || !elementName) {
        return;
      }

      await loadRemoteModule(remoteName, exposedModule);
      const root = document.createElement(elementName);
      this.elm.nativeElement.appendChild(root);
      this.element.set(root);
    });

    // Properties set before the element is defined are picked up by Angular
    // Elements once it upgrades, so this needn't wait for the remote's define
    effect(() => {
      const element = this.element();
      if (element) {
        Object.assign(element, this.inputs());
      }
    });
  }
}
