import { Component } from '@angular/core';
import { TranslatePipe } from '../../Shared/Components/translate.pipe';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
