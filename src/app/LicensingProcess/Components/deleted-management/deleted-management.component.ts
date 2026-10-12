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

import { AppIconComponent } from '../../../Shared/Components/app-icon/app-icon.component';
import { ConfirmDialogComponent } from '../../../Shared/Components/confirm-dialog/confirm-dialog.component';
import { PROCESS_STEP_LABELS, ProcessStep } from '../../../Shared/Enums/enums';
import { formatDateForApi } from '../../../Shared/Helpers/date.helper';
import { SelectOption } from '../../../Shared/Models/SelectOption';
import { DeletedProcessItem, DeletedProcessQuery } from '../../Models/licensing-process';
import { LicensingProcessService } from '../../Services/licensing-process.service';
import { DeletedListComponent } from '../deleted-list/deleted-list.component';

@Component({
  selector: 'app-licensing-process-deleted-management',
  standalone: true,
  imports: [
    FormsModule,
    AppIconComponent,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    DeletedListComponent,
  ],
  templateUrl: './deleted-management.component.html',
  styleUrl: './deleted-management.component.scss',
})
export class DeletedManagementComponent implements OnInit {
  // ---------- Data ----------
  items: DeletedProcessItem[] = [];

  readonly processStepOptions: SelectOption[] = Object.values(ProcessStep).map((value) => ({
    value,
    label: PROCESS_STEP_LABELS[value],
  }));

  // ---------- State ----------
  isLoading = false;
  errorMessage = '';

  // ---------- Filters ----------
  searchTerm = '';
  processStep: ProcessStep | '' = '';
  dateFrom: Date | null = null;
  dateTo: Date | null = null;

  // ---------- Pagination ----------
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;

  constructor(
    private readonly licensingProcessService: LicensingProcessService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  // ---------- List ----------
  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const query: DeletedProcessQuery = {
      processStep: this.processStep || undefined,
      dateFrom: formatDateForApi(this.dateFrom),
      dateTo: formatDateForApi(this.dateTo),
      searchTerm: this.searchTerm.trim() || undefined,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
    };

    this.licensingProcessService.getDeleted(query).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (!res.isSuccess || !res.data) {
          this.errorMessage = res.message || 'تعذر تحميل المعاملات المحذوفة';
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
          'حدث خطأ أثناء تحميل المعاملات المحذوفة';
        console.error('Deleted processes GET error:', err);
      },
    });
  }

  search(): void {
    this.pageNumber = 1;
    this.loadData();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.processStep = '';
    this.dateFrom = null;
    this.dateTo = null;
    this.pageNumber = 1;
    this.loadData();
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  // ---------- Restore ----------
  onRestore(item: DeletedProcessItem): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        message: `هل تريد استرجاع المعاملة الخاصة بـ "${item.establishmentName}"؟`,
        confirmText: 'استرجاع',
        cancelText: 'إلغاء',
        confirmClass: 'btn-save',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.licensingProcessService.restore(item.id).subscribe({
        next: (res) => {
          if (!res.isSuccess) {
            this.snackBar.open(res.message || 'تعذر استرجاع المعاملة', 'إغلاق', {
              duration: 3000,
            });
            return;
          }

          this.snackBar.open('تم استرجاع المعاملة بنجاح', 'إغلاق', { duration: 2500 });

          if (this.items.length === 1 && this.pageNumber > 1) {
            this.pageNumber--;
          }
          this.loadData();
        },
        error: (err) => {
          this.snackBar.open(
            err?.error?.message || err?.message || 'حدث خطأ أثناء استرجاع المعاملة',
            'إغلاق',
            { duration: 3000 },
          );
          console.error('Restore process error:', err);
        },
      });
    });
  }
}