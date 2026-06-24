import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ArchivedService } from '../../Services/archived.service';
import { Archived, ArchivedFilter } from '../../Models/archived';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  @Output() viewRequested = new EventEmitter<string>();
  @Output() deleteRequested = new EventEmitter<Archived>();

  items: Archived[] = [];
  isLoading = false;
  errorMessage = '';

  filter: ArchivedFilter = {
    pageNumber: 1,
    pageSize: 10
  };

  totalCount = 0;
  totalPages = 0;
  hasNextPage = false;
  hasPreviousPage = false;

  constructor(private readonly archivedService: ArchivedService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.archivedService.getAll(this.filter).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (!res.isSuccess) {
          this.errorMessage = res.message || 'تعذر تحميل البيانات';
          return;
        }
        this.items = res.data.items;
        this.totalCount = res.data.totalCount;
        this.totalPages = res.data.totalPages;
        this.hasNextPage = res.data.hasNextPage;
        this.hasPreviousPage = res.data.hasPreviousPage;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل البيانات';
      }
    });
  }

  applyFilter(filter: ArchivedFilter): void {
    this.filter = { ...filter };
    this.loadData();
  }

  requestView(id: string): void {
    this.viewRequested.emit(id);
  }

  requestDelete(item: Archived): void {
    this.deleteRequested.emit(item);
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.filter.pageNumber++;
      this.loadData();
    }
  }

  prevPage(): void {
    if (this.hasPreviousPage) {
      this.filter.pageNumber--;
      this.loadData();
    }
  }
}