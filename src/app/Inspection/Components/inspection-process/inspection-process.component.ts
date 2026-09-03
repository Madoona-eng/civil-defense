import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  ApiResponse,
  InspectionStepDetails,
  InspectionFormModel,
  InspectionItem,
  AttachmentType,
  AttachmentGroup,
} from '../../Models/inspection';

import { InspectionService } from '../../Services/inspection.service';

import {
  PROCESS_STEP_LABELS,
  INSPECTION_OPINION_LABELS,
  ProcessStep,
  InspectionOpinion,
} from '../../../Shared/Enums/enums';





@Component({
  selector: 'app-inspection-process',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inspection-process.component.html',
  styleUrl: './inspection-process.component.scss',
})
export class InspectionProcessComponent implements OnChanges {
  // ===== Input جديد: بديل processId و item القدامى، ده اللي هيوصل من الصفحة الأب =====
  @Input() item: InspectionItem | null = null;

  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  // ===== حالة تحميل بيانات السياق (details) =====
  details: InspectionStepDetails | null = null;
  loading = false;
  errorMessage = '';
  failedImages = new Set<string>();

  // ===== حالة الفورم (منقولة زي ما هي من EditComponent) =====
  saving = false;
  formErrorMessage = '';
  successMessage = '';

  formModel: InspectionFormModel = {
    inspectorName: '',
    opinion: 'Compliant',
    inspectionNote: '',
  };

  entityLetters: File[] = [];
  proofDocuments: File[] = [];
  engineeringReports: File[] = [];
  inspectionReports: File[] = [];
  otherAttachments: File[] = [];

  constructor(private readonly inspectionService: InspectionService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item'] && this.item?.id) {
      this.resetForm();
      this.loadDetails(this.item.id);
    }
  }

  // ===== تحميل بيانات السياق: بتحل محل استدعاءين منفصلين كانوا في details و edit =====
  loadDetails(id: string): void {
    this.loading = true;
    this.errorMessage = '';
    this.details = null;
    this.failedImages.clear();

    this.inspectionService.getById(id).subscribe({
      next: (response: ApiResponse<InspectionStepDetails>) => {
        this.loading = false;

        if (!response.isSuccess) {
          this.errorMessage = response.message || 'تعذر تحميل بيانات المعاينة';
          return;
        }

        this.details = response.data;
        this.fillForm(response.data);
      },
      error: (err) => {
        this.loading = false;
        console.error('Inspection process GET error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل بيانات المعاينة';
      },
    });
  }

  close(): void {
    this.cancelled.emit();
  }

  // ============================================================
  // منطق الفورم — منقول من EditComponent زي ما هو
  // ============================================================

  resetForm(): void {
    this.formErrorMessage = '';
    this.successMessage = '';

    this.formModel = {
      inspectorName: '',
      opinion: 'Compliant',
      inspectionNote: '',
    };

    this.entityLetters = [];
    this.proofDocuments = [];
    this.engineeringReports = [];
    this.inspectionReports = [];
    this.otherAttachments = [];
  }

  fillForm(details: InspectionStepDetails): void {
    this.formModel = {
      inspectorName: details.inspectorName || '',
      opinion:
        details.opinion === 'NonCompliant' ? 'NonCompliant' : 'Compliant',
      inspectionNote: '',
    };
  }
  onFilesSelected(event: Event, type: AttachmentType): void {
    const input = event.target as HTMLInputElement;
    const newFiles = Array.from(input.files || []);

    this.getFileArray(type).push(...newFiles);
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
    this.formErrorMessage = '';
    this.successMessage = '';

    if (!this.item?.id) {
      this.formErrorMessage = 'لم يتم تحديد معاملة المعاينة';
      return;
    }

    if (!this.validateForm()) {
      return;
    }

    const formData = new FormData();

    formData.append('InspectorName', this.formModel.inspectorName.trim());
    formData.append('Opinion', this.formModel.opinion);
    formData.append('InspectionNote', this.formModel.inspectionNote.trim());

    this.entityLetters.forEach((file) =>
      formData.append('EntityLetters', file, file.name),
    );
    this.proofDocuments.forEach((file) =>
      formData.append('ProofDocuments', file, file.name),
    );
    this.engineeringReports.forEach((file) =>
      formData.append('EngineeringReports', file, file.name),
    );
    this.inspectionReports.forEach((file) =>
      formData.append('InspectionReports', file, file.name),
    );
    this.otherAttachments.forEach((file) =>
      formData.append('OtherAttachments', file, file.name),
    );

    this.saving = true;

    this.inspectionService.updateInspection(this.item.id, formData).subscribe({
      next: (response: ApiResponse<boolean>) => {
        this.saving = false;

        if (!response.isSuccess) {
          this.formErrorMessage =
            response.message || 'تعذر حفظ بيانات المعاينة';
          return;
        }

        this.successMessage =
          response.message || 'تم حفظ بيانات المعاينة بنجاح';

        setTimeout(() => {
          this.saved.emit();
        }, 900);
      },
      error: (err) => {
        this.saving = false;
        console.error('Inspection PUT error:', err);

        this.formErrorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء حفظ بيانات المعاينة';
      },
    });
  }

  validateForm(): boolean {
    if (!this.formModel.inspectorName.trim()) {
      this.formErrorMessage = 'من فضلك أدخلي اسم المعاين';
      return false;
    }

    if (!this.formModel.opinion) {
      this.formErrorMessage = 'من فضلك اختاري الرأي';
      return false;
    }

    if (this.details?.isReturned && !this.formModel.inspectionNote.trim()) {
      this.formErrorMessage = 'يجب إدخال ملاحظة عند إعادة إجراء المعاينة';
      return false;
    }

    if (
      this.formModel.opinion === 'NonCompliant' &&
      !this.formModel.inspectionNote.trim()
    ) {
      this.formErrorMessage = 'يجب إدخال السبب عند عدم الاستيفاء';
      return false;
    }

    return true;
  }

  // ============================================================
  // helpers العرض — منقولة من DetailsComponent زي ما هي
  // ============================================================

  getStepLabel(step: string | null | undefined): string {
    return PROCESS_STEP_LABELS[step as ProcessStep] || step || '-';
  }

  getOpinionLabel(opinion: string | null | undefined): string {
    return (
      INSPECTION_OPINION_LABELS[opinion as InspectionOpinion] || opinion || '-'
    );
  }

  getFileUrl(filePath: string): string {
    return this.inspectionService.buildFileUrl(filePath);
  }

  isImageFile(fileName: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    const lowerName = fileName.toLowerCase();
    return imageExtensions.some((extension) => lowerName.endsWith(extension));
  }

  hasImageError(filePath: string): boolean {
    return this.failedImages.has(filePath);
  }

  onImageError(filePath: string): void {
    this.failedImages.add(filePath);
  }

  getAttachmentGroups(details: InspectionStepDetails): AttachmentGroup[] {
    return [
      { title: 'خطابات الجهة', files: details.entityLetters || [] },
      { title: 'مستندات الإثبات', files: details.proofDocuments || [] },
      { title: 'التقارير الهندسية', files: details.engineeringReports || [] },
      { title: 'تقارير المعاينة', files: details.inspectionReports || [] },
      { title: 'مرفقات أخرى', files: details.otherAttachments || [] },
    ];
  }

  formatDate(date: string | null | undefined): string {
    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
