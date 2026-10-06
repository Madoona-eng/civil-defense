import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, from, map, mergeMap, of, toArray } from 'rxjs';

import {
  ApiResponse,
  InspectionItem,
  InspectionList,
  LookupItem,
  PagedResult,
} from '../../Models/inspection';

import { InspectionService } from '../../Services/inspection.service';

import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivityTypeService } from '../../../ActivityType/Services/activity-type.service';
import { DistrictService } from '../../../District/Services/district.service';
import { RequestingEntityService } from '../../../RequestingEntity/Services/requesting-entity.service';
import { AppIconComponent } from '../../../Shared/Components/app-icon/app-icon.component';
import { ConfirmDialogComponent } from '../../../Shared/Components/confirm-dialog/confirm-dialog.component';
import {
  INSPECTION_OPINION_LABELS,
  InspectionOpinion,
  RETURN_STATE_LABELS,
  ReturnState,
} from '../../../Shared/Enums/enums';
import { formatDate, formatDateForApi } from '../../../Shared/Helpers/date.helper';
import { SelectOption } from '../../../Shared/Models/SelectOption';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-inspection-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatPaginatorModule,
    AppIconComponent,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit {
  readonly formatDate = formatDate;
  lastOpenedId: string | null = null;

  @Output() editRequested = new EventEmitter<InspectionItem>();

  items: InspectionItem[] = [];

  requestingEntities: LookupItem[] = [];
  districts: LookupItem[] = [];
  activityTypes: LookupItem[] = [];

  readonly returnStateOptions: SelectOption[] = Object.values(ReturnState).map((value) => ({
    value,
    label: RETURN_STATE_LABELS[value],
  }));

  readonly opinionOptions: SelectOption[] = Object.values(InspectionOpinion).map((value) => ({
    value,
    label: INSPECTION_OPINION_LABELS[value],
  }));

  isMovingAll = false;
  isLoading = false;
  loadingLookups = false;
  errorMessage = '';

  districtId = '';
  requestingEntityId = '';
  activityTypeId = '';
  searchTerm = '';
  isReturned = '';
  submissionDateFrom: Date | null = null;
  submissionDateTo: Date | null = null;
  opinion: InspectionOpinion | '' = '';
  isDistrictLocked = false;

  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  movingToFinalApprovalId: string | null = null;

  constructor(
    private readonly inspectionService: InspectionService,
    private readonly requestingEntityService: RequestingEntityService,
    private readonly districtService: DistrictService,
    private readonly activityTypeService: ActivityTypeService,
    private readonly authService: AuthService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
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
      isReturned: this.isReturned === '' ? undefined : this.isReturned === ReturnState.Returned,
      opinion: this.opinion || undefined,
      submissionDateFrom: formatDateForApi(this.submissionDateFrom),
      submissionDateTo: formatDateForApi(this.submissionDateTo),
      searchTerm: this.searchTerm.trim() || undefined,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
    };

    this.inspectionService.getAll(query).subscribe({
      next: (response: ApiResponse<PagedResult<InspectionItem>>) => {
        this.isLoading = false;

        if (!response.isSuccess) {
          this.errorMessage = response.message || 'تعذر تحميل قائمة المعاينات';
          return;
        }

        this.items = response.data.items || [];
        this.pageNumber = response.data.pageNumber;
        this.pageSize = response.data.pageSize;
        this.totalCount = response.data.totalCount;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Inspection GET error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل قائمة المعاينات';
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
    this.opinion = '';
    this.submissionDateFrom = null;
    this.submissionDateTo = null;
    this.pageNumber = 1;
    this.loadInspections();
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadInspections();
  }

  getReturnStateLabel(isReturned: boolean): string {
    return RETURN_STATE_LABELS[isReturned ? ReturnState.Returned : ReturnState.NotReturned];
  }

  requestEdit(item: InspectionItem): void {
    this.lastOpenedId = item.id;
    this.editRequested.emit(item);
  }

  get canMoveToFinalApproval(): boolean {
    const role = this.authService.getRole();
    return role === 'Inspector' || role === 'SuperAdmin';
  }

  moveToFinalApproval(item: InspectionItem): void {
    if (!this.canMoveToFinalApproval || !item.id || this.movingToFinalApprovalId === item.id) {
      return;
    }

    this.lastOpenedId = item.id;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        message: `هل تريد نقل منشأة "${item.establishmentName}" إلى الموافقة النهائية؟`,
        confirmText: 'نقل للموافقة النهائية',
        cancelText: 'إلغاء',
        confirmClass: 'btn-save',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.movingToFinalApprovalId = item.id;
      this.inspectionService.moveToFinalApproval(item.id).subscribe({
        next: (response) => {
          this.movingToFinalApprovalId = null;

          if (!response.isSuccess) {
            this.snackBar.open(response.message || 'تعذر نقل المعاينة', 'إغلاق', {
              duration: 3000,
            });
            return;
          }

          this.snackBar.open('تم النقل بنجاح', 'إغلاق', { duration: 2500 });
          this.loadInspections();
        },
        error: (error) => {
          this.movingToFinalApprovalId = null;
          this.snackBar.open(
            error?.error?.message || error?.message || 'حدث خطأ أثناء النقل',
            'إغلاق',
            { duration: 3000 },
          );
        },
      });
    });
  }

  moveAllToFinalApproval(): void {
    if (!this.canMoveToFinalApproval || this.isMovingAll || this.items.length === 0) return;

    const targets = [...this.items];

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: `هل تريد نقل ${targets.length} معاملة إلى الموافقة النهائية؟ المعاملات الناقصة مرفقات سيتم تخطيها.`,
        confirmText: 'نقل الكل',
        cancelText: 'إلغاء',
        confirmClass: 'btn-save',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.isMovingAll = true;

      from(targets)
        .pipe(
          mergeMap(
            (item) =>
              this.inspectionService.moveToFinalApproval(item.id).pipe(
                map((res) => ({ item, ok: res.isSuccess, message: res.message })),
                catchError((err) =>
                  of({
                    item,
                    ok: false,
                    message: err?.error?.message || err?.error?.Message || err?.message,
                  }),
                ),
              ),
            3, // عدد الطلبات المتزامنة
          ),
          toArray(),
        )
        .subscribe((results) => {
          this.isMovingAll = false;

          const failed = results.filter((r) => !r.ok);
          const succeeded = results.length - failed.length;

          failed.forEach((f) => console.warn('Move failed:', f.item.transactionCode, f.message));

          if (failed.length === 0) {
            this.snackBar.open(`تم نقل ${succeeded} معاملة بنجاح`, 'إغلاق', { duration: 3500 });
          } else {
            const reason = failed[0].message ? ` (${failed[0].message})` : '';
            this.snackBar.open(
              `تم نقل ${succeeded} من ${results.length}. تعذر نقل ${failed.length}${reason}`,
              'إغلاق',
              { duration: 8000 },
            );
          }

          this.loadInspections();
        });
    });
  }
}
