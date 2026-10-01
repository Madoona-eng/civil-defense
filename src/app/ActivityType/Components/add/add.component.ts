import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiResponse, CreateActivityTypeRequest } from '../../Models/activity-type';
import { ActivityTypeService } from '../../Services/activity-type.service';
import { TranslatePipe } from '../../../Shared/Components/translate.pipe';

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
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

  constructor(private readonly activityTypeService: ActivityTypeService) {}

  save(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const code = Number(this.formModel.code);
    const name = this.formModel.name.trim();

    if (!Number.isFinite(code) || code <= 0) {
      this.errorMessage = 'يرجى إدخال كود صحيح';
      return;
    }

    if (!name) {
      this.errorMessage = 'اسم النشاط مطلوب';
      return;
    }

    const payload: CreateActivityTypeRequest = {
      code,
      name
    };

    this.saving = true;

    this.activityTypeService.create(payload).subscribe({
      next: (res: ApiResponse<boolean>) => {
        this.saving = false;

        if (!res.isSuccess) {
          this.errorMessage = res.message || 'فشل إضافة نوع النشاط';
          return;
        }

        this.successMessage = res.message || 'تمت إضافة نوع النشاط بنجاح';

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
        console.error('ActivityType POST error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء حفظ النشاط';
      }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}