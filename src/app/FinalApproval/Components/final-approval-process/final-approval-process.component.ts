import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Observable, catchError, concatMap, from, map, throwError, toArray } from 'rxjs';

import {
  APPLICATION_STATUS_LABELS,
  ApplicationStatus,
  INSPECTION_OPINION_LABELS,
  InspectionOpinion,
  PAYMENT_STATE_LABELS,
  PROCESS_STEP_LABELS,
  PaymentState,
  ProcessStep,
  REVIEW_STATUS_LABELS,
  ReviewStatus,
} from '../../../Shared/Enums/enums';
import { formatDate, formatDateTime } from '../../../Shared/Helpers/date.helper';
import {
  FILE_ACCEPT,
  formatSize,
  iconByName,
  isImageFile,
  openFile,
  validateFile,
} from '../../../Shared/Helpers/file.helper';
import { SelectOption } from '../../../Shared/Models/SelectOption';
import { buildFileUrl } from '../../../Shared/Utils/file-url';

import { TransactionCodePipe } from '../../../Shared/Pipes/transaction-code.pipe';
import {
  ATTACHMENT_API_TYPES,
  AttachmentGroup,
  AttachmentType,
  FinalApprovalAttachment,
  FinalApprovalItem,
  FinalApprovalStepDetails,
} from '../../Models/final-approval';
import { FinalApprovalService } from '../../Services/final-approval.service';

// ============================================================
// Types & constants
// ============================================================

interface UploadField {
  type: AttachmentType;
  label: string;
}

type DeleteOperation = () => Observable<unknown>;

const SUCCESS_CLOSE_DELAY_MS = 900;

// بيطلّع أنسب رسالة خطأ من response الباك أو من الـ Error نفسه
function extractErrorMessage(err: any, fallback: string): string {
  return err?.error?.message || err?.error?.Message || err?.message || fallback;
}

// ============================================================
// Component
// ============================================================

@Component({
  selector: 'app-final-approval-process',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    TransactionCodePipe,
  ],
  templateUrl: './final-approval-process.component.html',
  styleUrl: './final-approval-process.component.scss',
})
export class FinalApprovalProcessComponent implements OnChanges, OnDestroy {
  @Input() item: FinalApprovalItem | null = null;

  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  // ===== إعدادات ثابتة =====
  readonly reviewStatusOptions: SelectOption[] = Object.values(ReviewStatus).map((value) => ({
    value,
    label: REVIEW_STATUS_LABELS[value],
  }));

  readonly paymentOptions: SelectOption[] = Object.values(PaymentState).map((value) => ({
    value,
    label: PAYMENT_STATE_LABELS[value],
  }));

  readonly uploadFields: UploadField[] = [
    { type: 'entityLetters', label: 'خطابات الجهة' },
    { type: 'proofDocuments', label: 'أوراق الثبوت' },
    { type: 'engineeringReports', label: 'التقارير الهندسية' },
    { type: 'inspectionReports', label: 'تقارير المعاينة' },
    { type: 'otherAttachments', label: 'مرفقات أخرى' },
  ];

  // helpers متاحة للـ template
  readonly formatDateTime = formatDateTime;
  readonly isImageFile = isImageFile;
  readonly openFile = openFile;
  readonly getFileUrl = buildFileUrl;
  readonly formatSize = formatSize;
  readonly iconByName = iconByName;
  readonly fileAccept = FILE_ACCEPT;
  readonly formatDate = formatDate;

  // ===== بيانات المعاملة =====
  details: FinalApprovalStepDetails | null = null;
  loading = false;
  errorMessage = '';

  // ===== الفورم =====
  form: FormGroup;
  attemptedSave = false;
  formErrorMessage = '';
  successMessage = '';

  // ===== حالة الحفظ =====
  saving = false;
  movingToArchive = false;

  // ===== المرفقات =====
  selectedFiles: Record<AttachmentType, File[]> = this.createEmptyRecord<File>();

  // رسائل الملفات المرفوضة، لكل خانة رفع على حدة
  fileErrors: Record<AttachmentType, string[]> = this.createEmptyRecord<string>();

  // مرفقات سابقة معلّم عليها للحذف، بتتنفذ عند الحفظ بس
  pendingDeleteIds = new Set<string>();

  failedImages = new Set<string>();
  private previews = new Map<File, string>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly finalApprovalService: FinalApprovalService,
  ) {
    this.form = this.buildForm();
  }

  // ============================================================
  // Lifecycle
  // ============================================================

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item'] && this.item?.id) {
      this.resetForm();
      this.loadDetails(this.item.id);
    }
  }

  ngOnDestroy(): void {
    this.clearPreviews();
  }

  close(): void {
    this.cancelled.emit();
  }

  // ============================================================
  // Permissions
  // ============================================================

  // الباك بيسمح بحذف مرفق اترفع في الخطوة الحالية بس
  canDelete(file: FinalApprovalAttachment): boolean {
    return file.uploadedAtStep === ProcessStep.FinalApproval;
  }

  // ============================================================
  // Form setup
  // ============================================================

  private buildForm(): FormGroup {
    return this.fb.group({
      reviewStatus: [null as ReviewStatus | null, Validators.required],
      isPaid: [null as PaymentState | null, Validators.required],
      note: [''],
    });
  }
  resetForm(): void {
    this.details = null;
    this.attemptedSave = false;
    this.formErrorMessage = '';
    this.successMessage = '';

    this.form.enable({ emitEvent: false });
    this.form.reset({ reviewStatus: null, isPaid: null, note: '' });

    this.resetAttachmentSelection();
    this.pendingDeleteIds.clear();
  }

  // الباك بيرجّع السجل مترتب، وأول عنصر هو آخر قرار
  fillForm(details: FinalApprovalStepDetails): void {
    const last = details.reviews?.[0];

    this.form.patchValue({
      reviewStatus: last?.reviewStatus ?? null,
      isPaid: last ? (last.isPaid ? PaymentState.Paid : PaymentState.NotPaid) : null,
      note: '',
    });
  }

  // ============================================================
  // Loading
  // ============================================================

  loadDetails(id: string): void {
    this.loading = true;
    this.errorMessage = '';
    this.details = null;
    this.failedImages.clear();
    this.pendingDeleteIds.clear();

    this.finalApprovalService.getFinalApprovalDetails(id).subscribe({
      next: (response) => {
        this.loading = false;

        if (!response.isSuccess || !response.data) {
          this.errorMessage = response.message || 'تعذر تحميل بيانات الموافقة النهائية';
          return;
        }

        this.details = response.data;
        this.fillForm(response.data);
      },
      error: (err) => {
        this.loading = false;
        console.error('FinalApproval process GET error:', err);
        this.errorMessage = extractErrorMessage(
          err,
          'حدث خطأ أثناء تحميل بيانات الموافقة النهائية',
        );
      },
    });
  }

  // ============================================================
  // New attachments (upload selection)
  // ============================================================

  private createEmptyRecord<T>(): Record<AttachmentType, T[]> {
    return {
      entityLetters: [],
      proofDocuments: [],
      engineeringReports: [],
      inspectionReports: [],
      otherAttachments: [],
    };
  }

  private resetAttachmentSelection(): void {
    this.clearPreviews();
    this.selectedFiles = this.createEmptyRecord<File>();
    this.fileErrors = this.createEmptyRecord<string>();
  }

  // الملف الغلط ما بيتضافش، وسبب رفضه بيظهر تحت خانته
  onFilesSelected(event: Event, type: AttachmentType): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    input.value = '';

    const accepted: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      const reason = validateFile(file);
      if (reason) errors.push(`"${file.name}": ${reason}`);
      else accepted.push(file);
    }

    this.fileErrors[type] = errors;
    this.selectedFiles[type] = [...this.selectedFiles[type], ...accepted];
  }

  removeFile(type: AttachmentType, index: number): void {
    const [file] = this.selectedFiles[type].splice(index, 1);

    const url = file ? this.previews.get(file) : undefined;
    if (url) {
      URL.revokeObjectURL(url);
      this.previews.delete(file);
    }
  }

  // معاينة مصغّرة للصور بس، والباقي بياخد أيقونة
  previewOf(file: File): string | null {
    if (!file.type.startsWith('image/')) return null;
    if (!this.previews.has(file)) this.previews.set(file, URL.createObjectURL(file));
    return this.previews.get(file)!;
  }

  private clearPreviews(): void {
    this.previews.forEach((url) => URL.revokeObjectURL(url));
    this.previews.clear();
  }

  // ============================================================
  // Existing attachments (display + mark for delete)
  // ============================================================

  getAttachmentGroups(details: FinalApprovalStepDetails): AttachmentGroup[] {
    return this.uploadFields.map(({ type, label }) => ({
      title: label,
      files: details[type] || [],
    }));
  }

  hasAnyAttachments(details: FinalApprovalStepDetails): boolean {
    return this.getAttachmentGroups(details).some((group) => group.files.length > 0);
  }

  // علّم للحذف، أو تراجع (التنفيذ الفعلي عند الحفظ)
  toggleDelete(file: FinalApprovalAttachment): void {
    if (this.pendingDeleteIds.has(file.id)) {
      this.pendingDeleteIds.delete(file.id);
    } else {
      this.pendingDeleteIds.add(file.id);
    }
  }

  // ============================================================
  // Save flow: save + upload → delete marked → move to archive (optional)
  // ============================================================

  save(moveToArchive = false): void {
    this.attemptedSave = true;
    this.formErrorMessage = '';
    this.successMessage = '';

    if (!this.item?.id) {
      this.formErrorMessage = 'لم يتم اختيار معاملة';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const id = this.item.id;
    const formData = this.buildFormData();

    this.startSaving(moveToArchive);

    this.finalApprovalService.saveFinalApproval(id, formData).subscribe({
      next: (response) => {
        if (!response.isSuccess) {
          this.stopSaving();
          this.formErrorMessage = response.message || 'تعذر حفظ قرار الموافقة النهائية';
          return;
        }

        this.applyDeletes(id, moveToArchive);
      },
      error: (err) => {
        console.error('FinalApproval PUT error:', err);
        this.stopSaving();
        this.formErrorMessage = extractErrorMessage(
          err,
          'حدث خطأ أثناء حفظ قرار الموافقة النهائية',
        );
      },
    });
  }

  private buildFormData(): FormData {
    const raw = this.form.getRawValue();
    const formData = new FormData();

    formData.append('ReviewStatus', raw.reviewStatus);
    formData.append('IsPaid', raw.isPaid);
    formData.append('Note', String(raw.note ?? '').trim());

    // أسماء الحقول في الباك: EntityLetters, ProofDocuments, ...
    this.uploadFields.forEach(({ type }) => {
      const fieldName = type.charAt(0).toUpperCase() + type.slice(1);
      this.selectedFiles[type].forEach((file) => formData.append(fieldName, file, file.name));
    });

    return formData;
  }

  private startSaving(moveToArchive: boolean): void {
    this.saving = true;
    this.movingToArchive = moveToArchive;
    this.form.disable({ emitEvent: false });
  }

  private stopSaving(): void {
    this.saving = false;
    this.movingToArchive = false;
    this.form.enable({ emitEvent: false });
  }

  // ---------- حذف المرفقات المعلّمة ----------

  // واحدة ورا التانية، وبيقف عند أول فشل
  private applyDeletes(id: string, moveToArchive: boolean): void {
    const ops = this.buildDeleteOps();

    if (!ops.length) {
      this.afterSave(id, moveToArchive);
      return;
    }

    from(ops)
      .pipe(
        concatMap((op) => op()),
        toArray(),
      )
      .subscribe({
        next: () => this.afterSave(id, moveToArchive),
        error: (err: Error) => this.onDeleteFailed(id, err.message),
      });
  }

  private buildDeleteOps(): DeleteOperation[] {
    const details = this.details;
    if (!details) return [];

    const ops: DeleteOperation[] = [];

    for (const { type } of this.uploadFields) {
      for (const attachment of details[type] ?? []) {
        if (this.pendingDeleteIds.has(attachment.id)) {
          ops.push(() => this.deleteAttachment(attachment, type));
        }
      }
    }

    return ops;
  }

  private deleteAttachment(
    attachment: FinalApprovalAttachment,
    type: AttachmentType,
  ): Observable<void> {
    const fallback = 'تعذر حذف المرفق';

    return this.finalApprovalService
      .deleteAttachment(attachment.id, ATTACHMENT_API_TYPES[type])
      .pipe(
        map((res) => {
          if (!res.isSuccess) {
            throw new Error(`حذف "${attachment.fileName}": ${res.message || fallback}`);
          }
          this.pendingDeleteIds.delete(attachment.id);
        }),
        catchError((err) => {
          // الـ Error اللي فوق مجهّزة بالفعل، أي حاجة تانية (HTTP error) بنجهّز لها رسالة
          const message =
            err instanceof Error
              ? err.message
              : `حذف "${attachment.fileName}": ${extractErrorMessage(err, fallback)}`;

          return throwError(() => new Error(message));
        }),
      );
  }

  // ---------- بعد الحفظ والحذف ----------

  private afterSave(id: string, moveToArchive: boolean): void {
    if (moveToArchive) {
      this.moveToArchive(id);
      return;
    }
    this.finishSuccess('تم حفظ قرار الموافقة النهائية بنجاح');
  }

  private moveToArchive(id: string): void {
    this.finalApprovalService.moveToArchive(id).subscribe({
      next: (res) => {
        if (!res.isSuccess) {
          this.onMoveFailed(id, res.message);
          return;
        }
        this.finishSuccess('تم حفظ القرار ونقل المعاملة للأرشيف بنجاح');
      },
      error: (err) => {
        console.error('FinalApproval move-to-archive error:', err);
        this.onMoveFailed(id, extractErrorMessage(err, ''));
      },
    });
  }

  private finishSuccess(message: string): void {
    this.saving = false;
    this.movingToArchive = false;
    this.successMessage = message;

    setTimeout(() => this.saved.emit(), SUCCESS_CLOSE_DELAY_MS);
  }

  // ---------- فشل جزئي (الحفظ نجح فعلًا) ----------

  // القرار اتحفظ فعلاً، لكن الحذف فشل
  private onDeleteFailed(id: string, reason: string): void {
    this.reloadAfterPartialSave(id);
    this.formErrorMessage = `تم حفظ القرار، لكن تعذر حذف بعض المرفقات: ${reason}`;
  }

  // القرار اتحفظ فعلاً لكن النقل للأرشيف اترفض
  private onMoveFailed(id: string, reason?: string): void {
    this.reloadAfterPartialSave(id);
    this.formErrorMessage = `تم حفظ القرار، لكن تعذر النقل للأرشيف: ${
      reason || 'حدث خطأ غير متوقع'
    }`;
  }

  // الملفات الجديدة اترفعت خلاص، فنفضّيها ونحمّل من جديد عشان متترفعش مرتين
  private reloadAfterPartialSave(id: string): void {
    this.stopSaving();
    this.resetAttachmentSelection();
    this.loadDetails(id);
  }

  // ============================================================
  // Display helpers
  // ============================================================

  getStepLabel(step: string | null | undefined): string {
    return PROCESS_STEP_LABELS[step as ProcessStep] || step || '-';
  }

  getOpinionLabel(opinion: InspectionOpinion | null | undefined): string {
    return opinion ? INSPECTION_OPINION_LABELS[opinion] || opinion : '-';
  }

  getFinalStatusLabel(status: ApplicationStatus | null | undefined): string {
    return status ? APPLICATION_STATUS_LABELS[status] || status : 'لم يتم اتخاذ قرار';
  }

  hasImageError(filePath: string): boolean {
    return this.failedImages.has(filePath);
  }

  onImageError(filePath: string): void {
    this.failedImages.add(filePath);
  }
  getReviewStatusLabel(status: ReviewStatus): string {
    return REVIEW_STATUS_LABELS[status] || status;
  }

  getPaymentLabel(isPaid: boolean): string {
    return PAYMENT_STATE_LABELS[isPaid ? PaymentState.Paid : PaymentState.NotPaid];
  }
}
