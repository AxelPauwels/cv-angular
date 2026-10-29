import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSlideToggle } from '@angular/material/slide-toggle';

@Component({
  imports: [RouterOutlet, MatSlideToggle],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  protected title = 'cv';
}
