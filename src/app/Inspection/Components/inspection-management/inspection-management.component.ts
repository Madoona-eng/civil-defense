import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import {
  ApiResponse,
  InspectionItem,
  InspectionQuery,
  LookupItem,
  PagedResult
} from '../../Models/inspection';

import { InspectionService } from '../../Services/inspection.service';

import { RequestingEntityService } from '../../../RequestingEntity/Services/requesting-entity.service';
import { DistrictService } from '../../../District/Services/district.service';
import { ActivityTypeService } from '../../../ActivityType/Services/activity-type.service';

import { DetailsComponent } from '../../../LicensingProcess/Components/details/details.component';
import { InspectionFormComponent } from '../inspection-form/inspection-form.component';

@Component({
  selector: 'app-inspection-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DetailsComponent,
    InspectionFormComponent
  ],
  templateUrl: './inspection-management.component.html',
  styleUrl: './inspection-management.component.scss'
})
export class InspectionManagementComponent implements OnInit {
  items: InspectionItem[] = [];

  requestingEntities: LookupItem[] = [];
  districts: LookupItem[] = [];
  activityTypes: LookupItem[] = [];

  isLoading = false;
  loadingLookups = false;
  errorMessage = '';

  districtId = '';
  requestingEntityId = '';
  activityTypeId = '';
  searchTerm = '';

  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  hasNextPage = false;
  hasPreviousPage = false;

  isDetailsPopupOpen = false;
  selectedProcessId: string | null = null;

  isInspectionPopupOpen = false;
  selectedInspectionItem: InspectionItem | null = null;

  constructor(
    private readonly inspectionService: InspectionService,
    private readonly requestingEntityService: RequestingEntityService,
    private readonly districtService: DistrictService,
    private readonly activityTypeService: ActivityTypeService
  ) {}

  ngOnInit(): void {
    this.loadLookups();
    this.loadInspections();
  }

  loadLookups(): void {
    this.loadingLookups = true;

    forkJoin({
      requestingEntities: this.requestingEntityService.getAll(),
      districts: this.districtService.getAll(),
      activityTypes: this.activityTypeService.getAll()
    }).subscribe({
      next: result => {
        this.loadingLookups = false;

        if (result.requestingEntities.isSuccess) {
          this.requestingEntities = result.requestingEntities.data || [];
        }

        if (result.districts.isSuccess) {
          this.districts = result.districts.data || [];
        }

        if (result.activityTypes.isSuccess) {
          this.activityTypes = result.activityTypes.data || [];
        }
      },
      error: err => {
        this.loadingLookups = false;
        console.error('Inspection lookups error:', err);
      }
    });
  }

  loadInspections(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const query: InspectionQuery = {
      districtId: this.districtId,
      requestingEntityId: this.requestingEntityId,
      activityTypeId: this.activityTypeId,
      searchTerm: this.searchTerm.trim(),
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    };

    this.inspectionService.getAll(query).subscribe({
      next: (response: ApiResponse<PagedResult<InspectionItem>>) => {
        this.isLoading = false;

        if (!response.isSuccess) {
          this.errorMessage = response.message || 'تعذر تحميل معاملات المعاينة';
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
      error: err => {
        this.isLoading = false;
        console.error('Inspection GET error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل معاملات المعاينة';
      }
    });
  }

  search(): void {
    this.pageNumber = 1;
    this.loadInspections();
  }

  resetFilters(): void {
    this.districtId = '';
    this.requestingEntityId = '';
    this.activityTypeId = '';
    this.searchTerm = '';
    this.pageNumber = 1;
    this.loadInspections();
  }

  nextPage(): void {
    if (!this.hasNextPage) {
      return;
    }

    this.pageNumber++;
    this.loadInspections();
  }

  previousPage(): void {
    if (!this.hasPreviousPage) {
      return;
    }

    this.pageNumber--;
    this.loadInspections();
  }

  openDetailsPopup(id: string): void {
    this.selectedProcessId = id;
    this.isDetailsPopupOpen = true;
  }

  closeDetailsPopup(): void {
    this.selectedProcessId = null;
    this.isDetailsPopupOpen = false;
  }

  openInspectionPopup(item: InspectionItem): void {
    this.selectedInspectionItem = item;
    this.isInspectionPopupOpen = true;
  }

  closeInspectionPopup(): void {
    this.selectedInspectionItem = null;
    this.isInspectionPopupOpen = false;
  }

  onInspectionSaved(): void {
    this.closeInspectionPopup();
    this.loadInspections();
  }

  getStepLabel(step: string): string {
    if (step === 'Inspection') {
      return 'المعاينة';
    }

    if (step === 'FinalApproval') {
      return 'الموافقة النهائية';
    }

    if (step === 'Archive') {
      return 'الأرشيف';
    }

    if (step === 'NewLicense') {
      return 'ترخيص جديد';
    }

    return step || '-';
  }
}