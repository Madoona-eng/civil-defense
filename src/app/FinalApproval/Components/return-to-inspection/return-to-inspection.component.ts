import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LucideAngularModule, Undo2 } from 'lucide-angular';

import { FinalApprovalItem } from '../../Models/final-approval';
import { FinalApprovalService } from '../../Services/final-approval.service';

export interface ReturnToInspectionDialogData {
  item: FinalApprovalItem;
}

function notBlank(control: AbstractControl): ValidationErrors | null {
  return String(control.value ?? '').trim() ? null : { required: true };
}

@Component({
  selector: 'app-final-approval-return-to-inspection',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    LucideAngularModule,
  ],
  templateUrl: './return-to-inspection.component.html',
  styleUrl: './return-to-inspection.component.scss',
})
export class ReturnToInspectionComponent {
  readonly Undo2 = Undo2;

  readonly noteContent = new FormControl('', { nonNullable: true, validators: [notBlank] });

  processing = false;
  errorMessage = '';

  constructor(
    private readonly dialogRef: MatDialogRef<ReturnToInspectionComponent, boolean>,
    private readonly finalApprovalService: FinalApprovalService,
    @Inject(MAT_DIALOG_DATA) public data: ReturnToInspectionDialogData,
  ) {}

  onConfirm(): void {
    this.errorMessage = '';

    if (this.noteContent.invalid) {
      this.noteContent.markAsTouched();
      return;
    }

    this.processing = true;
    this.dialogRef.disableClose = true;

    this.finalApprovalService
      .returnToInspection(this.data.item.id, this.noteContent.value.trim())
      .subscribe({
        next: (res) => {
          this.stopProcessing();
          if (!res.isSuccess) {
            this.errorMessage = res.message || 'فشل إرجاع الطلب إلى مرحلة المعاينة';
            return;
          }
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.stopProcessing();
          console.error('Return to inspection error:', err);
          this.errorMessage =
            err?.error?.message ||
            err?.error?.Message ||
            err?.message ||
            'حدث خطأ أثناء إرجاع الطلب إلى مرحلة المعاينة';
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  private stopProcessing(): void {
    this.processing = false;
    this.dialogRef.disableClose = false;
  }
}