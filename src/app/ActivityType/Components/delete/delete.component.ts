import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivityType, ApiResponse } from '../../Models/activity-type';
import { ActivityTypeService } from '../../Services/activity-type.service';

@Component({
  selector: 'app-delete',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.scss'
})
export class DeleteComponent {
  @Input() activityType: ActivityType | null = null;

  @Output() deleted = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  deleting = false;
  errorMessage = '';

  constructor(private readonly activityTypeService: ActivityTypeService) {}

  confirmDelete(): void {
    if (!this.activityType?.id) {
      this.errorMessage = 'لم يتم تحديد نوع النشاط';
      return;
    }

    this.deleting = true;
    this.errorMessage = '';

    this.activityTypeService.delete(this.activityType.id).subscribe({
      next: (res: ApiResponse<boolean>) => {
        this.deleting = false;

        if (!res.isSuccess) {
          this.errorMessage = res.message || 'تعذر حذف نوع النشاط';
          return;
        }

        this.deleted.emit();
      },
      error: err => {
        this.deleting = false;
        console.error('ActivityType DELETE error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء حذف نوع النشاط';
      }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}