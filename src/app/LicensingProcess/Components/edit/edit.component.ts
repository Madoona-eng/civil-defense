import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';

import { ActivityTypeService } from '../../../ActivityType/Services/activity-type.service';
import { DistrictService } from '../../../District/Services/district.service';
import { RequestingEntityService } from '../../../RequestingEntity/Services/requesting-entity.service';
import { APPLICANT_ROLE_LABELS, ApplicantRole } from '../../../Shared/Enums/enums';
import { LookupItem } from '../../../Shared/Models/LookupItem';
import { SelectOption } from '../../../Shared/Models/SelectOption';

import {
  LicensingProcessDetails,
  LicensingProcessUpdateRequest,
} from '../../Models/licensing-process';
import { LicensingProcessService } from '../../Services/licensing-process.service';

function extractErrorMessage(err: any, fallback: string): string {
  return err?.error?.message || err?.error?.Message || err?.message || fallback;
}

@Component({
  selector: 'app-licensing-process-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss',
})
export class EditComponent implements OnChanges {
  @Input() processId: string | null = null;

  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  loading = false;
  saving = false;
  errorMessage = '';
  attemptedSave = false;

  requestingEntities: LookupItem[] = [];
  districts: LookupItem[] = [];
  activityTypes: LookupItem[] = [];

  readonly applicantRoleOptions: SelectOption[] = Object.values(ApplicantRole).map((value) => ({
    value,
    label: APPLICANT_ROLE_LABELS[value],
  }));

  form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly licensingProcessService: LicensingProcessService,
    private readonly requestingEntityService: RequestingEntityService,
    private readonly districtService: DistrictService,
    private readonly activityTypeService: ActivityTypeService,
    private readonly snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      requestingEntityId: ['', Validators.required],
      establishmentName: ['', [Validators.required, Validators.maxLength(200)]],
      establishmentAddress: ['', [Validators.required, Validators.maxLength(500)]],
      districtId: ['', Validators.required],
      activityTypeId: ['', Validators.required],
      applicantName: ['', [Validators.required, Validators.maxLength(200)]],
      applicantRole: [ApplicantRole.Owner, Validators.required],
      nationalId: ['', [Validators.required, Validators.pattern(/^\d{14}$/)]],
      responsibleManager: ['', [Validators.required, Validators.maxLength(200)]],
      phone: ['', [Validators.required, Validators.pattern(/^(010|011|012|015)\d{8}$/)]],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['processId'] && this.processId) {
      this.loadEditData(this.processId);
    }
  }

  // ---------- Loading ----------
  loadEditData(id: string): void {
    this.loading = true;
    this.errorMessage = '';
    this.attemptedSave = false;

    forkJoin({
      requestingEntities: this.requestingEntityService.getAll(),
      districts: this.districtService.getAll(),
      activityTypes: this.activityTypeService.getAll(),
      details: this.licensingProcessService.getById(id),
    }).subscribe({
      next: (result) => {
        this.loading = false;

        if (result.requestingEntities.isSuccess) {
          this.requestingEntities = result.requestingEntities.data || [];
        }
        if (result.districts.isSuccess) {
          this.districts = result.districts.data || [];
        }
        if (result.activityTypes.isSuccess) {
          this.activityTypes = result.activityTypes.data || [];
        }

        if (!result.details.isSuccess || !result.details.data) {
          this.errorMessage = result.details.message || 'تعذر تحميل بيانات المعاملة للتعديل';
          return;
        }

        this.fillForm(result.details.data);
      },
      error: (err) => {
        this.loading = false;
        console.error('LicensingProcess edit load error:', err);
        this.errorMessage = extractErrorMessage(err, 'حدث خطأ أثناء تحميل بيانات المعاملة');
      },
    });
  }

  private fillForm(details: LicensingProcessDetails): void {
    this.form.reset({
      requestingEntityId: this.findLookupId(this.requestingEntities, details.requestingEntity),
      establishmentName: details.establishmentName || '',
      establishmentAddress: details.establishmentAddress || '',
      districtId: this.findLookupId(this.districts, details.district),
      activityTypeId: this.findLookupId(this.activityTypes, details.activityType),
      applicantName: details.applicantName || '',
      applicantRole: (details.applicantRole as ApplicantRole) || ApplicantRole.Owner,
      nationalId: details.nationalId || '',
      responsibleManager: details.responsibleManager || '',
      phone: details.phone || '',
    });
  }

  private findLookupId(list: LookupItem[], name: string): string {
    return list.find((x) => x.name === name)?.id ?? '';
  }

  // ---------- Save ----------
  save(): void {
    this.attemptedSave = true;
    this.errorMessage = '';

    if (!this.processId) {
      this.errorMessage = 'لم يتم تحديد المعاملة المراد تعديلها';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    const request: LicensingProcessUpdateRequest = {
      requestingEntityId: raw.requestingEntityId,
      establishmentName: String(raw.establishmentName).trim(),
      establishmentAddress: String(raw.establishmentAddress).trim(),
      districtId: raw.districtId,
      activityTypeId: raw.activityTypeId,
      applicantName: String(raw.applicantName).trim(),
      applicantRole: raw.applicantRole,
      nationalId: String(raw.nationalId).trim(),
      responsibleManager: String(raw.responsibleManager).trim(),
      phone: String(raw.phone).trim(),
    };

    this.saving = true;
    this.form.disable({ emitEvent: false });

    this.licensingProcessService.update(this.processId, request).subscribe({
      next: (res) => {
        if (!res.isSuccess) {
          this.stopSaving();
          this.errorMessage = res.message || 'تعذر تعديل المعاملة';
          return;
        }

        this.saving = false;
        this.snackBar.open('تم تعديل المعاملة بنجاح', 'إغلاق', { duration: 2500 });
        this.saved.emit();
      },
      error: (err) => {
        this.stopSaving();
        console.error('LicensingProcess PUT error:', err);
        this.errorMessage = extractErrorMessage(err, 'حدث خطأ أثناء تعديل المعاملة');
      },
    });
  }

  private stopSaving(): void {
    this.saving = false;
    this.form.enable({ emitEvent: false });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
