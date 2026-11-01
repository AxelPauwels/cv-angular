import { provideZonelessChangeDetection } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { MacWindow } from '@axel-pauwels/mac-window';

export const MAC_WINDOW_TAG = 'mac-window';

/**
 * Registers the MacWindow Angular component as a native custom element.
 * Safe to call more than once: an already defined tag is left untouched.
 */
export async function defineMacWindow(tagName = MAC_WINDOW_TAG): Promise<void> {
  if (customElements.get(tagName)) {
    return;
  }

  const app = await createApplication({
    providers: [provideZonelessChangeDetection()],
  });

  // Another call may have defined the tag while the application was bootstrapping.
  if (!customElements.get(tagName)) {
    customElements.define(
      tagName,
      createCustomElement(MacWindow, { injector: app.injector })
    );
  }
}

// Importing this entry point registers <mac-window> right away.
void defineMacWindow();
