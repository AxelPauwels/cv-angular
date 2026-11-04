import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavItem, SubNavbar } from '@cv/shared-ui-design-system';
import { ROUTES } from '@cv/shared-util-routing';

/** Layout of the Showcase domain: its sub navbar above the active page */
@Component({
  selector: 'showcase-feature-shell',
  imports: [RouterOutlet, SubNavbar],
  templateUrl: './showcase-feature-shell.html',
  styleUrl: './showcase-feature-shell.scss',
})
export class ShowcaseFeatureShell {
  protected readonly navItems: NavItem[] = [
    { labelKey: 't.nav.graphql-docs', path: ROUTES.SHOWCASE.GRAPHQL_DOCS },
    { labelKey: 't.nav.code-coverage', path: ROUTES.SHOWCASE.CODE_COVERAGE },
    {
      labelKey: 't.nav.end-to-end-tests',
      path: ROUTES.SHOWCASE.END_TO_END_TESTS,
    },
    {
      labelKey: 't.nav.micro-frontends',
      path: ROUTES.SHOWCASE.MICRO_FRONTENDS,
    },
  ];
}
