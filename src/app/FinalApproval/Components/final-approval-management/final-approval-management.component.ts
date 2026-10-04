import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LucideAngularModule, RotateCcw, Search } from 'lucide-angular';
import { forkJoin } from 'rxjs';

import { ActivityTypeService } from '../../../ActivityType/Services/activity-type.service';
import { DistrictService } from '../../../District/Services/district.service';
import { RequestingEntityService } from '../../../RequestingEntity/Services/requesting-entity.service';
import { ConfirmDialogComponent } from '../../../Shared/Components/confirm-dialog/confirm-dialog.component';
import {
  APPLICATION_STATUS_LABELS,
  ApplicationStatus,
  INSPECTION_OPINION_LABELS,
  InspectionOpinion,
} from '../../../Shared/Enums/enums';
import { formatDateForApi } from '../../../Shared/Helpers/date.helper';
import { LookupItem } from '../../../Shared/Models/LookupItem';
import { SelectOption } from '../../../Shared/Models/SelectOption';

import { FinalApprovalFilter, FinalApprovalItem } from '../../Models/final-approval';
import { FinalApprovalService } from '../../Services/final-approval.service';

import { FinalApprovalProcessComponent } from '../final-approval-process/final-approval-process.component';
import { ListComponent } from '../list/list.component';
import {
  ReturnToInspectionComponent,
  ReturnToInspectionDialogData,
} from '../return-to-inspection/return-to-inspection.component';

@Component({
  selector: 'app-final-approval-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    ListComponent,
    FinalApprovalProcessComponent,
  ],
  templateUrl: './final-approval-management.component.html',
  styleUrl: './final-approval-management.component.scss',
})
export class FinalApprovalManagementComponent implements OnInit {
  // ---------- Data ----------
  items: FinalApprovalItem[] = [];

  requestingEntities: LookupItem[] = [];
  districts: LookupItem[] = [];
  activityTypes: LookupItem[] = [];

  // خيارات الفلاتر متولدة من الـ enums الموحدة
  readonly opinionOptions: SelectOption[] = Object.values(InspectionOpinion).map((value) => ({
    value,
    label: INSPECTION_OPINION_LABELS[value],
  }));

  readonly finalStatusOptions: SelectOption[] = Object.values(ApplicationStatus).map((value) => ({
    value,
    label: APPLICATION_STATUS_LABELS[value],
  }));

  // ---------- State ----------
  isLoading = false;
  loadingLookups = false;
  errorMessage = '';
  archivingItemId: string | null = null;

  // ---------- Filters ----------
  districtId = '';
  requestingEntityId = '';
  activityTypeId = '';
  searchTerm = '';
  opinion: InspectionOpinion | '' = '';
  finalStatus: ApplicationStatus | '' = '';

  submissionDateFrom: Date | null = null;
  submissionDateTo: Date | null = null;

  // ---------- Pagination ----------
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  // ---------- Icons ----------
  readonly Search = Search;
  readonly RotateCcw = RotateCcw;

  // ---------- Popups ----------
  isEditPopupOpen = false;
  isDeletePopupOpen = false;

  selectedApprovalItem: FinalApprovalItem | null = null;
  selectedDeleteItem: FinalApprovalItem | null = null;

  constructor(
    private readonly finalApprovalService: FinalApprovalService,
    private readonly requestingEntityService: RequestingEntityService,
    private readonly districtService: DistrictService,
    private readonly activityTypeService: ActivityTypeService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadLookups();
    this.loadData();
  }

  // ---------- Lookups ----------
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
        console.error('FinalApproval lookups error:', err);
      },
    });
  }

  // ---------- List ----------
  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const filter: FinalApprovalFilter = {
      districtId: this.districtId || undefined,
      requestingEntityId: this.requestingEntityId || undefined,
      activityTypeId: this.activityTypeId || undefined,
      opinion: this.opinion || undefined,
      finalStatus: this.finalStatus || undefined,
      submissionDateFrom: formatDateForApi(this.submissionDateFrom),
      submissionDateTo: formatDateForApi(this.submissionDateTo),
      searchTerm: this.searchTerm.trim() || undefined,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
    };

    this.finalApprovalService.getAll(filter).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (!res.isSuccess || !res.data) {
          this.errorMessage = res.message || 'تعذر تحميل معاملات الموافقة النهائية';
          return;
        }

        this.items = res.data.items || [];
        this.pageNumber = res.data.pageNumber;
        this.pageSize = res.data.pageSize;
        this.totalCount = res.data.totalCount;
        this.totalPages = res.data.totalPages;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل معاملات الموافقة النهائية';
        console.error('FinalApproval GET error:', err);
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
    this.opinion = '';
    this.finalStatus = '';
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

  // ---------- Archive ----------
  onArchive(item: FinalApprovalItem): void {
    if (!item.id || this.archivingItemId === item.id) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        message: `هل أنت متأكد من نقل المعاملة الخاصة بـ "${item.establishmentName}" إلى الأرشيف؟`,
        confirmText: 'نقل للأرشيف',
        cancelText: 'إلغاء',
        confirmClass: 'btn-save',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.archivingItemId = item.id;
      this.finalApprovalService.moveToArchive(item.id).subscribe({
        next: (res) => {
          this.archivingItemId = null;

          if (!res.isSuccess) {
            this.snackBar.open(res.message || 'تعذر نقل المعاملة للأرشيف', 'إغلاق', {
              duration: 3000,
            });
            return;
          }

          this.snackBar.open('تم نقل المعاملة للأرشيف بنجاح', 'إغلاق', { duration: 2500 });
          this.loadData();
        },
        error: (err) => {
          this.archivingItemId = null;
          this.snackBar.open(
            err?.error?.message || err?.message || 'حدث خطأ أثناء نقل المعاملة للأرشيف',
            'إغلاق',
            { duration: 3000 },
          );
          console.error('FinalApproval MOVE-TO-ARCHIVE error:', err);
        },
      });
    });
  }

  // ---------- Final approval (details + decision) ----------
  openEditPopup(item: FinalApprovalItem): void {
    this.selectedApprovalItem = item;
    this.isEditPopupOpen = true;
  }

  closeEditPopup(): void {
    this.selectedApprovalItem = null;
    this.isEditPopupOpen = false;
  }

  onEditSaved(): void {
    this.closeEditPopup();
    this.loadData();
  }

  // ---------- Return to inspection ----------
  onReturn(item: FinalApprovalItem): void {
    (document.activeElement as HTMLElement)?.blur();

    this.dialog
      .open<ReturnToInspectionComponent, ReturnToInspectionDialogData, boolean>(
        ReturnToInspectionComponent,
        {
          width: '460px',
          maxWidth: '95vw',
          data: { item },
        },
      )
      .afterClosed()
      .subscribe((returned) => {
        if (!returned) return;
        this.snackBar.open('تم إرجاع المعاملة للمعاينة بنجاح', 'إغلاق', { duration: 2500 });
        this.loadData();
      });
  }

}
