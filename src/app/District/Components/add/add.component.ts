import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiResponse, CreateDistrict } from '../../Models/district';
import { DistrictService } from '../../Services/district.service';

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [FormsModule],
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
      this.errorMessage = 'من فضلك أدخل رقم كود صحيح';
      return;
    }
    if (!name) {
      this.errorMessage = 'من فضلك أدخل اسم المركز';
      return;
    }

    const payload: CreateDistrict = { code, name };

    this.saving = true;
    this.districtService.create(payload).subscribe({
      next: (res: ApiResponse<boolean>) => {
        this.saving = false;
        if (!res.isSuccess) {
          this.errorMessage = res.message || 'لم يتم إنشاء المركز';
          return;
        }
        this.successMessage = res.message || 'تم إنشاء المركز بنجاح';
        this.formModel = { code: null, name: '' };
        setTimeout(() => {
          this.saved.emit();
        }, 800);
      },
      error: err => {
        this.saving = false;
        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء إضافة المركز';
      }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}