import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import {
  ApiResponse,
  FinalApprovalItem
} from '../../Models/final-approval';

import { FinalApprovalService } from '../../Services/final-approval.service';
import { TranslatePipe } from '../../../Shared/Components/translate.pipe';

@Component({
  selector: 'app-final-approval-delete',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.scss'
})
export class DeleteComponent {
  @Input() item: FinalApprovalItem | null = null;

  @Output() deleted = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  deleting = false;
  errorMessage = '';

  constructor(private readonly finalApprovalService: FinalApprovalService) {}

  confirmDelete(): void {
    this.errorMessage = '';

    if (!this.item?.id) {
      this.errorMessage = 'لم يتم تحديد العنصر المراد حذفه';
      return;
    }

    this.deleting = true;

    this.finalApprovalService.delete(this.item.id).subscribe({
      next: (response: ApiResponse<boolean>) => {
        this.deleting = false;

        if (!response.isSuccess) {
          this.errorMessage = response.message || 'فشل حذف طلب الموافقة النهائية';
          return;
        }

        this.deleted.emit();
      },
      error: err => {
        this.deleting = false;
        console.error('Final approval DELETE error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء حذف طلب الموافقة النهائية';
      }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}