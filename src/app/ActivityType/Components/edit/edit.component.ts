import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ActivityType,
  ApiResponse,
  UpdateActivityTypeRequest
} from '../../Models/activity-type';
import { ActivityTypeService } from '../../Services/activity-type.service';
import { TranslatePipe } from '../../../Shared/Components/translate.pipe';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent implements OnChanges {
  @Input() activityTypeId: string | null = null;

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

  constructor(private readonly activityTypeService: ActivityTypeService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activityTypeId'] && this.activityTypeId) {
      this.loadDetails(this.activityTypeId);
    }
  }

  loadDetails(id: string): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.activityTypeService.getById(id).subscribe({
      next: (res: ApiResponse<ActivityType>) => {
        this.loading = false;

        if (!res.isSuccess || !res.data) {
          this.errorMessage = res.message || 'فشل تحميل بيانات نوع النشاط';
          return;
        }

        this.formModel = {
          code: res.data.code ?? null,
          name: res.data.name || ''
        };
      },
      error: err => {
        this.loading = false;
        console.error('ActivityType GET BY ID error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل البيانات';
      }
    });
  }

  save(): void {
    if (!this.activityTypeId) {
      this.errorMessage = 'لم يتم تحديد نوع النشاط';
      return;
    }

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

    const payload: UpdateActivityTypeRequest = {
      code,
      name
    };

    this.saving = true;

    this.activityTypeService.update(this.activityTypeId, payload).subscribe({
      next: (res: ApiResponse<boolean>) => {
        this.saving = false;

        if (!res.isSuccess) {
          this.errorMessage = res.message || 'فشل تحديث نوع النشاط';
          return;
        }

        this.successMessage = res.message || 'تم تحديث نوع النشاط بنجاح';

        setTimeout(() => {
          this.saved.emit();
        }, 700);
      },
      error: err => {
        this.saving = false;
        console.error('ActivityType PUT error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء حفظ التحديثات';
      }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}