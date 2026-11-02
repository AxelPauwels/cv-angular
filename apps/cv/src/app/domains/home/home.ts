import { Component } from '@angular/core';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import {
  cvMfeWrapperConfig,
  Wrapper,
  WrapperConfig,
} from '../shared/ui-federation/wrapper';
import { MacWindow } from '@axel-pauwels/mac-window';

@Component({
  selector: 'app-home',
  imports: [MatSlideToggle, Wrapper, MacWindow],
  templateUrl: './home.html',
})
export class Home {
  protected readonly cvMfe: WrapperConfig = cvMfeWrapperConfig;
}
