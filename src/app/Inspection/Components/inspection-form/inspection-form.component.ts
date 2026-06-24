import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  ApiResponse,
  InspectionFormModel,
  InspectionItem
} from '../../Models/inspection';

import { InspectionService } from '../../Services/inspection.service';

@Component({
  selector: 'app-inspection-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inspection-form.component.html',
  styleUrl: './inspection-form.component.scss'
})
export class InspectionFormComponent {
  @Input() item: InspectionItem | null = null;

  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  saving = false;
  errorMessage = '';
  successMessage = '';

  formModel: InspectionFormModel = {
    inspectorName: '',
    opinion: 'Compliant',
    inspectionNote: ''
  };

  entityLetters: File[] = [];
  proofDocuments: File[] = [];
  engineeringReports: File[] = [];
  inspectionReports: File[] = [];
  otherAttachments: File[] = [];

  constructor(private readonly inspectionService: InspectionService) {}

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
      this.errorMessage = 'لم يتم تحديد معاملة المعاينة';
      return;
    }

    if (!this.validateForm()) {
      return;
    }

    const formData = new FormData();

    formData.append('InspectorName', this.formModel.inspectorName.trim());
    formData.append('Opinion', this.formModel.opinion);
    formData.append('InspectionNote', this.formModel.inspectionNote.trim());

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

    this.inspectionService.saveInspection(this.item.id, formData).subscribe({
      next: (response: ApiResponse<boolean>) => {
        this.saving = false;

        if (!response.isSuccess) {
          this.errorMessage = response.message || 'تعذر حفظ بيانات المعاينة';
          return;
        }

        this.successMessage = response.message || 'تم حفظ بيانات المعاينة بنجاح';

        setTimeout(() => {
          this.saved.emit();
        }, 900);
      },
      error: err => {
        this.saving = false;
        console.error('Inspection PUT error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء حفظ بيانات المعاينة';
      }
    });
  }

  validateForm(): boolean {
    if (!this.formModel.inspectorName.trim()) {
      this.errorMessage = 'من فضلك أدخلي اسم المعاين';
      return false;
    }

    if (!this.formModel.opinion) {
      this.errorMessage = 'من فضلك اختاري الرأي';
      return false;
    }

    if (
      this.formModel.opinion === 'NonCompliant' &&
      !this.formModel.inspectionNote.trim()
    ) {
      this.errorMessage = 'يجب إدخال السبب عند عدم الاستيفاء';
      return false;
    }

    return true;
  }

  cancel(): void {
    this.cancelled.emit();
  }
}