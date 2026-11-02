import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavItem, SubNavbar } from '@cv/shared/ui-design-system';
import { ROUTES } from '@cv/shared/util-routing';

/** Layout of the Showcase domain: its sub navbar above the active page */
@Component({
  selector: 'lib-showcase-feature-shell',
  imports: [RouterOutlet, SubNavbar],
  templateUrl: './showcase-feature-shell.html',
  styleUrl: './showcase-feature-shell.scss',
})
export class ShowcaseFeatureShell {
  protected readonly navItems: NavItem[] = [
    { label: 'GraphQL docs', path: ROUTES.SHOWCASE.GRAPHQL_DOCS },
    { label: 'Code coverage', path: ROUTES.SHOWCASE.CODE_COVERAGE },
    { label: 'End-to-end tests', path: ROUTES.SHOWCASE.END_TO_END_TESTS },
  ];
}
