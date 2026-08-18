import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ApiResponse,
  RequestingEntity,
  UpdateRequestingEntityRequest
} from '../../Models/requesting-entity';
import { RequestingEntityService } from '../../Services/requesting-entity.service';

@Component({
  selector: 'app-requesting-entity-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent implements OnChanges {
  @Input() requestingEntityId: string | null = null;

  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  formModel: UpdateRequestingEntityRequest = {
    code: 0,
    name: ''
  };

  constructor(private readonly requestingEntityService: RequestingEntityService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['requestingEntityId'] && this.requestingEntityId) {
      this.loadDetails(this.requestingEntityId);
    }
  }

  loadDetails(id: string): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.requestingEntityService.getById(id).subscribe({
      next: (res: ApiResponse<RequestingEntity>) => {
        this.loading = false;

        if (!res.isSuccess || !res.data) {
          this.errorMessage = res.message || 'تعذر تحميل بيانات الجهة';
          return;
        }

        this.formModel = {
          code: res.data.code || 0,
          name: res.data.name || ''
        };
      },
      error: err => {
        this.loading = false;
        console.error('RequestingEntity GET BY ID error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل بيانات الجهة';
      }
    });
  }

  save(): void {
    if (!this.requestingEntityId) {
      this.errorMessage = 'لم يتم تحديد الجهة';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    const code = this.formModel.code;
    const name = this.formModel.name.trim();

    if (!name) {
      this.errorMessage = 'من فضلك أدخلي اسم الجهة';
      return;
    }

    const payload: UpdateRequestingEntityRequest = {
      code,
      name
    };

    this.saving = true;

    this.requestingEntityService.update(this.requestingEntityId, payload).subscribe({
      next: (res: ApiResponse<boolean>) => {
        this.saving = false;

        if (!res.isSuccess) {
          this.errorMessage = res.message || 'لم يتم تعديل الجهة';
          return;
        }

        this.successMessage = res.message || 'تم تعديل الجهة بنجاح';

        setTimeout(() => {
          this.saved.emit();
        }, 700);
      },
      error: err => {
        this.saving = false;
        console.error('RequestingEntity PUT error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تعديل الجهة';
      }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}