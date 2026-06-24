import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import {
  ApiResponse,
  InspectionAttachment,
  InspectionDetails
} from '../../Models/inspection';

import { InspectionService } from '../../Services/inspection.service';

interface AttachmentGroup {
  title: string;
  files: InspectionAttachment[];
}

@Component({
  selector: 'app-inspection-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent implements OnChanges {
  @Input() processId: string | null = null;
  @Output() closed = new EventEmitter<void>();

  details: InspectionDetails | null = null;

  loading = false;
  errorMessage = '';
  failedImages = new Set<string>();

  constructor(private readonly inspectionService: InspectionService) {}

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

    this.inspectionService.getById(id).subscribe({
      next: (response: ApiResponse<InspectionDetails>) => {
        this.loading = false;

        if (!response.isSuccess) {
          this.errorMessage = response.message || 'تعذر تحميل بيانات المعاينة';
          return;
        }

        this.details = response.data;
      },
      error: err => {
        this.loading = false;
        console.error('Inspection details GET error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل بيانات المعاينة';
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

  getFileUrl(filePath: string): string {
    return this.inspectionService.buildFileUrl(filePath);
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

  getAttachmentGroups(details: InspectionDetails): AttachmentGroup[] {
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