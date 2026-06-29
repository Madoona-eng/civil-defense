import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ApiResponse,
  LicensingProcessItem,
  LicensingProcessQuery,
  PagedResult
} from '../../Models/licensing-process';
import { LicensingProcessService } from '../../Services/licensing-process.service';

@Component({
  selector: 'app-licensing-process-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  @Output() detailsRequested = new EventEmitter<string>();
  @Output() editRequested = new EventEmitter<string>();
  @Output() deleteRequested = new EventEmitter<LicensingProcessItem>();

  items: LicensingProcessItem[] = [];

  isLoading = false;
  errorMessage = '';

  searchTerm = '';
  processStep = '';

  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  hasNextPage = false;
  hasPreviousPage = false;

  processSteps = [
    { value: '', label: 'كل المراحل' },
    { value: 'Inspection', label: 'المعاينة' },
    { value: 'FinalApproval', label: 'الموافقة النهائية' },
    { value: 'Archive', label: 'الأرشيف' }
  ];

  constructor(private readonly licensingProcessService: LicensingProcessService) {}

  ngOnInit(): void {
    this.loadLicensingProcesses();
  }

  loadLicensingProcesses(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const query: LicensingProcessQuery = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm.trim(),
      processStep: this.processStep
    };

    this.licensingProcessService.getAll(query).subscribe({
      next: (response: ApiResponse<PagedResult<LicensingProcessItem>>) => {
        this.isLoading = false;

        if (!response.isSuccess) {
          this.errorMessage = response.message || 'تعذر تحميل تراخيص المحال';
          return;
        }

        this.items = response.data.items || [];
        this.pageNumber = response.data.pageNumber;
        this.pageSize = response.data.pageSize;
        this.totalCount = response.data.totalCount;
        this.totalPages = response.data.totalPages;
        this.hasNextPage = response.data.hasNextPage;
        this.hasPreviousPage = response.data.hasPreviousPage;
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('LicensingProcess GET error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل تراخيص المحال';
      }
    });
  }

  requestDetails(id: string): void {
    this.detailsRequested.emit(id);
  }

  requestEdit(id: string): void {
    this.editRequested.emit(id);
  }

  requestDelete(item: LicensingProcessItem): void {
    this.deleteRequested.emit(item);
  }

  search(): void {
    this.pageNumber = 1;
    this.loadLicensingProcesses();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.processStep = '';
    this.pageNumber = 1;
    this.loadLicensingProcesses();
  }

  nextPage(): void {
    if (!this.hasNextPage) {
      return;
    }

    this.pageNumber++;
    this.loadLicensingProcesses();
  }

  previousPage(): void {
    if (!this.hasPreviousPage) {
      return;
    }

    this.pageNumber--;
    this.loadLicensingProcesses();
  }

  getStepLabel(step: string): string {
    if (step === 'Inspection') {
      return 'المعاينة';
    }

    if (step === 'FinalApproval') {
      return 'الموافقة النهائية';
    }

    if (step === 'Archive') {
      return 'الأرشيف';
    }

    return step || '-';
  }
}