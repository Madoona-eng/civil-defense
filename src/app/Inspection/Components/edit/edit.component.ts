import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  ApiResponse,
  InspectionStepDetails,
  InspectionFormModel,
  InspectionItem
} from '../../Models/inspection';

import { InspectionService } from '../../Services/inspection.service';

type AttachmentType =
  | 'entityLetters'
  | 'proofDocuments'
  | 'engineeringReports'
  | 'inspectionReports'
  | 'otherAttachments';

@Component({
  selector: 'app-inspection-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent implements OnChanges {
  @Input() item: InspectionItem | null = null;

  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  loading = false;
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item'] && this.item?.id) {
      this.resetForm();
      this.loadInspection(this.item.id);
    }
  }

  resetForm(): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.formModel = {
      inspectorName: '',
      opinion: 'Compliant',
      inspectionNote: ''
    };

    this.entityLetters = [];
    this.proofDocuments = [];
    this.engineeringReports = [];
    this.inspectionReports = [];
    this.otherAttachments = [];
  }

  loadInspection(id: string): void {
    this.loading = true;

    this.inspectionService.getById(id).subscribe({
      next: (response: ApiResponse<InspectionStepDetails>) => {
        this.loading = false;

        if (!response.isSuccess) {
          this.errorMessage = response.message || 'تعذر تحميل بيانات المعاينة';
          return;
        }

        this.fillForm(response.data);
      },
      error: err => {
        this.loading = false;
        console.error('Inspection edit GET error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل بيانات المعاينة';
      }
    });
  }

  fillForm(details: InspectionStepDetails): void {
    const inspectionNote =
      details.notes?.find(note => note.processStep === 'Inspection')?.content ||
      details.notes?.[0]?.content ||
      '';

    this.formModel = {
      inspectorName: details.inspectorName || '',
      opinion: details.opinion === 'NonCompliant' ? 'NonCompliant' : 'Compliant',
      inspectionNote
    };
  }

  onFilesSelected(event: Event, type: AttachmentType): void {
    const input = event.target as HTMLInputElement;
    const newFiles = Array.from(input.files || []);

    this.getFileArray(type).push(...newFiles);

    // نصفّر قيمة الـ input عشان لو المستخدم اختار نفس الملف تاني يتسجل صح
    input.value = '';
  }

  removeFile(type: AttachmentType, index: number): void {
    this.getFileArray(type).splice(index, 1);
  }

  private getFileArray(type: AttachmentType): File[] {
    if (type === 'entityLetters') return this.entityLetters;
    if (type === 'proofDocuments') return this.proofDocuments;
    if (type === 'engineeringReports') return this.engineeringReports;
    if (type === 'inspectionReports') return this.inspectionReports;
    return this.otherAttachments;
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

    this.inspectionService.updateInspection(this.item.id, formData).subscribe({
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