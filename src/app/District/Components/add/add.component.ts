import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiResponse, CreateDistrictRequest } from '../../Models/district';
import { DistrictService } from '../../Services/district.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '../../../Shared/Components/translate.pipe';

@Component({
  selector: 'app-district-add',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, TranslatePipe],
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
      this.errorMessage = 'يرجى إدخال كود صحيح أكبر من الصفر';
      return;
    }

    if (!name) {
      this.errorMessage = 'اسم الحي / المركز مطلوب';
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
          this.errorMessage = res.message || 'فشل إضافة الحي / المركز';
          return;
        }

        this.successMessage = res.message || 'تمت إضافة الحي / المركز بنجاح';

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
          'حدث خطأ أثناء إضافة الحي / المركز';
      }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}