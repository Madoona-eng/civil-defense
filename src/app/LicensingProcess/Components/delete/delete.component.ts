import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiResponse, LicensingProcessItem } from '../../Models/licensing-process';
import { LicensingProcessService } from '../../Services/licensing-process.service';

@Component({
  selector: 'app-licensing-process-delete',
  standalone: true,
  imports: [CommonModule],
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
      this.errorMessage = 'لم يتم تحديد طلب الترخيص';
      return;
    }

    this.deleting = true;
    this.errorMessage = '';

    this.licensingProcessService.delete(this.item.id).subscribe({
      next: (res: ApiResponse<boolean>) => {
        this.deleting = false;

        if (!res.isSuccess) {
          this.errorMessage = res.message || 'تعذر حذف طلب الترخيص';
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
          'حدث خطأ أثناء حذف طلب الترخيص';
      }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}