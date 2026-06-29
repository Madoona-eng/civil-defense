import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import {
  ApiResponse,
  LicensingProcessCreateRequest,
  LicensingProcessDetails,
  LookupItem
} from '../../Models/licensing-process';

import { LicensingProcessService } from '../../Services/licensing-process.service';
import { RequestingEntityService } from '../../../RequestingEntity/Services/requesting-entity.service';
import { DistrictService } from '../../../District/Services/district.service';
import { ActivityTypeService } from '../../../ActivityType/Services/activity-type.service';

@Component({
  selector: 'app-licensing-process-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  formModel: LicensingProcessCreateRequest = {
    submissionDate: '',
    requestingEntityId: '',
    establishmentName: '',
    establishmentAddress: '',
    districtId: '',
    activityTypeId: '',
    applicantName: '',
    applicantRole: '',
    nationalId: '',
    responsibleManager: '',
    phone: ''
  };

  entityLetters: File[] = [];
  proofDocuments: File[] = [];
  engineeringReports: File[] = [];
  otherAttachments: File[] = [];

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
          this.errorMessage = result.details.message || 'تعذر تحميل بيانات الترخيص';
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
          'حدث خطأ أثناء تحميل بيانات التعديل';
      }
    });
  }

  fillForm(details: LicensingProcessDetails): void {
    this.formModel = {
      submissionDate: details.submissionDate || '',
      requestingEntityId: this.findLookupId(this.requestingEntities, details.requestingEntity),
      establishmentName: details.establishmentName || '',
      establishmentAddress: details.establishmentAddress || '',
      districtId: this.findLookupId(this.districts, details.district),
      activityTypeId: this.findLookupId(this.activityTypes, details.activityType),
      applicantName: details.applicantName || '',
      applicantRole: details.applicantRole || '',
      nationalId: details.nationalId || '',
      responsibleManager: details.responsibleManager || '',
      phone: details.phone || ''
    };
  }

  findLookupId(list: LookupItem[], name: string): string {
    const item = list.find(x => x.name === name);
    return item?.id || '';
  }

  onFilesSelected(
    event: Event,
    type: 'entityLetters' | 'proofDocuments' | 'engineeringReports' | 'otherAttachments'
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

    if (type === 'otherAttachments') {
      this.otherAttachments = files;
    }
  }

  save(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.processId) {
      this.errorMessage = 'لم يتم تحديد الترخيص المطلوب تعديله';
      return;
    }

    if (!this.validateForm()) {
      return;
    }

    const formData = new FormData();

    formData.append('SubmissionDate', this.formModel.submissionDate);
    formData.append('RequestingEntityId', this.formModel.requestingEntityId);
    formData.append('EstablishmentName', this.formModel.establishmentName.trim());
    formData.append('EstablishmentAddress', this.formModel.establishmentAddress.trim());
    formData.append('DistrictId', this.formModel.districtId);
    formData.append('ActivityTypeId', this.formModel.activityTypeId);
    formData.append('ApplicantName', this.formModel.applicantName.trim());
    formData.append('ApplicantRole', this.formModel.applicantRole.trim());
    formData.append('NationalId', this.formModel.nationalId.trim());
    formData.append('ResponsibleManager', this.formModel.responsibleManager.trim());
    formData.append('Phone', this.formModel.phone.trim());

    this.entityLetters.forEach(file => {
      formData.append('EntityLetters', file, file.name);
    });

    this.proofDocuments.forEach(file => {
      formData.append('ProofDocuments', file, file.name);
    });

    this.engineeringReports.forEach(file => {
      formData.append('EngineeringReports', file, file.name);
    });

    this.otherAttachments.forEach(file => {
      formData.append('OtherAttachments', file, file.name);
    });

    this.saving = true;

    this.licensingProcessService.update(this.processId, formData).subscribe({
      next: (res: ApiResponse<boolean>) => {
        this.saving = false;

        if (!res.isSuccess) {
          this.errorMessage = res.message || 'لم يتم تعديل الترخيص';
          return;
        }

        this.successMessage = res.message || 'تم تعديل الترخيص بنجاح';

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
          'حدث خطأ أثناء تعديل الترخيص';
      }
    });
  }

  validateForm(): boolean {
    if (!this.formModel.submissionDate) {
      this.errorMessage = 'من فضلك أدخلي تاريخ التقديم';
      return false;
    }

    if (!this.formModel.requestingEntityId) {
      this.errorMessage = 'من فضلك اختاري الجهة';
      return false;
    }

    if (!this.formModel.establishmentName.trim()) {
      this.errorMessage = 'من فضلك أدخلي اسم المنشأة';
      return false;
    }

    if (!this.formModel.establishmentAddress.trim()) {
      this.errorMessage = 'من فضلك أدخلي عنوان المنشأة';
      return false;
    }

    if (!this.formModel.districtId) {
      this.errorMessage = 'من فضلك اختاري المركز / المنطقة';
      return false;
    }

    if (!this.formModel.activityTypeId) {
      this.errorMessage = 'من فضلك اختاري نوع النشاط';
      return false;
    }

    if (!this.formModel.applicantName.trim()) {
      this.errorMessage = 'من فضلك أدخلي اسم مقدم الطلب';
      return false;
    }

    if (!this.formModel.applicantRole.trim()) {
      this.errorMessage = 'من فضلك أدخلي صفة مقدم الطلب';
      return false;
    }

    if (!this.formModel.nationalId.trim()) {
      this.errorMessage = 'من فضلك أدخلي الرقم القومي';
      return false;
    }

    if (!this.formModel.responsibleManager.trim()) {
      this.errorMessage = 'من فضلك أدخلي اسم المدير المسؤول';
      return false;
    }

    if (!this.formModel.phone.trim()) {
      this.errorMessage = 'من فضلك أدخلي رقم الهاتف';
      return false;
    }

    return true;
  }

  cancel(): void {
    this.cancelled.emit();
  }
}