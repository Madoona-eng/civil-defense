import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin } from 'rxjs';

import { NewLicenseFilter, NewLicenseListItem } from '../../Models/new-license';
import { NewLicenseService } from '../../Services/new-license.service';
import { ListComponent } from '../list/list.component';

import { LucideAngularModule, RotateCcw, Search } from 'lucide-angular';
import { ActivityTypeService } from '../../../ActivityType/Services/activity-type.service';
import { DistrictService } from '../../../District/Services/district.service';
import { RequestingEntityService } from '../../../RequestingEntity/Services/requesting-entity.service';
import { ApiResponse } from '../../../Shared/Models/ApiResponse';
import { LookupItem } from '../../../Shared/Models/LookupItem';
import { PagedResult } from '../../../Shared/Models/PagedResult';

@Component({
  selector: 'app-new-license-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ListComponent,
    LucideAngularModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './new-license-management.component.html',
  styleUrl: './new-license-management.component.scss',
})
export class NewLicenseManagementComponent implements OnInit {
  items: NewLicenseListItem[] = [];

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

  submissionDateFrom: Date | null = null;
  submissionDateTo: Date | null = null;

  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  readonly Search = Search;
  readonly RotateCcw = RotateCcw;

  constructor(
    private readonly newLicenseService: NewLicenseService,
    private readonly requestingEntityService: RequestingEntityService,
    private readonly districtService: DistrictService,
    private readonly activityTypeService: ActivityTypeService,
  ) {}

  ngOnInit(): void {
    this.loadLookups();
    this.loadData();
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
        console.error('NewLicense lookups error:', err);
      },
    });
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const filter: NewLicenseFilter = {
      districtId: this.districtId || undefined,
      requestingEntityId: this.requestingEntityId || undefined,
      activityTypeId: this.activityTypeId || undefined,
      submissionDateFrom: this.formatDateForApi(this.submissionDateFrom),
      submissionDateTo: this.formatDateForApi(this.submissionDateTo),
      searchTerm: this.searchTerm.trim() || undefined,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
    };

    this.newLicenseService.getAll(filter).subscribe({
      next: (res: ApiResponse<PagedResult<NewLicenseListItem>>) => {
        this.isLoading = false;

        if (!res.isSuccess || !res.data) {
          this.errorMessage = res.message || 'تعذر تحميل معاملات الترخيص الجديد';
          return;
        }

        this.items = res.data.items;
        this.pageNumber = res.data.pageNumber;
        this.pageSize = res.data.pageSize;
        this.totalCount = res.data.totalCount;
        this.totalPages = res.data.totalPages;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message || err?.message || 'حدث خطأ أثناء تحميل معاملات الترخيص الجديد';
        console.error('NewLicense GET error:', err);
      },
    });
  }

  search(): void {
    this.pageNumber = 1;
    this.loadData();
  }

  resetFilters(): void {
    this.districtId = '';
    this.requestingEntityId = '';
    this.activityTypeId = '';
    this.searchTerm = '';
    this.submissionDateFrom = null;
    this.submissionDateTo = null;
    this.pageNumber = 1;
    this.loadData();
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  onDetails(item: NewLicenseListItem): void {
    // TODO: فتح تفاصيل الطلب
  }

  onEdit(item: NewLicenseListItem): void {
    // TODO: فتح تعديل الطلب
  }

  onMoveToNextStep(item: NewLicenseListItem): void {
    // TODO: نداء endpoint الانتقال لخطوة 2
  }

  onDelete(item: NewLicenseListItem): void {
    // TODO: نداء endpoint المسح
  }

  private formatDateForApi(date: Date | null): string | undefined {
    if (!date) return undefined;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
