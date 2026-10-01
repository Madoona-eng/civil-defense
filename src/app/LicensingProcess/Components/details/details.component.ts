import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {
  ApiResponse,
  LicensingProcessDetails
} from '../../Models/licensing-process';
import { LicensingProcessService } from '../../Services/licensing-process.service';
import { TranslatePipe } from '../../../Shared/Components/translate.pipe';

@Component({
  selector: 'app-licensing-process-details',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent implements OnChanges {
  @Input() processId: string | null = null;
  @Output() closed = new EventEmitter<void>();

  details: LicensingProcessDetails | null = null;

  loading = false;
  errorMessage = '';

  failedImages = new Set<string>();

  constructor(
    private readonly licensingProcessService: LicensingProcessService
  ) {}

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

    this.licensingProcessService.getById(id).subscribe({
      next: (response: ApiResponse<LicensingProcessDetails>) => {
        this.loading = false;

        if (!response.isSuccess) {
          this.errorMessage = response.message || 'فشل تحميل بيانات الترخيص';
          return;
        }

        this.details = response.data;
      },
      error: (err: any) => {
        this.loading = false;
        console.error('LicensingProcess GET BY ID error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل بيانات الترخيص';
      }
    });
  }

  close(): void {
    this.closed.emit();
  }

  getStepLabel(step: string | null): string {
    if (step === 'Inspection') {
      return 'التفتيش / المعاينة';
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

  getOpinionLabel(opinion: string | null): string {
    if (opinion === 'Compliant') {
      return 'مطابق';
    }

    if (opinion === 'NonCompliant') {
      return 'غير مطابق';
    }

    return opinion || '-';
  }

  getFileUrl(filePath: string): string {
    return this.licensingProcessService.buildFileUrl(filePath);
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
    console.log('Image failed:', this.getFileUrl(filePath));
    this.failedImages.add(filePath);
  }
}