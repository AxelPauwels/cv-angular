import { Component } from '@angular/core';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import {
  cvMfeWrapperConfig,
  Wrapper,
  WrapperConfig,
} from '../shared/ui-federation/wrapper';

@Component({
  selector: 'app-home',
  imports: [MatSlideToggle, Wrapper],
  templateUrl: './home.html',
})
export class Home {
  protected readonly cvMfe: WrapperConfig = cvMfeWrapperConfig;
}
