import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { forkJoin } from 'rxjs';
import { formatDate, formatDateForApi } from '../../../Shared/Helpers/date.helper';
import { ActivityTypeService } from '../../../ActivityType/Services/activity-type.service';
import { DistrictService } from '../../../District/Services/district.service';
import { RequestingEntityService } from '../../../RequestingEntity/Services/requesting-entity.service';
import {
  ApiResponse,
  LicensingProcessItem,
  LicensingProcessQuery,
  LookupItem,
  PagedResult
} from '../../Models/licensing-process';
import { LicensingProcessService } from '../../Services/licensing-process.service';

@Component({
  selector: 'app-licensing-process-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatNativeDateModule,
    MatDatepickerModule,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  readonly formatDate = formatDate;

  @Output() detailsRequested = new EventEmitter<string>();
  @Output() editRequested = new EventEmitter<string>();
  @Output() deleteRequested = new EventEmitter<LicensingProcessItem>();

  items: LicensingProcessItem[] = [];
  districts: LookupItem[] = [];
  requestingEntities: LookupItem[] = [];
  activityTypes: LookupItem[] = [];

  isLoading = false;
  isLoadingLookups = false;
  errorMessage = '';
  lookupErrorMessage = '';

  searchTerm = '';
  processStep = '';
  districtId = '';
  requestingEntityId = '';
  activityTypeId = '';
  submissionDateFrom: Date | null = null;
  submissionDateTo: Date | null = null;

  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  hasNextPage = false;
  hasPreviousPage = false;

  processSteps = [
    { value: '', label: 'جميع المراحل' },
    { value: 'NewLicense', label: 'ترخيص جديد' },
    { value: 'Inspection', label: 'المعاينة' },
    { value: 'FinalApproval', label: 'الموافقة النهائية' },
    { value: 'Archive', label: 'الأرشيف' }
  ];

  constructor(
    private readonly licensingProcessService: LicensingProcessService,
    private readonly districtService: DistrictService,
    private readonly requestingEntityService: RequestingEntityService,
    private readonly activityTypeService: ActivityTypeService
  ) {}

  ngOnInit(): void {
    this.loadLookups();
    this.loadLicensingProcesses();
  }

  loadLookups(): void {
    this.isLoadingLookups = true;
    this.lookupErrorMessage = '';

    forkJoin({
      districts: this.districtService.getAll(),
      requestingEntities: this.requestingEntityService.getAll(),
      activityTypes: this.activityTypeService.getAll()
    }).subscribe({
      next: (result) => {
        this.isLoadingLookups = false;
        this.districts = result.districts.isSuccess ? result.districts.data ?? [] : [];
        this.requestingEntities = result.requestingEntities.isSuccess
          ? result.requestingEntities.data ?? []
          : [];
        this.activityTypes = result.activityTypes.isSuccess
          ? result.activityTypes.data ?? []
          : [];

        if (
          !result.districts.isSuccess ||
          !result.requestingEntities.isSuccess ||
          !result.activityTypes.isSuccess
        ) {
          this.lookupErrorMessage = 'تعذر تحميل بعض خيارات التصفية';
        }
      },
      error: (err) => {
        this.isLoadingLookups = false;
        this.lookupErrorMessage =
          err?.error?.message || err?.message || 'حدث خطأ أثناء تحميل خيارات التصفية';
        console.error('LicensingProcess lookups error:', err);
      }
    });
  }

  loadLicensingProcesses(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const query: LicensingProcessQuery = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      districtId: this.districtId || undefined,
      requestingEntityId: this.requestingEntityId || undefined,
      activityTypeId: this.activityTypeId || undefined,
      searchTerm: this.searchTerm.trim(),
      processStep: this.processStep || undefined,
      submissionDateFrom: formatDateForApi(this.submissionDateFrom),
      submissionDateTo: formatDateForApi(this.submissionDateTo)
    };

    this.licensingProcessService.getAll(query).subscribe({
      next: (response: ApiResponse<PagedResult<LicensingProcessItem>>) => {
        this.isLoading = false;

        if (!response.isSuccess) {
          this.errorMessage = response.message || 'فشل تحميل قائمة التراخيص';
          return;
        }

        this.items = response.data.items || [];
        this.pageNumber = response.data.pageNumber;
        this.pageSize = response.data.pageSize;
        this.totalCount = response.data.totalCount;
        this.totalPages = response.data.totalPages;
        this.hasNextPage = response.data.hasNextPage;
        this.hasPreviousPage = response.data.hasPreviousPage;
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('LicensingProcess GET error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل القائمة';
      }
    });
  }

  requestDetails(id: string): void {
    this.detailsRequested.emit(id);
  }

  requestEdit(id: string): void {
    this.editRequested.emit(id);
  }

  requestDelete(item: LicensingProcessItem): void {
    this.deleteRequested.emit(item);
  }

  search(): void {
    this.pageNumber = 1;
    this.loadLicensingProcesses();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.processStep = '';
    this.districtId = '';
    this.requestingEntityId = '';
    this.activityTypeId = '';
    this.submissionDateFrom = null;
    this.submissionDateTo = null;
    this.pageNumber = 1;
    this.loadLicensingProcesses();
  }

  nextPage(): void {
    if (!this.hasNextPage) {
      return;
    }

    this.pageNumber++;
    this.loadLicensingProcesses();
  }

  previousPage(): void {
    if (!this.hasPreviousPage) {
      return;
    }

    this.pageNumber--;
    this.loadLicensingProcesses();
  }

  getStepLabel(step: string): string {
    if (step === 'NewLicense') {
      return 'ترخيص جديد';
    }

    if (step === 'Inspection') {
      return 'المعاينة';
    }

    if (step === 'FinalApproval') {
      return 'الموافقة النهائية';
    }

    if (step === 'Archive') {
      return 'الأرشيف';
    }

    return step || '-';
  }
}