import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  ApiResponse,
  FinalApprovalFormModel,
  FinalApprovalItem
} from '../../Models/final-approval';

import { FinalApprovalService } from '../../Services/final-approval.service';

@Component({
  selector: 'app-final-approval-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent implements OnChanges {
  @Input() item: FinalApprovalItem | null = null;

  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  saving = false;
  errorMessage = '';
  successMessage = '';

  formModel: FinalApprovalFormModel = {
    reviewStatus: 'Accepted',
    rejectionNote: '',
    isPaid: true
  };

  entityLetters: File[] = [];
  proofDocuments: File[] = [];
  engineeringReports: File[] = [];
  inspectionReports: File[] = [];
  otherAttachments: File[] = [];

  constructor(private readonly finalApprovalService: FinalApprovalService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item'] && this.item) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.formModel = {
      reviewStatus: 'Accepted',
      rejectionNote: '',
      isPaid: true
    };

    this.entityLetters = [];
    this.proofDocuments = [];
    this.engineeringReports = [];
    this.inspectionReports = [];
    this.otherAttachments = [];
  }

  onFilesSelected(
    event: Event,
    type:
      | 'entityLetters'
      | 'proofDocuments'
      | 'engineeringReports'
      | 'inspectionReports'
      | 'otherAttachments'
  ): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);

    if (type === 'entityLetters') {
      this.entityLetters = files;
    }

    if (type === 'proofDocuments') {
      this.proofDocuments = files;
    }

    if (type === 'engineeringReports') {
      this.engineeringReports = files;
    }

    if (type === 'inspectionReports') {
      this.inspectionReports = files;
    }

    if (type === 'otherAttachments') {
      this.otherAttachments = files;
    }
  }

  save(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.item?.id) {
      this.errorMessage = 'لم يتم تحديد معاملة الموافقة النهائية';
      return;
    }

    if (!this.validateForm()) {
      return;
    }

    const formData = new FormData();

    formData.append('ReviewStatus', this.formModel.reviewStatus);
    formData.append('RejectionNote', this.formModel.rejectionNote.trim());
    formData.append('IsPaid', String(this.formModel.isPaid));

    this.entityLetters.forEach(file => {
      formData.append('EntityLetters', file, file.name);
    });

    this.proofDocuments.forEach(file => {
      formData.append('ProofDocuments', file, file.name);
    });

    this.engineeringReports.forEach(file => {
      formData.append('EngineeringReports', file, file.name);
    });

    this.inspectionReports.forEach(file => {
      formData.append('InspectionReports', file, file.name);
    });

    this.otherAttachments.forEach(file => {
      formData.append('OtherAttachments', file, file.name);
    });

    this.saving = true;

    this.finalApprovalService.saveFinalApproval(this.item.id, formData).subscribe({
      next: (response: ApiResponse<boolean>) => {
        this.saving = false;

        if (!response.isSuccess) {
          this.errorMessage = response.message || 'تعذر حفظ قرار الموافقة النهائية';
          return;
        }

        this.successMessage = response.message || 'تم إرسال خطوة الموافقة النهائية بنجاح';

        setTimeout(() => {
          this.saved.emit();
        }, 900);
      },
      error: err => {
        this.saving = false;
        console.error('Final approval PUT error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء حفظ قرار الموافقة النهائية';
      }
    });
  }

  validateForm(): boolean {
    if (!this.formModel.reviewStatus) {
      this.errorMessage = 'من فضلك اختاري حالة القرار';
      return false;
    }

    if (
      this.formModel.reviewStatus === 'Rejected' &&
      !this.formModel.rejectionNote.trim()
    ) {
      this.errorMessage = 'يجب إدخال سبب الرفض';
      return false;
    }

    return true;
  }

  cancel(): void {
    this.cancelled.emit();
  }
}