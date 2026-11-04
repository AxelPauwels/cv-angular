import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import {
  cvMfeWrapperConfig,
  Wrapper,
  WrapperConfig,
} from '@cv/shared-ui-federation';
import ExperienceList from '@cv/cv-feature-experience';
import { MacWindow } from '@axel-pauwels/mac-window';

@Component({
  selector: 'cv-example',
  imports: [MatButton, MatSlideToggle, Wrapper, MacWindow, ExperienceList],
  templateUrl: './example.html',
})
export class Example {
  protected readonly title = 'cv';

  protected readonly cvMfe: WrapperConfig = cvMfeWrapperConfig;
}
