import { Routes } from '@angular/router';
import { Wrapper, WrapperConfig } from './domains/shared/ui-federation/wrapper';
import { Home } from './domains/home/home';
export const appRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'home',
    component: Home,
  },
  {
    path: 'example',
    loadComponent: () =>
      import('./domains/example/example').then((m) => m.Example),
  },
  {
    path: 'cv-mfe',
    component: Wrapper,
    data: {
      config: {
        remoteName: 'cv-mfe',
        exposedModule: './web-components',
        elementName: 'cv-mfe',
      } as WrapperConfig,
    },
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
