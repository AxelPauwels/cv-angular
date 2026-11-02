# @axel-pauwels/mac-window

A small UI component that wraps any content in a macOS-style window frame: a dark title bar with the familiar red, yellow and green "traffic light" buttons, rounded corners and a soft drop shadow.

```
┌──────────────────────────────────────┐
│ ● ● ●                                │  ← dark title bar
├──────────────────────────────────────┤
│                                      │
│          your content here           │  ← projected content
│                                      │
└──────────────────────────────────────┘
```

## How it is built

`mac-window` is meant to be used as a **web component**, but internally it is an **Angular component**.

- The source is a standalone Angular component (`MacWindow`, selector `lib-mac-window`), built with `ng-packagr` through Nx.
- Your content is placed inside the window with Angular content projection (`<ng-content>`). In the web component, that becomes the element's light-DOM children.
- The `@axel-pauwels/mac-window/element` entry point wraps that component with [`@angular/elements`](https://angular.dev/guide/elements) and registers it as the native custom element `<mac-window>`. The browser then treats it like any other HTML tag, so it works in plain HTML, React, Vue and so on.

So the package has two entry points:

| Entry point                        | Gives you                                              | Side effects                       |
| ---------------------------------- | ------------------------------------------------------ | ---------------------------------- |
| `@axel-pauwels/mac-window`         | The Angular component `MacWindow` (`<lib-mac-window>`) | None                               |
| `@axel-pauwels/mac-window/element` | The web component `<mac-window>`                       | Registers `<mac-window>` on import |

## Installation

```bash
npm install @axel-pauwels/mac-window
```

Peer dependencies: `@angular/core` and `@angular/platform-browser` `^22.2.0`.

The web component also needs Angular Elements, which is an optional peer dependency:

```bash
npm install @angular/elements
```

## Usage

### 1. In an Angular app

Import the standalone component and use its selector:

```ts
import { Component } from '@angular/core';
import { MacWindow } from '@axel-pauwels/mac-window';

@Component({
  selector: 'app-home',
  imports: [MacWindow],
  template: `
    <lib-mac-window>
      <h1>Hello from inside the window</h1>
      <p>Anything you put here is projected into the window body.</p>
    </lib-mac-window>
  `,
})
export class Home {}
```

### 2. As a web component

Import the element entry point once, for example in your app's entry file. Importing it registers `<mac-window>`:

```ts
// main.ts
import '@axel-pauwels/mac-window/element';
```

After that, use it in any HTML, with no Angular templates involved:

```html
<mac-window>
  <h1>Hello from inside the window</h1>
  <p>This works in plain HTML, React, Vue, or any other framework.</p>
</mac-window>
```

Behind the scenes, the entry point boots a small zoneless Angular application, so zone.js isn't needed. If the tag is already defined, it does nothing.

#### Using a different tag name

The entry point also exports `defineMacWindow(tagName?)` and the default tag `MAC_WINDOW_TAG` (`'mac-window'`). You can call `defineMacWindow` yourself to register an extra tag, for example to avoid a name clash:

```ts
import { defineMacWindow } from '@axel-pauwels/mac-window/element';

await defineMacWindow('my-window');
```

Importing the entry point always registers `<mac-window>` as well. Registration is asynchronous: wait for `customElements.whenDefined('mac-window')` if you need the element to be upgraded before your code runs.

> **Tag name:** the web component is `<mac-window>` and the Angular selector is `<lib-mac-window>`. Because the names differ, both can be used on the same page.

## API

| Item                                      | Description                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| `MacWindow`                               | The standalone Angular component class.                                   |
| `lib-mac-window`                          | The Angular selector.                                                     |
| `mac-window`                              | The custom element tag, registered by `@axel-pauwels/mac-window/element`. |
| `defineMacWindow(tagName = 'mac-window')` | Registers the custom element under `tagName`. Returns a `Promise<void>`.  |
| `MAC_WINDOW_TAG`                          | The default tag name, `'mac-window'`.                                     |
| Default slot                              | Any child content is rendered inside the window body.                     |
| Inputs / outputs                          | None yet. The traffic-light buttons are decorative only.                  |

## Styling

The component comes with these styles built in:

- Window: white background, `20px` border radius, drop shadow, `width: 100%`, centered with `margin: 2rem auto`.
- Title bar: `#2b2b2b` background with three `15px` round buttons (`#ff5c5f`, `#fac801`, `#34c759`).
- Content area: `4px` padding.

Because the window fills `100%` of its parent, set its size on a wrapper element or on the host element itself:

```css
mac-window,
lib-mac-window {
  display: block;
  max-width: 640px;
}
```

The internal class names follow BEM (`.mw`, `.mw__controls`, `.mw__btn`, `.mw__content`). They are an implementation detail and may change between versions.

## Development

This package lives in an Nx workspace. From the workspace root:

```bash
# Build the library into dist/packages/mac-window
npx nx build mac-window

# Run the unit tests
npx nx test mac-window

# Version and publish to npm
npx nx release --projects=mac-window
```
