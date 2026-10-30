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
