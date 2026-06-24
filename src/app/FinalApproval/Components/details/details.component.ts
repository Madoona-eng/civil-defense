import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import {
  ApiResponse,
  FinalApprovalAttachment,
  FinalApprovalDetails
} from '../../Models/final-approval';

import { FinalApprovalService } from '../../Services/final-approval.service';

interface AttachmentGroup {
  title: string;
  files: FinalApprovalAttachment[];
}

@Component({
  selector: 'app-final-approval-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent implements OnChanges {
  @Input() processId: string | null = null;
  @Output() closed = new EventEmitter<void>();

  details: FinalApprovalDetails | null = null;

  loading = false;
  errorMessage = '';
  failedImages = new Set<string>();

  constructor(private readonly finalApprovalService: FinalApprovalService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['processId'] && this.processId) {
      this.loadDetails(this.processId);
    }
  }

  loadDetails(id: string): void {
    this.loading = true;
    this.errorMessage = '';
    this.details = null;
    this.failedImages.clear();

    this.finalApprovalService.getById(id).subscribe({
      next: (response: ApiResponse<FinalApprovalDetails>) => {
        this.loading = false;

        if (!response.isSuccess) {
          this.errorMessage = response.message || 'تعذر تحميل تفاصيل الموافقة النهائية';
          return;
        }

        this.details = response.data;
      },
      error: err => {
        this.loading = false;
        console.error('Final approval details GET error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل تفاصيل الموافقة النهائية';
      }
    });
  }

  close(): void {
    this.closed.emit();
  }

  getStepLabel(step: string | null | undefined): string {
    if (step === 'Inspection') {
      return 'المعاينة';
    }

    if (step === 'FinalApproval') {
      return 'الموافقة النهائية';
    }

    if (step === 'Archive') {
      return 'الأرشيف';
    }

    if (step === 'NewLicense') {
      return 'ترخيص جديد';
    }

    return step || '-';
  }

  getOpinionLabel(opinion: string | null | undefined): string {
    if (opinion === 'Compliant') {
      return 'مطابق / مستوفي';
    }

    if (opinion === 'NonCompliant') {
      return 'غير مطابق / غير مستوفي';
    }

    return opinion || '-';
  }

  getFinalStatusLabel(status: string | null | undefined): string {
    if (status === 'Accepted') {
      return 'مقبول';
    }

    if (status === 'Rejected') {
      return 'مرفوض';
    }

    return status || '-';
  }

  getFileUrl(filePath: string): string {
    return this.finalApprovalService.buildFileUrl(filePath);
  }

  isImageFile(fileName: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const lowerName = fileName.toLowerCase();

    return imageExtensions.some(extension => lowerName.endsWith(extension));
  }

  hasImageError(filePath: string): boolean {
    return this.failedImages.has(filePath);
  }

  onImageError(filePath: string): void {
    this.failedImages.add(filePath);
  }

  getAttachmentGroups(details: FinalApprovalDetails): AttachmentGroup[] {
    return [
      {
        title: 'خطابات الجهة',
        files: details.entityLetters || []
      },
      {
        title: 'مستندات الإثبات',
        files: details.proofDocuments || []
      },
      {
        title: 'التقارير الهندسية',
        files: details.engineeringReports || []
      },
      {
        title: 'تقارير المعاينة',
        files: details.inspectionReports || []
      },
      {
        title: 'مرفقات أخرى',
        files: details.otherAttachments || []
      }
    ];
  }
}