import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import {
  ApiResponse,
  LicensingProcessDetails
} from '../../Models/licensing-process';
import { LicensingProcessService } from '../../Services/licensing-process.service';

@Component({
  selector: 'app-licensing-process-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent implements OnChanges, OnDestroy {
  @Input() processId: string | null = null;
  @Output() closed = new EventEmitter<void>();

  details: LicensingProcessDetails | null = null;

  loading = false;
  errorMessage = '';

  private readonly filesBaseUrl = '';
  failedImages = new Set<string>();
  private readonly previewUrlByPath = new Map<string, string>();

  constructor(
    private readonly licensingProcessService: LicensingProcessService,
    private readonly http: HttpClient
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
          this.errorMessage = response.message || 'تعذر تحميل بيانات المعاملة';
          return;
        }

        this.details = response.data;
        this.loadAttachmentPreviews();
      },
      error: (err: any) => {
        this.loading = false;
        console.error('LicensingProcess GET BY ID error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل بيانات المعاملة';
      }
    });
  }

  ngOnDestroy(): void {
    this.previewUrlByPath.forEach(url => URL.revokeObjectURL(url));
    this.previewUrlByPath.clear();
  }

  close(): void {
    this.closed.emit();
  }

  getStepLabel(step: string | null): string {
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

  getOpinionLabel(opinion: string | null): string {
    if (opinion === 'Compliant') {
      return 'مطابق';
    }

    if (opinion === 'NonCompliant') {
      return 'غير مطابق';
    }

    return opinion || '-';
  }

  private normalizeFilePath(filePath: string): string {
    const cleanPath = filePath
      .replace(/^\/+/, '')
      .replace(/\\/g, '/');

    if (!cleanPath) {
      return '';
    }

    return cleanPath.startsWith('uploads/') ? cleanPath : `uploads/${cleanPath}`;
  }

  getFileUrl(filePath: string): string {
    const normalizedPath = this.normalizeFilePath(filePath);
    return normalizedPath ? encodeURI(`${this.filesBaseUrl}/${normalizedPath}`) : '';
  }

  getPreviewUrl(filePath: string): string {
    return this.previewUrlByPath.get(filePath) || this.getFileUrl(filePath);
  }

  private loadAttachmentPreviews(): void {
    if (!this.details) {
      return;
    }

    const attachments = [
      ...this.details.entityLetters,
      ...this.details.proofDocuments,
      ...this.details.engineeringReports,
      ...this.details.inspectionReports,
      ...this.details.otherAttachments
    ];

    attachments.forEach(file => {
      if (!this.isImageFile(file.fileName) || this.previewUrlByPath.has(file.filePath) || this.failedImages.has(file.filePath)) {
        return;
      }

      this.http.get(this.getFileUrl(file.filePath), { responseType: 'blob' }).subscribe({
        next: (blob: Blob) => {
          const previewUrl = URL.createObjectURL(blob);
          this.previewUrlByPath.set(file.filePath, previewUrl);
          this.failedImages.delete(file.filePath);
        },
        error: () => {
          this.failedImages.add(file.filePath);
        }
      });
    });
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
}