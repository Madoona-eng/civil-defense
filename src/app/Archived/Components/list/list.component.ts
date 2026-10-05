import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ArchivedService } from '../../Services/archived.service';
import { Archived, ArchivedFilter } from '../../Models/archived';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../Shared/Components/translate.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
  ],
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
          this.errorMessage = res.message || 'فشل تحميل بيانات الأرشيف';
          return;
        }
        this.items = res.data.items;
        this.totalCount = res.data.totalCount;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل بيانات الأرشيف';
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

  onPageChange(event: PageEvent): void {
    this.filter = {
      ...this.filter,
      pageNumber: event.pageIndex + 1,
      pageSize: event.pageSize,
    };
    this.loadData();
  }
}