import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import {
  ApiResponse,
  InspectionItem
} from '../../Models/inspection';

import { InspectionService } from '../../Services/inspection.service';

@Component({
  selector: 'app-inspection-delete',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.scss'
})
export class DeleteComponent {
  @Input() item: InspectionItem | null = null;

  @Output() deleted = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  deleting = false;
  errorMessage = '';

  constructor(private readonly inspectionService: InspectionService) {}

  confirmDelete(): void {
    this.errorMessage = '';

    if (!this.item?.id) {
      this.errorMessage = 'لم يتم تحديد معاملة المعاينة';
      return;
    }

    this.deleting = true;

    this.inspectionService.delete(this.item.id).subscribe({
      next: (response: ApiResponse<boolean>) => {
        this.deleting = false;

        if (!response.isSuccess) {
          this.errorMessage = response.message || 'تعذر حذف المعاملة';
          return;
        }

        this.deleted.emit();
      },
      error: err => {
        this.deleting = false;
        console.error('Inspection DELETE error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء حذف المعاملة';
      }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}