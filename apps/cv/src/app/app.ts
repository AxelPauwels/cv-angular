import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MacWindow } from '@axel-pauwels/mac-window';

@Component({
  imports: [RouterOutlet, MacWindow],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  protected title = 'cv';
}
