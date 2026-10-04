import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import {
  ApiResponse,
  LicensingProcessDetails,
  LicensingProcessUpdateRequest,
  LookupItem,
} from '../../Models/licensing-process';

import { LicensingProcessService } from '../../Services/licensing-process.service';
import { RequestingEntityService } from '../../../RequestingEntity/Services/requesting-entity.service';
import { DistrictService } from '../../../District/Services/district.service';
import { ActivityTypeService } from '../../../ActivityType/Services/activity-type.service';
import { TranslatePipe } from '../../../Shared/Components/translate.pipe';
import { ApplicantRole } from '../../../Shared/Enums/enums';

@Component({
  selector: 'app-licensing-process-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent implements OnChanges {
  @Input() processId: string | null = null;

  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  requestingEntities: LookupItem[] = [];
  districts: LookupItem[] = [];
  activityTypes: LookupItem[] = [];

  readonly applicantRoleOptions = [
    { value: ApplicantRole.Owner, label: 'مالك' },
    { value: ApplicantRole.Proxy, label: 'وكيل' },
  ];

  formModel: LicensingProcessUpdateRequest = {
    requestingEntityId: '',
    establishmentName: '',
    establishmentAddress: '',
    districtId: '',
    activityTypeId: '',
    applicantName: '',
    applicantRole: ApplicantRole.Owner,
    nationalId: '',
    responsibleManager: '',
    phone: ''
  };

  constructor(
    private readonly licensingProcessService: LicensingProcessService,
    private readonly requestingEntityService: RequestingEntityService,
    private readonly districtService: DistrictService,
    private readonly activityTypeService: ActivityTypeService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['processId'] && this.processId) {
      this.loadEditData(this.processId);
    }
  }

  loadEditData(id: string): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    forkJoin({
      requestingEntities: this.requestingEntityService.getAll(),
      districts: this.districtService.getAll(),
      activityTypes: this.activityTypeService.getAll(),
      details: this.licensingProcessService.getById(id)
    }).subscribe({
      next: result => {
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

        if (!result.details.isSuccess) {
          this.errorMessage = result.details.message || 'فشل تحميل بيانات الترخيص للتعديل';
          return;
        }

        this.fillForm(result.details.data);
      },
      error: err => {
        this.loading = false;
        console.error('Edit load error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل بيانات الترخيص للتعديل';
      }
    });
  }

  fillForm(details: LicensingProcessDetails): void {
    this.formModel = {
      requestingEntityId: this.findLookupId(this.requestingEntities, details.requestingEntity),
      establishmentName: details.establishmentName || '',
      establishmentAddress: details.establishmentAddress || '',
      districtId: this.findLookupId(this.districts, details.district),
      activityTypeId: this.findLookupId(this.activityTypes, details.activityType),
      applicantName: details.applicantName || '',
      applicantRole: details.applicantRole === ApplicantRole.Proxy || details.applicantRole === 'Agent'
        ? ApplicantRole.Proxy
        : ApplicantRole.Owner,
      nationalId: details.nationalId || '',
      responsibleManager: details.responsibleManager || '',
      phone: details.phone || ''
    };
  }

  findLookupId(list: LookupItem[], name: string): string {
    const item = list.find(x => x.name === name);
    return item?.id || '';
  }

  save(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.processId) {
      this.errorMessage = 'لم يتم تحديد طلب الترخيص المراد تعديله';
      return;
    }

    if (!this.validateForm()) {
      return;
    }

    const request: LicensingProcessUpdateRequest = {
      establishmentName: this.formModel.establishmentName.trim(),
      establishmentAddress: this.formModel.establishmentAddress.trim(),
      requestingEntityId: this.formModel.requestingEntityId,
      districtId: this.formModel.districtId,
      activityTypeId: this.formModel.activityTypeId,
      applicantName: this.formModel.applicantName.trim(),
      applicantRole: this.formModel.applicantRole,
      nationalId: this.formModel.nationalId.trim(),
      responsibleManager: this.formModel.responsibleManager.trim(),
      phone: this.formModel.phone.trim(),
    };

    this.saving = true;

    this.licensingProcessService.update(this.processId, request).subscribe({
      next: (res: ApiResponse<boolean>) => {
        this.saving = false;

        if (!res.isSuccess) {
          this.errorMessage = res.message || 'فشل تحديث بيانات طلب الترخيص';
          return;
        }

        this.successMessage = res.message || 'تم تحديث بيانات طلب الترخيص بنجاح';

        setTimeout(() => {
          this.saved.emit();
        }, 900);
      },
      error: err => {
        this.saving = false;
        console.error('LicensingProcess PUT error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحديث بيانات طلب الترخيص';
      }
    });
  }

  validateForm(): boolean {
    if (!this.formModel.requestingEntityId) {
      this.errorMessage = 'يرجى اختيار الجهة الطالبة';
      return false;
    }

    if (!this.formModel.establishmentName.trim()) {
      this.errorMessage = 'يرجى إدخال اسم المنشأة';
      return false;
    }

    if (!this.formModel.establishmentAddress.trim()) {
      this.errorMessage = 'يرجى إدخال عنوان المنشأة';
      return false;
    }

    if (!this.formModel.districtId) {
      this.errorMessage = 'يرجى اختيار المركز / الحي';
      return false;
    }

    if (!this.formModel.activityTypeId) {
      this.errorMessage = 'يرجى اختيار نوع النشاط';
      return false;
    }

    if (!this.formModel.applicantName.trim()) {
      this.errorMessage = 'يرجى إدخال اسم مقدم الطلب';
      return false;
    }

    if (
      this.formModel.applicantRole !== ApplicantRole.Owner &&
      this.formModel.applicantRole !== ApplicantRole.Proxy
    ) {
      this.errorMessage = 'يرجى إدخال صفة مقدم الطلب';
      return false;
    }

    if (!this.formModel.nationalId.trim()) {
      this.errorMessage = 'يرجى إدخال الرقم القومي';
      return false;
    }

    if (!this.formModel.responsibleManager.trim()) {
      this.errorMessage = 'يرجى إدخال اسم المدير المسؤول';
      return false;
    }

    if (!this.formModel.phone.trim()) {
      this.errorMessage = 'يرجى إدخال رقم الهاتف';
      return false;
    }

    return true;
  }

  cancel(): void {
    this.cancelled.emit();
  }
}