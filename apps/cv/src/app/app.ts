import { Component } from '@angular/core';
import { Shell } from './shell/shell';

@Component({
  imports: [Shell],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {}
