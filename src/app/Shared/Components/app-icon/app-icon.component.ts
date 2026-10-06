import { Component, Input } from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';
import { APP_ICONS, AppIconName } from '../../Icons/app-icons';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [LucideAngularModule],
  template: `<lucide-angular [img]="icon" [size]="size" [strokeWidth]="1.75"></lucide-angular>`,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 0;
      }
    `,
  ],
})
export class AppIconComponent {
  icon!: LucideIconData;
  size = 18;

  @Input() set name(value: AppIconName) {
    this.icon = APP_ICONS[value];
  }

  // أحجام محددة بس، مفيش رقم حر
  @Input() set variant(value: 'sm' | 'md' | 'lg') {
    this.size = { sm: 16, md: 20, lg: 28 }[value];
  }
}
