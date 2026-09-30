import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable, catchError, concatMap, from, map, throwError, toArray } from 'rxjs';

import { APPLICANT_ROLE_LABELS, ApplicantRole } from '../../../Shared/Enums/enums';
import { formatDateForApi, parseDateFromApi } from '../../../Shared/Helpers/date.helper';
import {
  FILE_ACCEPT,
  formatSize,
  iconByName,
  validateFile,
} from '../../../Shared/Helpers/file.helper';
import { ApiResponse } from '../../../Shared/Models/ApiResponse';
import { LookupItem } from '../../../Shared/Models/LookupItem';
import {
  ATTACHMENT_FIELDS,
  ATTACHMENT_TYPES,
  AttachmentField,
  AttachmentItem,
  UpdateProcessDto,
  emptyRecord,
  pickAttachments,
} from '../../Models/new-license';
import { NewLicenseService } from '../../Services/new-license.service';

// البيانات الحالية للمعاملة (بالـ IDs مش بالأسماء)
export interface EditProcessData {
  id: string;
  submissionDate: string;
  establishmentName: string;
  establishmentAddress: string;
  requestingEntityId: string;
  districtId: string;
  activityTypeId: string;
  applicantName: string;
  applicantRole: ApplicantRole;
  nationalId: string;
  responsibleManager: string;
  phone: string;
}

export interface EditDialogData {
  process: EditProcessData;
  attachments: Record<AttachmentField, AttachmentItem[]>;
  requestingEntities: LookupItem[];
  districts: LookupItem[];
  activityTypes: LookupItem[];
}

// ملف جديد لسه ما اترفعش
interface PendingFile {
  file: File;
  previewUrl: string | null;
}

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss',
})
export class EditComponent implements OnDestroy {
  form: FormGroup;
  saving = false;
  errorMessage = '';
  attemptedSave = false;

  readonly applicantRoles = Object.values(ApplicantRole);
  readonly applicantRoleLabels = APPLICANT_ROLE_LABELS;

  readonly requestingEntities: LookupItem[];
  readonly districts: LookupItem[];
  readonly activityTypes: LookupItem[];

  // ---------- Attachments ----------
  readonly fileAccept = FILE_ACCEPT;

  readonly attachmentGroups = ATTACHMENT_FIELDS.map((field) => ({
    field,
    label: ATTACHMENT_TYPES[field].label,
  }));

  // المرفقات الموجودة على السيرفر
  attachments: Record<AttachmentField, AttachmentItem[]>;

  // تغييرات معلّقة لحد ما المستخدم يدوس حفظ
  pendingUploads = emptyRecord<PendingFile>();
  pendingDeleteIds = new Set<string>();

  // رسائل الملفات المرفوضة، لكل خانة رفع على حدة
  fileErrors = emptyRecord<string>();

  readonly formatSize = formatSize;
  readonly iconByName = iconByName;

  private readonly processId: string;

  // نسخة من البيانات الأصلية عشان نرجّعها لو حصل فشل (rollback)
  private readonly originalDto: UpdateProcessDto;

  // بتبقى true بعد ما البيانات تتحفظ فعلًا (وما اتعملهاش rollback)
  private dataSaved = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly newLicenseService: NewLicenseService,
    private readonly snackBar: MatSnackBar,
    private readonly dialogRef: MatDialogRef<EditComponent>,
    @Inject(MAT_DIALOG_DATA) data: EditDialogData,
  ) {
    this.requestingEntities = data.requestingEntities;
    this.districts = data.districts;
    this.activityTypes = data.activityTypes;
    this.attachments = data.attachments;

    const p = data.process;
    this.processId = p.id;

    this.originalDto = {
      submissionDate: formatDateForApi(parseDateFromApi(p.submissionDate))!,
      requestingEntityId: p.requestingEntityId,
      establishmentName: p.establishmentName,
      establishmentAddress: p.establishmentAddress,
      districtId: p.districtId,
      activityTypeId: p.activityTypeId,
      applicantName: p.applicantName,
      applicantRole: p.applicantRole,
      nationalId: p.nationalId,
      responsibleManager: p.responsibleManager,
      phone: p.phone,
    };

    this.form = this.fb.group({
      submissionDate: [
        parseDateFromApi(p.submissionDate),
        [Validators.required, this.notFutureDateValidator],
      ],
      requestingEntityId: [p.requestingEntityId, Validators.required],
      establishmentName: [p.establishmentName, [Validators.required, Validators.maxLength(200)]],
      establishmentAddress: [
        p.establishmentAddress,
        [Validators.required, Validators.maxLength(500)],
      ],
      districtId: [p.districtId, Validators.required],
      activityTypeId: [p.activityTypeId, Validators.required],
      applicantName: [p.applicantName, [Validators.required, Validators.maxLength(200)]],
      applicantRole: [p.applicantRole, Validators.required],
      nationalId: [p.nationalId, [Validators.required, Validators.pattern(/^\d{14}$/)]],
      responsibleManager: [p.responsibleManager, [Validators.required, Validators.maxLength(200)]],
      phone: [p.phone, [Validators.required, Validators.pattern(/^(010|011|012|015)\d{8}$/)]],
    });
  }

  private notFutureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const selected: Date = control.value;
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    return selected > today ? { futureDate: true } : null;
  }

  // ---------- Attachments: تغييرات محلية بس ----------
  // الملف الغلط ما بيتضافش، وسبب رفضه بيظهر تحت خانته
  onFilesSelected(event: Event, field: AttachmentField): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    input.value = '';

    const accepted: PendingFile[] = [];
    const errors: string[] = [];

    for (const file of files) {
      const reason = validateFile(file);
      if (reason) {
        errors.push(`"${file.name}": ${reason}`);
      } else {
        accepted.push({
          file,
          previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        });
      }
    }

    this.fileErrors[field] = errors;
    this.pendingUploads[field] = [...this.pendingUploads[field], ...accepted];
  }

  removePending(field: AttachmentField, index: number): void {
    this.revokePreview(this.pendingUploads[field][index]);
    this.pendingUploads[field] = this.pendingUploads[field].filter((_, i) => i !== index);
  }

  // علّم للحذف، أو تراجع
  toggleDelete(file: AttachmentItem): void {
    if (this.pendingDeleteIds.has(file.id)) {
      this.pendingDeleteIds.delete(file.id);
    } else {
      this.pendingDeleteIds.add(file.id);
    }
  }

  private revokePreview(p: PendingFile | undefined): void {
    if (p?.previewUrl) URL.revokeObjectURL(p.previewUrl);
  }

  // ---------- Attachments: helpers للعرض ----------
  fileUrl(file: AttachmentItem): string {
    return this.newLicenseService.buildFileUrl(file.filePath);
  }

  openFile(file: AttachmentItem): void {
    window.open(this.fileUrl(file), '_blank');
  }

  isImage(file: AttachmentItem): boolean {
    return /\.(png|jpe?g|gif|webp|bmp)$/i.test(file.fileName);
  }

  // ---------- Save ----------
  save(): void {
    this.attemptedSave = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const raw = this.form.value;

    const dto: UpdateProcessDto = {
      submissionDate: formatDateForApi(raw.submissionDate)!,
      requestingEntityId: raw.requestingEntityId,
      establishmentName: raw.establishmentName,
      establishmentAddress: raw.establishmentAddress,
      districtId: raw.districtId,
      activityTypeId: raw.activityTypeId,
      applicantName: raw.applicantName,
      applicantRole: raw.applicantRole,
      nationalId: raw.nationalId,
      responsibleManager: raw.responsibleManager,
      phone: raw.phone,
    };

    // 1) البيانات الأول (لو فشلت مفيش أي حاجة تانية بتتنفذ)
    this.newLicenseService.update(this.processId, dto).subscribe({
      next: (res: ApiResponse<boolean>) => {
        if (!res.isSuccess) {
          this.saving = false;
          this.errorMessage = res.message || 'تعذر تعديل المعاملة';
          return;
        }

        this.dataSaved = true;

        // 2) بعدها المرفقات
        this.applyAttachmentChanges();
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err?.error?.message || err?.message || 'حدث خطأ أثناء تعديل المعاملة';
        console.error('NewLicense EDIT error:', err);
      },
    });
  }

  // الرفع الأول ثم الحذف (الحذف آخر حاجة لأنه ما يتراجعش عنه).
  // التنفيذ واحدة ورا التانية، وبيقف عند أول فشل.
  private applyAttachmentChanges(): void {
    const ops = this.buildAttachmentOps();

    if (!ops.length) {
      this.finish();
      return;
    }

    from(ops)
      .pipe(
        concatMap((op) => op()),
        toArray(),
      )
      .subscribe({
        next: () => this.finish(),
        error: (err: Error) => this.rollbackData(err.message),
      });
  }

  private buildAttachmentOps(): (() => Observable<unknown>)[] {
    const uploads: (() => Observable<unknown>)[] = [];
    const deletes: (() => Observable<unknown>)[] = [];

    for (const { field, label } of this.attachmentGroups) {
      const types = ATTACHMENT_TYPES[field];

      // الرفع (طلب واحد لكل نوع)
      const pending = this.pendingUploads[field];
      if (pending.length) {
        uploads.push(() =>
          this.newLicenseService
            .addAttachments(
              this.processId,
              types.type,
              pending.map((p) => p.file),
            )
            .pipe(
              map((res) => {
                if (!res.isSuccess) {
                  throw new Error(`${label}: ${res.message || 'تعذر رفع الملفات'}`);
                }

                pending.forEach((p) => this.revokePreview(p));
                this.pendingUploads[field] = [];
              }),
              catchError((err) =>
                throwError(
                  () =>
                    new Error(
                      err instanceof Error
                        ? err.message
                        : `${label}: ${err?.error?.message || err?.message || 'تعذر رفع الملفات'}`,
                    ),
                ),
              ),
            ),
        );
      }

      // الحذف
      const toDelete = this.attachments[field].filter((a) => this.pendingDeleteIds.has(a.id));
      for (const att of toDelete) {
        deletes.push(() =>
          this.newLicenseService.deleteAttachment(att.id, types.type).pipe(
            map((res) => {
              if (!res.isSuccess) throw new Error(res.message || 'تعذر حذف المرفق');

              this.pendingDeleteIds.delete(att.id);
              this.attachments[field] = this.attachments[field].filter((a) => a.id !== att.id);
            }),
            catchError((err) =>
              throwError(
                () =>
                  new Error(
                    err instanceof Error
                      ? err.message
                      : `حذف "${att.fileName}": ${err?.error?.message || err?.message || 'تعذر حذف المرفق'}`,
                  ),
              ),
            ),
          ),
        );
      }
    }

    return [...uploads, ...deletes];
  }

  // فشل جزء من المرفقات: نرجّع البيانات لأصلها ونوضح السبب
  private rollbackData(reason: string): void {
    this.newLicenseService.update(this.processId, this.originalDto).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.dataSaved = false;
          this.failSave(`لم يتم حفظ التعديلات. السبب: ${reason}`);
        } else {
          this.failSave(
            `تعذر إتمام التعديلات (${reason}) وتعذر إرجاع البيانات لحالتها السابقة، يرجى مراجعة بيانات المعاملة`,
          );
        }
      },
      error: () =>
        this.failSave(
          `تعذر إتمام التعديلات (${reason}) وتعذر إرجاع البيانات لحالتها السابقة، يرجى مراجعة بيانات المعاملة`,
        ),
    });
  }

  private failSave(message: string): void {
    this.saving = false;
    this.errorMessage = message;
    this.reloadAttachments();
  }

  // بيحدّث القائمة بعد أي فشل (ممكن يكون جزء اترفع)
  private reloadAttachments(): void {
    this.newLicenseService.getById(this.processId).subscribe({
      next: (res) => {
        if (!res.isSuccess || !res.data) return;
        this.attachments = pickAttachments(res.data);
      },
    });
  }

  private finish(): void {
    this.saving = false;
    this.snackBar.open('تم تعديل المعاملة بنجاح', 'إغلاق', { duration: 6000 });
    (document.activeElement as HTMLElement)?.blur();
    this.dialogRef.close(true);
  }

  cancel(): void {
    (document.activeElement as HTMLElement)?.blur();
    this.dialogRef.close(this.dataSaved);
  }

  ngOnDestroy(): void {
    for (const { field } of this.attachmentGroups) {
      this.pendingUploads[field].forEach((p) => this.revokePreview(p));
    }
  }
}
