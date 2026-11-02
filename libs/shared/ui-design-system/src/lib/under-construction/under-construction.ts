import { Component, input } from '@angular/core';

/** Placeholder page until a sub navbar item gets its own content; `title` comes from route data */
@Component({
  selector: 'lib-under-construction',
  template: `
    <h1>{{ title() }}</h1>
    <p>under construction</p>
  `,
})
export class UnderConstruction {
  readonly title = input('');
}
