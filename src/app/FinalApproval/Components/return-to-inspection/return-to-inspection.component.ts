import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  ApiResponse,
  FinalApprovalItem
} from '../../Models/final-approval';

import { FinalApprovalService } from '../../Services/final-approval.service';

@Component({
  selector: 'app-final-approval-return-to-inspection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './return-to-inspection.component.html',
  styleUrl: './return-to-inspection.component.scss'
})
export class ReturnToInspectionComponent {
  @Input() item: FinalApprovalItem | null = null;

  @Output() returned = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  processing = false;
  errorMessage = '';
  noteContent = '';

  constructor(private readonly finalApprovalService: FinalApprovalService) {}

  confirmReturn(): void {
    this.errorMessage = '';

    if (!this.item?.id) {
      this.errorMessage = 'لم يتم تحديد المعاملة';
      return;
    }

    if (!this.noteContent.trim()) {
      this.errorMessage = 'من فضلك أدخلي سبب إرجاع المعاملة للمعاينة';
      return;
    }

    this.processing = true;

    this.finalApprovalService
      .returnToInspection(this.item.id, this.noteContent.trim())
      .subscribe({
        next: (response: ApiResponse<boolean>) => {
          this.processing = false;

          if (!response.isSuccess) {
            this.errorMessage = response.message || 'تعذر إرجاع المعاملة إلى المعاينة';
            return;
          }

          this.returned.emit();
        },
        error: err => {
          this.processing = false;
          console.error('Return to inspection error:', err);

          this.errorMessage =
            err?.error?.message ||
            err?.error?.Message ||
            err?.message ||
            'حدث خطأ أثناء إرجاع المعاملة إلى المعاينة';
        }
      });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}