import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ApiResponse,
  CreateRequestingEntityRequest
} from '../../Models/requesting-entity';
import { RequestingEntityService } from '../../Services/requesting-entity.service';

@Component({
  selector: 'app-requesting-entity-add',
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

  formModel: CreateRequestingEntityRequest = {
    code: 0,
    name: ''
  };

  constructor(private readonly requestingEntityService: RequestingEntityService) {}

  save(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const code = this.formModel.code;
    const name = this.formModel.name.trim();

    if (!code) {
      this.errorMessage = 'من فضلك أدخلي كود الجهة';
      return;
    }

    if (!name) {
      this.errorMessage = 'من فضلك أدخلي اسم الجهة';
      return;
    }

    const payload: CreateRequestingEntityRequest = {
      code,
      name
    };

    this.saving = true;

    this.requestingEntityService.create(payload).subscribe({
      next: (res: ApiResponse<boolean>) => {
        this.saving = false;

        if (!res.isSuccess) {
          this.errorMessage = res.message || 'لم يتم إنشاء الجهة';
          return;
        }

        this.successMessage = res.message || 'تم إنشاء الجهة بنجاح';

        this.formModel = {
          code: 0,
          name: ''
        };

        setTimeout(() => {
          this.saved.emit();
        }, 800);
      },
      error: err => {
        this.saving = false;
        console.error('RequestingEntity POST error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء إضافة الجهة';
      }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}