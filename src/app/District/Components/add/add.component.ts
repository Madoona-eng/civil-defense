import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiResponse, CreateDistrictRequest } from '../../Models/district';
import { DistrictService } from '../../Services/district.service';

@Component({
  selector: 'app-district-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add.component.html',
  styleUrl: './add.component.scss'
})
export class AddComponent {
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  saving = false;
  errorMessage = '';
  successMessage = '';

  formModel: { code: number | null; name: string } = {
    code: null,
    name: ''
  };

  constructor(private readonly districtService: DistrictService) {}

  save(): void {
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

    const payload: CreateDistrictRequest = {
      code,
      name
    };

    this.saving = true;

    this.districtService.create(payload).subscribe({
      next: (res: ApiResponse<boolean>) => {
        this.saving = false;

        if (!res.isSuccess) {
          this.errorMessage = res.message || 'لم يتم إنشاء المركز / المنطقة';
          return;
        }

        this.successMessage = res.message || 'تم إنشاء المركز / المنطقة بنجاح';

        this.formModel = {
          code: null,
          name: ''
        };

        setTimeout(() => {
          this.saved.emit();
        }, 800);
      },
      error: err => {
        this.saving = false;
        console.error('District POST error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء إضافة المركز / المنطقة';
      }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}