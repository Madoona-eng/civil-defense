import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { District } from '../../Models/district';
import { DistrictService } from '../../Services/district.service';

@Component({
  selector: 'app-district-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  @Output() editRequested = new EventEmitter<string>();
  @Output() deleteRequested = new EventEmitter<District>();

  districts: District[] = [];

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
          this.errorMessage = response.message || 'تعذر تحميل المراكز / المناطق';
          return;
        }

        this.districts = response.data || [];
      },
      error: err => {
        this.isLoading = false;
        console.error('District GET error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل المراكز / المناطق';
      }
    });
  }

  requestEdit(id: string): void {
    this.editRequested.emit(id);
  }

  requestDelete(item: District): void {
    this.deleteRequested.emit(item);
  }
}