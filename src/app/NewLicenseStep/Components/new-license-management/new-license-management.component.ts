import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ConfirmDialogComponent } from '../../../Shared/Components/confirm-dialog/confirm-dialog.component';
import { NewLicenseFilter, NewLicenseListItem, pickAttachments } from '../../Models/new-license';
import { NewLicenseService } from '../../Services/new-license.service';
import { ListComponent } from '../list/list.component';

import { ActivityTypeService } from '../../../ActivityType/Services/activity-type.service';
import { DistrictService } from '../../../District/Services/district.service';
import { RequestingEntityService } from '../../../RequestingEntity/Services/requesting-entity.service';
import { AppIconComponent } from '../../../Shared/Components/app-icon/app-icon.component';
import { formatDateForApi } from '../../../Shared/Helpers/date.helper';
import { ApiResponse } from '../../../Shared/Models/ApiResponse';
import { LookupItem } from '../../../Shared/Models/LookupItem';
import { PagedResult } from '../../../Shared/Models/PagedResult';
import { CreateComponent, CreateDialogData } from '../create/create.component';
import { DetailsComponent, DetailsDialogData } from '../details/details.component';
import { EditComponent, EditDialogData } from '../edit/edit.component';

@Component({
  selector: 'app-new-license-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ListComponent,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    AppIconComponent,
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
  isMovingAll = false;
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

  constructor(
    private readonly newLicenseService: NewLicenseService,
    private readonly requestingEntityService: RequestingEntityService,
    private readonly districtService: DistrictService,
    private readonly activityTypeService: ActivityTypeService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
  ) {}

  private snackMessage(message: string | string[] | undefined, fallback: string): string {
    if (Array.isArray(message)) {
      return message.join(' ');
    }

    return message || fallback;
  }

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
      submissionDateFrom: formatDateForApi(this.submissionDateFrom),
      submissionDateTo: formatDateForApi(this.submissionDateTo),
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

  onAddNew(): void {
    (document.activeElement as HTMLElement)?.blur();

    const dialogRef = this.dialog.open<CreateComponent, CreateDialogData, boolean>(
      CreateComponent,
      {
        width: '900px',
        maxWidth: '95vw',
        data: {
          requestingEntities: this.requestingEntities,
          districts: this.districts,
          activityTypes: this.activityTypes,
        },
      },
    );

    dialogRef.afterClosed().subscribe((created) => {
      if (created) {
        this.loadData();
      }
    });
  }

  onDetails(item: NewLicenseListItem): void {
    this.dialog.open<DetailsComponent, DetailsDialogData>(DetailsComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: { id: item.id },
    });
  }

  onEdit(item: NewLicenseListItem): void {
    (document.activeElement as HTMLElement)?.blur();

    this.newLicenseService.getById(item.id).subscribe({
      next: (res) => {
        if (!res.isSuccess || !res.data) {
          this.snackBar.open(res.message || 'تعذر تحميل بيانات المعاملة', 'إغلاق', {
            duration: 4000,
          });
          return;
        }

        const d = res.data;

        const data: EditDialogData = {
          process: {
            id: d.id,
            submissionDate: d.submissionDate,
            establishmentName: d.establishmentName,
            establishmentAddress: d.establishmentAddress,
            requestingEntityId: d.requestingEntityId,
            districtId: d.districtId,
            activityTypeId: d.activityTypeId,
            applicantName: d.applicantName,
            applicantRole: d.applicantRole,
            nationalId: d.nationalId,
            responsibleManager: d.responsibleManager,
            phone: d.phone,
          },
          attachments: pickAttachments(d),
          requestingEntities: this.requestingEntities,
          districts: this.districts,
          activityTypes: this.activityTypes,
        };

        this.dialog
          .open<EditComponent, EditDialogData, boolean>(EditComponent, {
            width: '900px',
            maxWidth: '95vw',
            data,
          })
          .afterClosed()
          .subscribe((saved) => {
            if (saved) this.loadData();
          });
      },
      error: () =>
        this.snackBar.open('حدث خطأ أثناء تحميل بيانات المعاملة', 'إغلاق', { duration: 4000 }),
    });
  }

  onMoveToNextStep(item: NewLicenseListItem): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        message: `هل أنت متأكد من نقل المعاملة الخاصة بـ "${item.establishmentName}" إلى خطوة إجراء المعاينة؟`,
        confirmText: 'نقل',
        cancelText: 'إلغاء',
        confirmClass: 'btn-save',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.newLicenseService.moveToInspection(item.id).subscribe({
        next: (res: ApiResponse<boolean>) => {
          if (!res.isSuccess) {
            this.snackBar.open(res.message || 'تعذر نقل المعاملة للخطوة التالية', 'إغلاق', {
              duration: 3000,
            });
            return;
          }

          this.snackBar.open('تم نقل المعاملة للخطوة التالية بنجاح', 'إغلاق', { duration: 2500 });
          this.loadData();
        },
        error: (err) => {
          const message = err?.error?.message || err?.message || 'حدث خطأ أثناء نقل المعاملة';
          this.snackBar.open(message, 'إغلاق', { duration: 3000 });
          console.error('NewLicense MOVE-TO-INSPECTION error:', err);
        },
      });
    });
  }

  onMoveAllToNextStep(): void {
    const ids = this.items.map((i) => i.id);
    if (!ids.length) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        message: `هل أنت متأكد من نقل ${ids.length} من المعاملات إلى خطوة إجراء المعاينة؟`,
        confirmText: 'نقل الكل',
        cancelText: 'إلغاء',
        confirmClass: 'btn-save',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.isMovingAll = true;

      forkJoin(
        ids.map((id) =>
          this.newLicenseService.moveToInspection(id).pipe(
            map((res: ApiResponse<boolean>) => ({ id, ok: res.isSuccess })),
            catchError((err) => {
              console.error('NewLicense MOVE-TO-INSPECTION (bulk) error:', id, err);
              return of({ id, ok: false });
            }),
          ),
        ),
      ).subscribe((results) => {
        this.isMovingAll = false;

        const failed = results.filter((r) => !r.ok).length;
        const succeeded = results.length - failed;

        const message =
          failed === 0
            ? `تم نقل ${succeeded} معاملة للخطوة التالية بنجاح`
            : `تم نقل ${succeeded} معاملة، وتعذر نقل ${failed} معاملة`;

        this.snackBar.open(message, 'إغلاق', { duration: 4000 });
        this.loadData();
      });
    });
  }

  onDelete(item: NewLicenseListItem): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        message: `هل أنت متأكد من مسح المعاملة الخاصة بـ "${item.establishmentName}"؟ لا يمكن التراجع عن هذا الإجراء.`,
        confirmText: 'مسح',
        cancelText: 'إلغاء',
        confirmClass: 'btn-danger',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.newLicenseService.delete(item.id).subscribe({
        next: (res: ApiResponse<boolean>) => {
          if (!res.isSuccess) {
            this.snackBar.open(res.message || 'تعذر مسح المعاملة', 'إغلاق', { duration: 3000 });
            return;
          }

          this.snackBar.open('تم مسح المعاملة بنجاح', 'إغلاق', { duration: 2500 });
          this.loadData();
        },
        error: (err) => {
          const message = err?.error?.message || err?.message || 'حدث خطأ أثناء مسح المعاملة';
          this.snackBar.open(message, 'إغلاق', { duration: 3000 });
          console.error('NewLicense DELETE error:', err);
        },
      });
    });
  }
}
