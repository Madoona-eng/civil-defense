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
import { PROCESS_STEP_LABELS, ProcessStep } from '../../../Shared/Enums/enums';
import { formatDateForApi } from '../../../Shared/Helpers/date.helper';
import { LookupItem } from '../../../Shared/Models/LookupItem';
import { SelectOption } from '../../../Shared/Models/SelectOption';

import { LicensingProcessItem, LicensingProcessQuery } from '../../Models/licensing-process';
import { LicensingProcessService } from '../../Services/licensing-process.service';

import { DetailsComponent } from '../details/details.component';
import { EditComponent } from '../edit/edit.component';
import { ListComponent } from '../list/list.component';

@Component({
  selector: 'app-licensing-process-management',
  standalone: true,
  imports: [
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
    DetailsComponent,
    EditComponent,
  ],
  templateUrl: './licensing-process-management.component.html',
  styleUrl: './licensing-process-management.component.scss',
})
export class LicensingProcessManagementComponent implements OnInit {
  // ---------- Data ----------
  items: LicensingProcessItem[] = [];

  requestingEntities: LookupItem[] = [];
  districts: LookupItem[] = [];
  activityTypes: LookupItem[] = [];

  readonly processStepOptions: SelectOption[] = Object.values(ProcessStep).map((value) => ({
    value,
    label: PROCESS_STEP_LABELS[value],
  }));

  // ---------- State ----------
  isLoading = false;
  loadingLookups = false;
  errorMessage = '';
  lookupErrorMessage = '';

  // ---------- Filters ----------
  districtId = '';
  requestingEntityId = '';
  activityTypeId = '';
  processStep: ProcessStep | '' = '';
  searchTerm = '';
  submissionDateFrom: Date | null = null;
  submissionDateTo: Date | null = null;

  // ---------- Pagination ----------
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;

  // ---------- Icons ----------
  readonly Search = Search;
  readonly RotateCcw = RotateCcw;

  // ---------- Popups ----------
  isAddPopupOpen = false;
  isDetailsPopupOpen = false;
  isEditPopupOpen = false;

  selectedProcessId: string | null = null;

  constructor(
    private readonly licensingProcessService: LicensingProcessService,
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
    this.lookupErrorMessage = '';

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
        this.lookupErrorMessage = 'تعذر تحميل بيانات الفلاتر';
        console.error('LicensingProcess lookups error:', err);
      },
    });
  }

  // ---------- List ----------
  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const query: LicensingProcessQuery = {
      districtId: this.districtId || undefined,
      requestingEntityId: this.requestingEntityId || undefined,
      activityTypeId: this.activityTypeId || undefined,
      processStep: this.processStep || undefined,
      submissionDateFrom: formatDateForApi(this.submissionDateFrom),
      submissionDateTo: formatDateForApi(this.submissionDateTo),
      searchTerm: this.searchTerm.trim() || undefined,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
    };

    this.licensingProcessService.getAll(query).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (!res.isSuccess || !res.data) {
          this.errorMessage = res.message || 'تعذر تحميل المعاملات';
          return;
        }

        this.items = res.data.items || [];
        this.pageNumber = res.data.pageNumber;
        this.pageSize = res.data.pageSize;
        this.totalCount = res.data.totalCount;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل المعاملات';
        console.error('LicensingProcess GET error:', err);
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
    this.processStep = '';
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

  // ---------- Add (unused) ----------
  openAddPopup(): void {
    this.isAddPopupOpen = true;
  }

  closeAddPopup(): void {
    this.isAddPopupOpen = false;
  }

  onAddSaved(): void {
    this.closeAddPopup();
    this.loadData();
  }

  // ---------- Details ----------
  openDetailsPopup(id: string): void {
    this.selectedProcessId = id;
    this.isDetailsPopupOpen = true;
  }

  closeDetailsPopup(): void {
    this.isDetailsPopupOpen = false;
    this.selectedProcessId = null;
  }

  // ---------- Edit ----------
  openEditPopup(id: string): void {
    this.selectedProcessId = id;
    this.isEditPopupOpen = true;
  }

  closeEditPopup(): void {
    this.isEditPopupOpen = false;
    this.selectedProcessId = null;
  }

  onEditSaved(): void {
    this.closeEditPopup();
    this.loadData();
  }

  // ---------- Delete ----------
  onDelete(item: LicensingProcessItem): void {
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

      this.licensingProcessService.delete(item.id).subscribe({
        next: (res) => {
          if (!res.isSuccess) {
            this.snackBar.open(res.message || 'تعذر حذف المعاملة', 'إغلاق', { duration: 3000 });
            return;
          }

          this.snackBar.open('تم حذف المعاملة بنجاح', 'إغلاق', { duration: 2500 });

          if (this.items.length === 1 && this.pageNumber > 1) {
            this.pageNumber--;
          }
          this.loadData();
        },
        error: (err) => {
          this.snackBar.open(
            err?.error?.message || err?.message || 'حدث خطأ أثناء حذف المعاملة',
            'إغلاق',
            { duration: 3000 },
          );
          console.error('LicensingProcess DELETE error:', err);
        },
      });
    });
  }
}
