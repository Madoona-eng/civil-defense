import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiResponse, District } from '../../Models/district';
import { DistrictService } from '../../Services/district.service';

@Component({
  selector: 'app-district-delete',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.scss'
})
export class DeleteComponent {
  @Input() district: District | null = null;

  @Output() deleted = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  deleting = false;
  errorMessage = '';

  constructor(private readonly districtService: DistrictService) {}

  confirmDelete(): void {
    if (!this.district?.id) {
      this.errorMessage = 'لم يتم تحديد المركز / المنطقة';
      return;
    }

    this.deleting = true;
    this.errorMessage = '';

    this.districtService.delete(this.district.id).subscribe({
      next: (res: ApiResponse<boolean>) => {
        this.deleting = false;

        if (!res.isSuccess) {
          this.errorMessage = res.message || 'تعذر حذف المركز / المنطقة';
          return;
        }

        this.deleted.emit();
      },
      error: err => {
        this.deleting = false;
        console.error('District DELETE error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء حذف المركز / المنطقة';
      }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
