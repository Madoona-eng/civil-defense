import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import {
  ApiResponse,
  FinalApprovalAttachment,
  FinalApprovalDetails
} from '../../Models/final-approval';

import { FinalApprovalService } from '../../Services/final-approval.service';
import { SITE_TRANSLATIONS, SiteTranslationPipe } from '../../../Shared/Enums/site-translations';

interface AttachmentGroup {
  title: string;
  files: FinalApprovalAttachment[];
}

@Component({
  selector: 'app-final-approval-details',
  standalone: true,
  imports: [CommonModule, SiteTranslationPipe],
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
          this.errorMessage = response.message || SITE_TRANSLATIONS['final.loadFailed'];
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
          SITE_TRANSLATIONS['final.loadError'];
      }
    });
  }

  close(): void {
    this.closed.emit();
  }

  getStepLabel(step: string | null | undefined): string {
    if (step === 'Inspection') {
      return SITE_TRANSLATIONS['step.inspection'];
    }

    if (step === 'FinalApproval') {
      return SITE_TRANSLATIONS['step.finalApproval'];
    }

    if (step === 'Archive') {
      return SITE_TRANSLATIONS['step.archive'];
    }

    if (step === 'NewLicense') {
      return SITE_TRANSLATIONS['step.newLicense'];
    }

    return step || '-';
  }

  getOpinionLabel(opinion: string | null | undefined): string {
    if (opinion === 'Compliant') {
      return SITE_TRANSLATIONS['final.opinionCompliant'];
    }

    if (opinion === 'NonCompliant') {
      return SITE_TRANSLATIONS['final.opinionNonCompliant'];
    }

    return opinion || '-';
  }

  getFinalStatusLabel(status: string | null | undefined): string {
    if (status === 'Accepted') {
      return SITE_TRANSLATIONS['review.accepted'];
    }

    if (status === 'Rejected') {
      return SITE_TRANSLATIONS['review.rejected'];
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
        title: SITE_TRANSLATIONS['common.entityLetters'],
        files: details.entityLetters || []
      },
      {
        title: SITE_TRANSLATIONS['common.proofDocuments'],
        files: details.proofDocuments || []
      },
      {
        title: SITE_TRANSLATIONS['common.engineeringReports'],
        files: details.engineeringReports || []
      },
      {
        title: SITE_TRANSLATIONS['common.inspectionReports'],
        files: details.inspectionReports || []
      },
      {
        title: SITE_TRANSLATIONS['common.otherAttachments'],
        files: details.otherAttachments || []
      }
    ];
  }
}