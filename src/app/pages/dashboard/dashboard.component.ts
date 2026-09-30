import { Component } from '@angular/core';
import { SiteTranslationPipe } from '../../Shared/Enums/site-translations';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SiteTranslationPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
