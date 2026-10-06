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
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { catchError, concatMap, from, map, Observable, throwError, toArray } from 'rxjs';

import {
  ApiResponse,
  ATTACHMENT_API_TYPES,
  AttachmentGroup,
  AttachmentType,
  InspectionAttachment,
  InspectionItem,
  InspectionStepDetails,
} from '../../Models/inspection';

import { InspectionService } from '../../Services/inspection.service';

import { AuthService } from '../../../auth/services/auth.service';
import {
  INSPECTION_OPINION_LABELS,
  InspectionOpinion,
  PROCESS_STEP_LABELS,
  ProcessStep,
  RETURN_STATE_LABELS,
  ReturnState,
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

// ============================================================
// Types & constants
// ============================================================
interface UploadField {
  type: AttachmentType;
  label: string;
}

type DeleteOperation = () => Observable<unknown>;

const FINAL_APPROVAL_ROLES = ['Inspector', 'SuperAdmin'];
const INSPECTOR_NAME_MAX_LENGTH = 200;
const SUCCESS_CLOSE_DELAY_MS = 900;

// فاضي أو مسافات بس = مش مقبول
function notBlank(control: AbstractControl): ValidationErrors | null {
  return String(control.value ?? '').trim() ? null : { required: true };
}

// بيطلّع أنسب رسالة خطأ من response الباك أو من الـ Error نفسه
function extractErrorMessage(err: any, fallback: string): string {
  return err?.error?.message || err?.error?.Message || err?.message || fallback;
}

// ============================================================
// Component
// ============================================================

@Component({
  selector: 'app-inspection-process',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './inspection-process.component.html',
  styleUrl: './inspection-process.component.scss',
})
export class InspectionProcessComponent implements OnChanges, OnDestroy {
  @Input() item: InspectionItem | null = null;

  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  // ===== إعدادات ثابتة =====
  readonly opinionOptions: SelectOption[] = Object.values(InspectionOpinion).map((value) => ({
    value,
    label: INSPECTION_OPINION_LABELS[value],
  }));

  // بتستخدم في الرفع، وفي عناوين مجموعات المرفقات السابقة
  readonly uploadFields: UploadField[] = [
    { type: 'entityLetters', label: 'خطابات الجهة' },
    { type: 'proofDocuments', label: 'أوراق الثبوت' },
    { type: 'engineeringReports', label: 'التقارير الهندسية' },
    { type: 'inspectionReports', label: 'تقارير المعاينة' },
    { type: 'otherAttachments', label: 'مرفقات أخرى' },
  ];

  // helpers متاحة للـ template
  readonly formatDate = formatDate;
  readonly formatDateTime = formatDateTime;
  readonly isImageFile = isImageFile;
  readonly openFile = openFile;
  readonly getFileUrl = buildFileUrl;
  readonly formatSize = formatSize;
  readonly iconByName = iconByName;
  readonly fileAccept = FILE_ACCEPT;

  // ===== بيانات المعاملة =====
  details: InspectionStepDetails | null = null;
  loading = false;
  errorMessage = '';

  // ===== الفورم =====
  form: FormGroup;
  attemptedSave = false;
  formErrorMessage = '';
  successMessage = '';

  // ===== حالة الحفظ =====
  saving = false;
  movingToFinalApproval = false;

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
    private readonly inspectionService: InspectionService,
    private readonly authService: AuthService,
  ) {
    this.form = this.buildForm();
    this.listenToOpinionChanges();
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

  get canMoveToFinalApproval(): boolean {
    const role = this.authService.getRole();
    return !!role && FINAL_APPROVAL_ROLES.includes(role);
  }

  // الباك بيسمح بحذف مرفق اترفع في الخطوة الحالية بس
  canDelete(file: InspectionAttachment): boolean {
    return file.uploadedAtStep === ProcessStep.Inspection;
  }

  // ============================================================
  // Form setup & note validation
  // ============================================================

  private buildForm(): FormGroup {
    return this.fb.group({
      inspectorName: ['', [notBlank, Validators.maxLength(INSPECTOR_NAME_MAX_LENGTH)]],
      opinion: [null as InspectionOpinion | null, Validators.required],
      inspectionNote: [''],
    });
  }

  private listenToOpinionChanges(): void {
    this.form.controls['opinion'].valueChanges.subscribe(() => this.updateNoteValidators());
  }

  get isNonCompliant(): boolean {
    return this.form.controls['opinion'].value === InspectionOpinion.NonCompliant;
  }

  private get hasInspectionNote(): boolean {
    return !!this.details?.notes?.some((n) => n.processStep === ProcessStep.Inspection);
  }

  // الملاحظة مطلوبة لو المعاملة مرتجعة، أو غير مستوفي ومفيش ملاحظة معاينة سابقة
  get isNoteRequired(): boolean {
    if (this.details?.isReturned) return true;
    return this.isNonCompliant && !this.hasInspectionNote;
  }

  get noteRequiredMessage(): string {
    return this.details?.isReturned
      ? 'الملاحظة مطلوبة لأن المعاملة مرتجعة'
      : 'يجب إدخال السبب عند عدم الاستيفاء';
  }
  private updateNoteValidators(): void {
    const note = this.form.controls['inspectionNote'];

    if (this.isNoteRequired) {
      note.addValidators(notBlank);
    } else {
      note.removeValidators(notBlank);
    }

    note.updateValueAndValidity({ emitEvent: false });
  }

  resetForm(): void {
    this.details = null;
    this.attemptedSave = false;
    this.formErrorMessage = '';
    this.successMessage = '';

    this.form.enable({ emitEvent: false });
    this.form.reset({ inspectorName: '', opinion: null, inspectionNote: '' });

    this.resetAttachmentSelection();
    this.pendingDeleteIds.clear();
  }

  fillForm(details: InspectionStepDetails): void {
    this.form.patchValue({
      inspectorName: details.inspectorName || '',
      opinion: details.opinion ?? null,
      inspectionNote: '',
    });

    // details اتحمّلت، فشرط "مرتجعة" ممكن يكون اتغير
    this.updateNoteValidators();
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
        this.errorMessage = extractErrorMessage(err, 'حدث خطأ أثناء تحميل بيانات المعاينة');
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

  getAttachmentGroups(details: InspectionStepDetails): AttachmentGroup[] {
    return this.uploadFields.map(({ type, label }) => ({
      title: label,
      files: details[type] || [],
    }));
  }

  hasAnyAttachments(details: InspectionStepDetails): boolean {
    return this.getAttachmentGroups(details).some((group) => group.files.length > 0);
  }

  // علّم للحذف، أو تراجع (التنفيذ الفعلي عند الحفظ)
  toggleDelete(file: InspectionAttachment): void {
    if (this.pendingDeleteIds.has(file.id)) {
      this.pendingDeleteIds.delete(file.id);
    } else {
      this.pendingDeleteIds.add(file.id);
    }
  }

  // ============================================================
  // Save flow: save + upload → delete marked → move (optional)
  // ============================================================

  save(moveToFinalApproval = false): void {
    this.attemptedSave = true;
    this.formErrorMessage = '';
    this.successMessage = '';

    if (!this.item?.id) {
      this.formErrorMessage = 'لم يتم اختيار معاينة';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const id = this.item.id;
    const formData = this.buildFormData();

    this.startSaving(moveToFinalApproval);

    this.inspectionService.updateInspection(id, formData).subscribe({
      next: (response: ApiResponse<boolean>) => {
        if (!response.isSuccess) {
          this.stopSaving();
          this.formErrorMessage = response.message || 'تعذر حفظ المعاينة';
          return;
        }

        this.applyDeletes(id, moveToFinalApproval);
      },
      error: (err) => {
        console.error('Inspection PUT error:', err);
        this.stopSaving();
        this.formErrorMessage = extractErrorMessage(err, 'حدث خطأ أثناء حفظ المعاينة');
      },
    });
  }

  private buildFormData(): FormData {
    const raw = this.form.getRawValue();
    const formData = new FormData();

    formData.append('InspectorName', String(raw.inspectorName).trim());
    formData.append('Opinion', raw.opinion);
    formData.append('InspectionNote', String(raw.inspectionNote ?? '').trim());

    // أسماء الحقول في الباك: EntityLetters, ProofDocuments, ...
    this.uploadFields.forEach(({ type }) => {
      const fieldName = type.charAt(0).toUpperCase() + type.slice(1);
      this.selectedFiles[type].forEach((file) => formData.append(fieldName, file, file.name));
    });

    return formData;
  }

  private startSaving(moveToFinalApproval: boolean): void {
    this.saving = true;
    this.movingToFinalApproval = moveToFinalApproval;
    this.form.disable({ emitEvent: false });
  }

  private stopSaving(): void {
    this.saving = false;
    this.movingToFinalApproval = false;
    this.form.enable({ emitEvent: false });
  }

  // ---------- حذف المرفقات المعلّمة ----------

  // واحدة ورا التانية، وبيقف عند أول فشل
  private applyDeletes(id: string, moveToFinalApproval: boolean): void {
    const ops = this.buildDeleteOps();

    if (!ops.length) {
      this.afterSave(id, moveToFinalApproval);
      return;
    }

    from(ops)
      .pipe(
        concatMap((op) => op()),
        toArray(),
      )
      .subscribe({
        next: () => this.afterSave(id, moveToFinalApproval),
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
    attachment: InspectionAttachment,
    type: AttachmentType,
  ): Observable<void> {
    const fallback = 'تعذر حذف المرفق';

    return this.inspectionService.deleteAttachment(attachment.id, ATTACHMENT_API_TYPES[type]).pipe(
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

  private afterSave(id: string, moveToFinalApproval: boolean): void {
    if (moveToFinalApproval) {
      this.moveToFinalApproval(id);
      return;
    }
    this.finishSuccess('تم حفظ المعاينة بنجاح');
  }

  private moveToFinalApproval(id: string): void {
    this.inspectionService.moveToFinalApproval(id).subscribe({
      next: (res: ApiResponse<boolean>) => {
        if (!res.isSuccess) {
          this.onMoveFailed(id, res.message);
          return;
        }
        this.finishSuccess('تم حفظ المعاينة ونقلها للموافقة النهائية بنجاح');
      },
      error: (err) => {
        console.error('Inspection move-to-final-approval error:', err);
        this.onMoveFailed(id, extractErrorMessage(err, ''));
      },
    });
  }

  private finishSuccess(message: string): void {
    this.saving = false;
    this.movingToFinalApproval = false;
    this.successMessage = message;

    setTimeout(() => this.saved.emit(), SUCCESS_CLOSE_DELAY_MS);
  }

  // ---------- فشل جزئي (الحفظ نجح فعلًا) ----------

  // المعاينة اتحفظت فعلاً، لكن الحذف فشل
  private onDeleteFailed(id: string, reason: string): void {
    this.reloadAfterPartialSave(id);
    this.formErrorMessage = `تم حفظ المعاينة، لكن تعذر حذف بعض المرفقات: ${reason}`;
  }

  // الحفظ نجح فعلاً لكن النقل اترفض (مثلاً مرفقات ناقصة)
  private onMoveFailed(id: string, reason?: string): void {
    this.reloadAfterPartialSave(id);
    this.formErrorMessage = `تم حفظ المعاينة، لكن تعذر النقل للموافقة النهائية: ${
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

  getReturnStateLabel(isReturned: boolean | undefined): string {
    return RETURN_STATE_LABELS[isReturned ? ReturnState.Returned : ReturnState.NotReturned];
  }

  hasImageError(filePath: string): boolean {
    return this.failedImages.has(filePath);
  }

  onImageError(filePath: string): void {
    this.failedImages.add(filePath);
  }
}
