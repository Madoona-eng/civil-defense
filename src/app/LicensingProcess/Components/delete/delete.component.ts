import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiResponse, LicensingProcessItem } from '../../Models/licensing-process';
import { LicensingProcessService } from '../../Services/licensing-process.service';
import { SITE_TRANSLATIONS, SiteTranslationPipe } from '../../../Shared/Enums/site-translations';

@Component({
  selector: 'app-licensing-process-delete',
  standalone: true,
  imports: [CommonModule, SiteTranslationPipe],
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.scss'
})
export class DeleteComponent {
  @Input() item: LicensingProcessItem | null = null;

  @Output() deleted = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  deleting = false;
  errorMessage = '';

  constructor(private readonly licensingProcessService: LicensingProcessService) {}

  confirmDelete(): void {
    if (!this.item?.id) {
      this.errorMessage = SITE_TRANSLATIONS['licensing.deleteNotSelected'];
      return;
    }

    this.deleting = true;
    this.errorMessage = '';

    this.licensingProcessService.delete(this.item.id).subscribe({
      next: (res: ApiResponse<boolean>) => {
        this.deleting = false;

        if (!res.isSuccess) {
          this.errorMessage = res.message || SITE_TRANSLATIONS['licensing.deleteFailed'];
          return;
        }

        this.deleted.emit();
      },
      error: (err: any) => {
        this.deleting = false;
        console.error('LicensingProcess DELETE error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          SITE_TRANSLATIONS['licensing.deleteError'];
      }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}