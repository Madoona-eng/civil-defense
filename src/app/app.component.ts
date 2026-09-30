import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SITE_TRANSLATIONS } from './Shared/Enums/site-translations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(title: Title) {
    title.setTitle(SITE_TRANSLATIONS['app.civilDefense']);
  }
}