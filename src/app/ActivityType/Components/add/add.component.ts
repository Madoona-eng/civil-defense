import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiResponse, CreateActivityTypeRequest } from '../../Models/activity-type';
import { ActivityTypeService } from '../../Services/activity-type.service';

@Component({
  selector: 'app-add',
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

  constructor(private readonly activityTypeService: ActivityTypeService) {}

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
    this.errorMessage = 'من فضلك أدخلي اسم نوع النشاط';
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
        this.errorMessage = res.message || 'لم يتم إنشاء نوع النشاط';
        return;
      }

      this.successMessage = res.message || 'تم إنشاء نوع النشاط بنجاح';

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
        'حدث خطأ أثناء إضافة نوع النشاط';
    }
  });
}

  cancel(): void {
    this.cancelled.emit();
  }
}