import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import {
  ApiResponse,
  InspectionItem,
  InspectionList,
  LookupItem,
  PagedResult,
} from '../../Models/inspection';

import { InspectionService } from '../../Services/inspection.service';

import { RequestingEntityService } from '../../../RequestingEntity/Services/requesting-entity.service';
import { DistrictService } from '../../../District/Services/district.service';
import { ActivityTypeService } from '../../../ActivityType/Services/activity-type.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MAT_DATE_LOCALE } from '@angular/material/core';

@Component({
  selector: 'app-inspection-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatMenuModule, MatButtonModule, MatTooltipModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit {
  @Output() editRequested = new EventEmitter<InspectionItem>();

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
  isReturned = '';
  submissionDateFrom = '';
  submissionDateTo = '';
  opinion: string = '';
  // هيتحط قيمته لاحقًا لما الليدر يجهز الـ role logic
  // Inspector => true (يقفل الفلتر على مركزه) | SuperAdmin => false
  isDistrictLocked = false;

  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  hasNextPage = false;
  hasPreviousPage = false;

  constructor(
    private readonly inspectionService: InspectionService,
    private readonly requestingEntityService: RequestingEntityService,
    private readonly districtService: DistrictService,
    private readonly activityTypeService: ActivityTypeService,
  ) { }

  ngOnInit(): void {
    this.loadLookups();
    this.loadInspections();
  }

  loadLookups(): void {
    this.loadingLookups = true;

    forkJoin({
      requestingEntities: this.requestingEntityService.getAll(),
      districts: this.districtService.getAll(),
      activityTypes: this.activityTypeService.getAll(),
    }).subscribe({
      next: (result) => {
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
      error: (err) => {
        this.loadingLookups = false;
        console.error('Inspection lookups error:', err);
      },
    });
  }

  loadInspections(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const query: InspectionList = {
      districtId: this.districtId || undefined,
      requestingEntityId: this.requestingEntityId || undefined,
      activityTypeId: this.activityTypeId || undefined,
      isReturned:
        this.isReturned === '' ? undefined : this.isReturned === 'true',
        opinion: this.opinion || undefined,
      submissionDateFrom: this.submissionDateFrom || undefined,
      submissionDateTo: this.submissionDateTo || undefined,
      searchTerm: this.searchTerm.trim() || undefined,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
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
      error: (err) => {
        this.isLoading = false;
        console.error('Inspection GET error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل معاملات المعاينة';
      },
    });
  }

  search(): void {
    this.pageNumber = 1;
    this.loadInspections();
  }

  resetFilters(): void {
    this.districtId = this.isDistrictLocked ? this.districtId : '';
    this.requestingEntityId = '';
    this.activityTypeId = '';
    this.searchTerm = '';
    this.isReturned = '';
    this.submissionDateFrom = '';
    this.submissionDateTo = '';
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

  requestEdit(item: InspectionItem): void {
    this.editRequested.emit(item);
  }

  //TODO : Use enum for step values instead of hardcoded strings 
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



  onPageSizeChange(): void {
    this.pageSize = Number(this.pageSize);
    this.pageNumber = 1;
    this.loadInspections();
  }
}