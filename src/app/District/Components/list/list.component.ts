import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DistrictSummary } from '../../Models/district';
import { DistrictService } from '../../Services/district.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  @Output() editRequested = new EventEmitter<string>();
  @Output() deleteRequested = new EventEmitter<DistrictSummary>();

  districts: DistrictSummary[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private readonly districtService: DistrictService) {}

  ngOnInit(): void {
    this.loadDistricts();
  }

  loadDistricts(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.districtService.getAll().subscribe({
      next: response => {
        this.isLoading = false;
        if (!response.isSuccess) {
          this.errorMessage = response.message || 'تعذر تحميل المراكز';
          return;
        }
        this.districts = response.data || [];
      },
      error: err => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل المراكز';
      }
    });
  }

  requestEdit(id: string): void {
    this.editRequested.emit(id);
  }

  requestDelete(item: DistrictSummary): void {
    this.deleteRequested.emit(item);
  }
}