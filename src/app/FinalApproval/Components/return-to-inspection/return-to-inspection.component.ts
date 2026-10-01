import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  ApiResponse,
  FinalApprovalItem
} from '../../Models/final-approval';

import { FinalApprovalService } from '../../Services/final-approval.service';
import { TranslatePipe } from '../../../Shared/Components/translate.pipe';

@Component({
  selector: 'app-final-approval-return-to-inspection',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
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
      this.errorMessage = 'لم يتم تحديد العنصر المراد إعادته للمعاينة';
      return;
    }

    if (!this.noteContent.trim()) {
      this.errorMessage = 'يرجى إدخال سبب الإعادة للمعاينة';
      return;
    }

    this.processing = true;

    this.finalApprovalService
      .returnToInspection(this.item.id, this.noteContent.trim())
      .subscribe({
        next: (response: ApiResponse<boolean>) => {
          this.processing = false;

          if (!response.isSuccess) {
            this.errorMessage = response.message || 'فشل إرجاع الطلب إلى مرحلة المعاينة';
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
            'حدث خطأ أثناء إرجاع الطلب إلى مرحلة المعاينة';
        }
      });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}