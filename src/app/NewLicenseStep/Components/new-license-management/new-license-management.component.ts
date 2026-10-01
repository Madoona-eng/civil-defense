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
import { LucideAngularModule, Plus, RotateCcw, Search } from 'lucide-angular';
import { forkJoin } from 'rxjs';

import { ConfirmDialogComponent } from '../../../Shared/Components/confirm-dialog/confirm-dialog.component';
import { NewLicenseFilter, NewLicenseListItem } from '../../Models/new-license';
import { NewLicenseService } from '../../Services/new-license.service';
import { ListComponent } from '../list/list.component';

import { ActivityTypeService } from '../../../ActivityType/Services/activity-type.service';
import { DistrictService } from '../../../District/Services/district.service';
import { RequestingEntityService } from '../../../RequestingEntity/Services/requesting-entity.service';
import { formatDateForApi } from '../../../Shared/Helpers/date.helper';
import { ApiResponse } from '../../../Shared/Models/ApiResponse';
import { LookupItem } from '../../../Shared/Models/LookupItem';
import { PagedResult } from '../../../Shared/Models/PagedResult';
import { TranslatePipe } from '../../../Shared/Components/translate.pipe';
import { CreateComponent, CreateDialogData } from '../create/create.component';
import { DetailsComponent, DetailsDialogData } from '../details/details.component';


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
    MatDialogModule,
    MatSnackBarModule,
    TranslatePipe,
  
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
  readonly Plus = Plus;

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
          this.errorMessage = res.message || 'newLicense.listLoadFailed';
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
          err?.error?.message || err?.message || ['newLicense.listLoadError'];
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
    // TODO: فتح تعديل الطلب
  }

  onMoveToNextStep(item: NewLicenseListItem): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        message: translateSiteText('newLicense.movePrompt', { establishmentName: item.establishmentName }),
        confirmText: ['newLicense.confirmMove'],
        cancelText: ['common.cancel'],
        confirmClass: 'btn-save',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.newLicenseService.moveToInspection(item.id).subscribe({
        next: (res: ApiResponse<boolean>) => {
          if (!res.isSuccess) {
            this.snackBar.open(this.snackMessage(res.message, 'newLicense.moveFailed'), 'common.close', {
              duration: 3000,
            });
            return;
          }

          this.snackBar.open(this.snackMessage(['newLicense.moved'], 'newLicense.moved'), 'common.close', { duration: 2500 });
          this.loadData();
        },
        error: (err) => {
          const message = this.snackMessage(err?.error?.message || err?.message || ['newLicense.moveError'], 'newLicense.moveError');
          this.snackBar.open(message, 'common.close', { duration: 3000 });
          console.error('NewLicense MOVE-TO-INSPECTION error:', err);
        },
      });
    });
  }
  onDelete(item: NewLicenseListItem): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        message: translateSiteText('newLicense.deletePrompt', { establishmentName: item.establishmentName }),
        confirmText: ['common.clear'],
        cancelText: ['common.cancel'],
        confirmClass: 'btn-danger',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.newLicenseService.delete(item.id).subscribe({
        next: (res: ApiResponse<boolean>) => {
          if (!res.isSuccess) {
            this.snackBar.open(this.snackMessage(res.message, 'newLicense.deleteFailed'), 'common.close', { duration: 3000 });
            return;
          }

          this.snackBar.open('newLicense.deleted', 'common.close', { duration: 2500 });
          this.loadData();
        },
        error: (err) => {
          const message = this.snackMessage(err?.error?.message || err?.message || 'newLicense.deleteError', 'newLicense.deleteError');
          this.snackBar.open(message, 'common.close', { duration: 3000 });
          console.error('NewLicense DELETE error:', err);
        },
      });
    });
  }
}
function translateSiteText(arg0: string, arg1: { establishmentName: string; }): any {
  throw new Error('Function not implemented.');
}

