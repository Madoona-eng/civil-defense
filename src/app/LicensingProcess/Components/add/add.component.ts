import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  ApiResponse,
  LicensingProcessCreateRequest,
  LookupItem
} from '../../Models/licensing-process';

import { LicensingProcessService } from '../../Services/licensing-process.service';
import { RequestingEntityService } from '../../../RequestingEntity/Services/requesting-entity.service';
import { DistrictService } from '../../../District/Services/district.service';
import { ActivityTypeService } from '../../../ActivityType/Services/activity-type.service';

@Component({
  selector: 'app-licensing-process-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add.component.html',
  styleUrl: './add.component.scss'
})
export class AddComponent implements OnInit {
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  saving = false;
  loadingLookups = false;
  errorMessage = '';
  successMessage = '';

  requestingEntities: LookupItem[] = [];
  districts: LookupItem[] = [];
  activityTypes: LookupItem[] = [];

  formModel: LicensingProcessCreateRequest = {
    submissionDate: this.getTodayDate(),
    requestingEntityId: '',
    establishmentName: '',
    establishmentAddress: '',
    districtId: '',
    activityTypeId: '',
    applicantName: '',
    applicantRole: 'Owner',
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

  ngOnInit(): void {
    this.loadLookups();
  }

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  loadLookups(): void {
    this.loadingLookups = true;
    this.errorMessage = '';

    this.requestingEntityService.getAll().subscribe({
      next: response => {
        if (response.isSuccess) {
          this.requestingEntities = response.data || [];
        }
      },
      error: err => {
        console.error('Requesting entities loading error:', err);
        this.errorMessage = 'حدث خطأ أثناء تحميل الجهات';
      }
    });

    this.districtService.getAll().subscribe({
      next: response => {
        if (response.isSuccess) {
          this.districts = response.data || [];
        }
      },
      error: err => {
        console.error('Districts loading error:', err);
        this.errorMessage = 'حدث خطأ أثناء تحميل المراكز / المناطق';
      }
    });

    this.activityTypeService.getAll().subscribe({
      next: response => {
        if (response.isSuccess) {
          this.activityTypes = response.data || [];
        }

        this.loadingLookups = false;
      },
      error: err => {
        this.loadingLookups = false;
        console.error('Activity types loading error:', err);
        this.errorMessage = 'حدث خطأ أثناء تحميل أنواع النشاط';
      }
    });
  }

  onFilesSelected(
    event: Event,
    type: 'entityLetters' | 'proofDocuments' | 'engineeringReports' | 'otherAttachments'
  ): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);

    if (type === 'entityLetters') {
      this.entityLetters = [...this.entityLetters, ...files];
    }

    if (type === 'proofDocuments') {
      this.proofDocuments = [...this.proofDocuments, ...files];
    }

    if (type === 'engineeringReports') {
      this.engineeringReports = [...this.engineeringReports, ...files];
    }

    if (type === 'otherAttachments') {
      this.otherAttachments = [...this.otherAttachments, ...files];
    }

    // إعادة تعيين قيمة input
    input.value = '';
  }

  removeFile(
    type: 'entityLetters' | 'proofDocuments' | 'engineeringReports' | 'otherAttachments',
    index: number
  ): void {
    if (type === 'entityLetters') {
      this.entityLetters.splice(index, 1);
      this.entityLetters = [...this.entityLetters];
    }

    if (type === 'proofDocuments') {
      this.proofDocuments.splice(index, 1);
      this.proofDocuments = [...this.proofDocuments];
    }

    if (type === 'engineeringReports') {
      this.engineeringReports.splice(index, 1);
      this.engineeringReports = [...this.engineeringReports];
    }

    if (type === 'otherAttachments') {
      this.otherAttachments.splice(index, 1);
      this.otherAttachments = [...this.otherAttachments];
    }
  }

  save(): void {
    this.errorMessage = '';
    this.successMessage = '';

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

    this.licensingProcessService.create(formData).subscribe({
      next: (res: ApiResponse<boolean>) => {
        this.saving = false;

        if (!res.isSuccess) {
          this.errorMessage = res.message || 'لم يتم إنشاء طلب الترخيص';
          return;
        }

        this.successMessage = res.message || 'تم إنشاء طلب الترخيص بنجاح';

        setTimeout(() => {
          this.saved.emit();
        }, 900);
      },
      error: err => {
        this.saving = false;
        console.error('LicensingProcess POST error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء إضافة طلب الترخيص';
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