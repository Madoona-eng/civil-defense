import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ApiResponse,
  District,
  UpdateDistrictRequest
} from '../../Models/district';
import { DistrictService } from '../../Services/district.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-district-edit',
  standalone: true,
  imports: [CommonModule, FormsModule,MatIconModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent implements OnChanges {
  @Input() districtId: string | null = null;

  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  formModel: { code: number | null; name: string } = {
    code: null,
    name: ''
  };

  constructor(private readonly districtService: DistrictService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['districtId'] && this.districtId) {
      this.loadDetails(this.districtId);
    }
  }

  loadDetails(id: string): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.districtService.getById(id).subscribe({
      next: (res: ApiResponse<District>) => {
        this.loading = false;

        if (!res.isSuccess || !res.data) {
          this.errorMessage = res.message || 'تعذر تحميل بيانات المركز / المنطقة';
          return;
        }

        this.formModel = {
          code: res.data.code ?? null,
          name: res.data.name || ''
        };
      },
      error: err => {
        this.loading = false;
        console.error('District GET BY ID error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل بيانات المركز / المنطقة';
      }
    });
  }

  save(): void {
    if (!this.districtId) {
      this.errorMessage = 'لم يتم تحديد المركز / المنطقة';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    const code = Number(this.formModel.code);
    const name = this.formModel.name.trim();

    if (!Number.isFinite(code) || code <= 0) {
      this.errorMessage = 'من فضلك أدخلي رقم كود صحيح';
      return;
    }

    if (!name) {
      this.errorMessage = 'من فضلك أدخلي اسم المركز / المنطقة';
      return;
    }

    const payload: UpdateDistrictRequest = {
      code,
      name
    };

    this.saving = true;

    this.districtService.update(this.districtId, payload).subscribe({
      next: (res: ApiResponse<boolean>) => {
        this.saving = false;

        if (!res.isSuccess) {
          this.errorMessage = res.message || 'لم يتم تعديل المركز / المنطقة';
          return;
        }

        this.successMessage = res.message || 'تم تعديل المركز / المنطقة بنجاح';

        setTimeout(() => {
          this.saved.emit();
        }, 700);
      },
      error: err => {
        this.saving = false;
        console.error('District PUT error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تعديل المركز / المنطقة';
      }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
