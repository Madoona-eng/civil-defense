import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
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

import { APPLICANT_ROLE_LABELS, ApplicantRole } from '../../../Shared/Enums/enums';
import { TranslatePipe } from '../../../Shared/Components/translate.pipe';
import { formatDateForApi } from '../../../Shared/Helpers/date.helper';
import { ApiResponse } from '../../../Shared/Models/ApiResponse';
import { LookupItem } from '../../../Shared/Models/LookupItem';
import { CreateProcessDto } from '../../Models/new-license';
import { NewLicenseService } from '../../Services/new-license.service';

export interface CreateDialogData {
  requestingEntities: LookupItem[];
  districts: LookupItem[];
  activityTypes: LookupItem[];
}

type AttachmentField =
  | 'entityLetters'
  | 'proofDocuments'
  | 'engineeringReports'
  | 'otherAttachments';

class LocalTranslateService {
  instant(key: string): string {
    return key;
  }
}

@Component({
  selector: 'app-create',
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
    TranslatePipe
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent {
  form: FormGroup;
  saving = false;
  errorMessage: string | string[] = '';
  attemptedSave = false;
  private readonly translate = new LocalTranslateService();

  private readonly moveToInspectionFallbackError = 'newLicense.moveFallbackError';

  readonly applicantRoles = Object.values(ApplicantRole);
  readonly applicantRoleLabels = APPLICANT_ROLE_LABELS;

  readonly requestingEntities: LookupItem[];
  readonly districts: LookupItem[];
  readonly activityTypes: LookupItem[];

  attachments: Record<AttachmentField, File[]> = {
    entityLetters: [],
    proofDocuments: [],
    engineeringReports: [],
    otherAttachments: [],
  };

  constructor(
    private readonly fb: FormBuilder,
    private readonly newLicenseService: NewLicenseService,
    private readonly snackBar: MatSnackBar,
    private readonly dialogRef: MatDialogRef<CreateComponent>,
    @Inject(MAT_DIALOG_DATA) data: CreateDialogData,
  ) {
    this.requestingEntities = data.requestingEntities;
    this.districts = data.districts;
    this.activityTypes = data.activityTypes;

    this.form = this.fb.group({
      submissionDate: [null, [Validators.required, this.notFutureDateValidator.bind(this)]],
      requestingEntityId: ['', Validators.required],
      establishmentName: ['', [Validators.required, Validators.maxLength(200)]],
      establishmentAddress: ['', [Validators.required, Validators.maxLength(500)]],
      districtId: ['', Validators.required],
      activityTypeId: ['', Validators.required],
      applicantName: ['', [Validators.required, Validators.maxLength(200)]],
      applicantRole: ['', Validators.required],
      nationalId: ['', [Validators.required, Validators.pattern(/^\d{14}$/)]],
      responsibleManager: ['', [Validators.required, Validators.maxLength(200)]],
      phone: ['', [Validators.required, Validators.pattern(/^(010|011|012|015)\d{8}$/)]],
    });
  }

  private notFutureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const selected: Date = control.value;
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    return selected > today ? { futureDate: true } : null;
  }

  onFilesSelected(event: Event, field: AttachmentField): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    this.attachments[field] = [...this.attachments[field], ...Array.from(input.files)];
    input.value = '';
  }

  removeFile(field: AttachmentField, index: number): void {
    this.attachments[field] = this.attachments[field].filter((_, i) => i !== index);
  }

  save(moveToInspection = false): void {
    this.attemptedSave = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const raw = this.form.value;

    const dto: CreateProcessDto = {
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
      entityLetters: this.attachments.entityLetters,
      proofDocuments: this.attachments.proofDocuments,
      engineeringReports: this.attachments.engineeringReports,
      otherAttachments: this.attachments.otherAttachments,
    };

    this.newLicenseService.create(dto).subscribe({
      next: (res: ApiResponse<string>) => {
        if (!res.isSuccess || !res.data) {
          this.saving = false;
          this.errorMessage = res.message || this.translate.instant('newLicense.createFailed');
          return;
        }

        const processId = res.data;

        if (!moveToInspection) {
          this.saving = false;
          this.showSnackBar(res.message || 'newLicense.createSucceeded');
          (document.activeElement as HTMLElement)?.blur();
          this.dialogRef.close(true);
          return;
        }

        this.newLicenseService.moveToInspection(processId).subscribe({
          next: (moveRes: ApiResponse<boolean>) => {
            this.saving = false;

            if (!moveRes.isSuccess) {
              this.errorMessage = moveRes.message || this.translate.instant(this.moveToInspectionFallbackError);
              return;
            }

            this.showSnackBar('newLicense.movedOnCreate');
            (document.activeElement as HTMLElement)?.blur();
            this.dialogRef.close(true);
          },
          error: (err) => {
            this.saving = false;
            this.errorMessage =
              err?.error?.message || err?.message || this.translate.instant(this.moveToInspectionFallbackError);
            console.error('NewLicense moveToInspection error:', err);
          },
        });
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage =
          err?.error?.message || err?.message || this.translate.instant('newLicense.createError');
        console.error('NewLicense CREATE error:', err);
      },
    });
  }

  private showSnackBar(messageKey: string): void {
    const message = this.translate.instant(messageKey);
    const closeAction = this.translate.instant('common.close');
    this.snackBar.open(message, closeAction, { duration: 6000 });
  }

  cancel(): void {
    (document.activeElement as HTMLElement)?.blur();
    this.dialogRef.close(false);
  }
}