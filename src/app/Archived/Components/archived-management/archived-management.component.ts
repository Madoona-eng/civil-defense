import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AppIconComponent } from '../../../Shared/Components/app-icon/app-icon.component';
import { ConfirmDialogComponent } from '../../../Shared/Components/confirm-dialog/confirm-dialog.component';
import { TranslatePipe } from '../../../Shared/Components/translate.pipe';
import { BaseAPI } from '../../../Shared/Env/env';
import { formatDateForApi } from '../../../Shared/Helpers/date.helper';
import { LookupItem } from '../../../Shared/Models/LookupItem';
import { Archived, ArchivedFilter } from '../../Models/archived';
import { ArchivedService } from '../../Services/archived.service';
import { DetailsComponent } from '../details/details.component';
import { ListComponent } from '../list/list.component';

@Component({
  selector: 'app-archived-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ListComponent,
    DetailsComponent,
    TranslatePipe,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDialogModule,
    AppIconComponent,
  ],
  templateUrl: './archived-management.component.html',
  styleUrl: './archived-management.component.scss',
})
export class ArchivedManagementComponent implements OnInit {
  @ViewChild(ListComponent) listComponent?: ListComponent;

  isDetailsPopupOpen = false;
  selectedId: string | null = null;
  selectedItem: Archived | null = null;

  districts: LookupItem[] = [];
  requestingEntities: LookupItem[] = [];
  activityTypes: LookupItem[] = [];
  submissionDateFrom: Date | null = null;
  submissionDateTo: Date | null = null;

  filter: ArchivedFilter = {
    pageNumber: 1,
    pageSize: 10,
  };

  constructor(
    private readonly http: HttpClient,
    private readonly archivedService: ArchivedService,
    private readonly dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadLookups();
  }

  loadLookups(): void {
    this.http.get<any>(`${BaseAPI}/api/District`).subscribe({
      next: (res) => {
        if (res.isSuccess) this.districts = res.data;
      },
    });
    this.http.get<any>(`${BaseAPI}/api/RequestingEntity`).subscribe({
      next: (res) => {
        if (res.isSuccess) this.requestingEntities = res.data;
      },
    });
    this.http.get<any>(`${BaseAPI}/api/ActivityType`).subscribe({
      next: (res) => {
        if (res.isSuccess) this.activityTypes = res.data;
      },
    });
  }

  search(): void {
    this.filter.pageNumber = 1;
    this.filter.submissionDateFrom = formatDateForApi(this.submissionDateFrom);
    this.filter.submissionDateTo = formatDateForApi(this.submissionDateTo);
    this.listComponent?.applyFilter(this.filter);
  }

  resetFilters(): void {
    this.filter = { pageNumber: 1, pageSize: 10 };
    this.submissionDateFrom = null;
    this.submissionDateTo = null;
    this.listComponent?.applyFilter(this.filter);
  }

  openDetailsPopup(id: string): void {
    this.selectedId = id;
    this.isDetailsPopupOpen = true;
  }

  closeDetailsPopup(): void {
    this.isDetailsPopupOpen = false;
    this.selectedId = null;
  }

  openDeletePopup(item: Archived): void {
    this.selectedItem = item;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        message: `هل أنت متأكد من حذف الطلب "${item.establishmentName}"؟`,
        confirmText: 'حذف',
        cancelText: 'إلغاء',
        confirmClass: 'btn-danger',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.confirmDelete();
      }
      this.selectedItem = null;
    });
  }

  confirmDelete(): void {
    if (!this.selectedItem) return;

    this.archivedService.delete(this.selectedItem.id).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.listComponent?.loadData();
        } else {
          alert(res.message);
        }
      },
      error: (err) => {
        alert(err?.error?.message || 'حدث خطأ أثناء حذف العنصر الأرشيفي');
      },
    });
  }
}
