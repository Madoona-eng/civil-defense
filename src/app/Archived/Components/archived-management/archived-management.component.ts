import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ListComponent } from '../list/list.component';
import { DetailsComponent } from '../details/details.component';
import { Archived, ArchivedFilter, LookupItem } from '../../Models/archived';
import { ArchivedService } from '../../Services/archived.service';

@Component({
  selector: 'app-archived-management',
  standalone: true,
  imports: [FormsModule, ListComponent, DetailsComponent],
  templateUrl: './archived-management.component.html',
  styleUrl: './archived-management.component.scss'
})
export class ArchivedManagementComponent implements OnInit {
  @ViewChild(ListComponent) listComponent?: ListComponent;

  isDetailsPopupOpen = false;
  isDeletePopupOpen = false;
  selectedId: string | null = null;
  selectedItem: Archived | null = null;

  districts: LookupItem[] = [];
  requestingEntities: LookupItem[] = [];
  activityTypes: LookupItem[] = [];

  filter: ArchivedFilter = {
    pageNumber: 1,
    pageSize: 10
  };

  constructor(
    private readonly http: HttpClient,
    private readonly archivedService: ArchivedService
  ) {}

  ngOnInit(): void {
    this.loadLookups();
  }

  loadLookups(): void {
    this.http.get<any>('/api/District').subscribe({
      next: (res) => { if (res.isSuccess) this.districts = res.data; }
    });
    this.http.get<any>('/api/RequestingEntity').subscribe({
      next: (res) => { if (res.isSuccess) this.requestingEntities = res.data; }
    });
    this.http.get<any>('/api/ActivityType').subscribe({
      next: (res) => { if (res.isSuccess) this.activityTypes = res.data; }
    });
  }

  search(): void {
    this.filter.pageNumber = 1;
    this.listComponent?.applyFilter(this.filter);
  }

  resetFilters(): void {
    this.filter = { pageNumber: 1, pageSize: 10 };
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
    this.isDeletePopupOpen = true;
  }

  closeDeletePopup(): void {
    this.isDeletePopupOpen = false;
    this.selectedItem = null;
  }

  confirmDelete(): void {
    if (!this.selectedItem) return;

    this.archivedService.delete(this.selectedItem.id).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.closeDeletePopup();
          this.listComponent?.loadData();
        } else {
          alert(res.message);
        }
      },
      error: (err) => {
        alert(err?.error?.message || 'حدث خطأ أثناء الحذف');
      }
    });
  }
}