import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';

import {
  ApiResponse,
  InspectionAttachment,
  InspectionStepDetails,
} from '../../Models/inspection';

import { InspectionService } from '../../Services/inspection.service';

import {
  PROCESS_STEP_LABELS,
  INSPECTION_OPINION_LABELS,
  ProcessStep,
  InspectionOpinion,
} from '../../../Shared/Enums/enums';
import { SITE_TRANSLATIONS, SiteTranslationPipe } from '../../../Shared/Enums/site-translations';

interface AttachmentGroup {
  title: string;
  files: InspectionAttachment[];
}

@Component({
  selector: 'app-inspection-details',
  standalone: true,
  imports: [CommonModule, SiteTranslationPipe],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export class DetailsComponent implements OnChanges {
  @Input() processId: string | null = null;
  @Output() closed = new EventEmitter<void>();

  details: InspectionStepDetails | null = null;

  loading = false;
  errorMessage = '';
  failedImages = new Set<string>();

  getStepLabel(step: string | null | undefined): string {
    return PROCESS_STEP_LABELS[step as ProcessStep] || step || '-';
  }

  getOpinionLabel(opinion: string | null | undefined): string {
    return (
      INSPECTION_OPINION_LABELS[opinion as InspectionOpinion] || opinion || '-'
    );
  }
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
      next: (response: ApiResponse<InspectionStepDetails>) => {
        this.loading = false;

        if (!response.isSuccess) {
          this.errorMessage = response.message || SITE_TRANSLATIONS['inspection.loadFailed'];
          return;
        }

        this.details = response.data;
      },
      error: (err) => {
        this.loading = false;
        console.error('Inspection details GET error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          SITE_TRANSLATIONS['inspection.loadError'];
      },
    });
  }

  close(): void {
    this.closed.emit();
  }

  getFileUrl(filePath: string): string {
    return this.inspectionService.buildFileUrl(filePath);
  }

  isImageFile(fileName: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    const lowerName = fileName.toLowerCase();

    return imageExtensions.some((extension) => lowerName.endsWith(extension));
  }

  hasImageError(filePath: string): boolean {
    return this.failedImages.has(filePath);
  }

  onImageError(filePath: string): void {
    this.failedImages.add(filePath);
  }

  getAttachmentGroups(details: InspectionStepDetails): AttachmentGroup[] {
    return [
      { title: SITE_TRANSLATIONS['common.entityLetters'], files: details.entityLetters || [] },
      { title: SITE_TRANSLATIONS['common.proofDocuments'], files: details.proofDocuments || [] },
      { title: SITE_TRANSLATIONS['common.engineeringReports'], files: details.engineeringReports || [] },
      { title: SITE_TRANSLATIONS['common.inspectionReports'], files: details.inspectionReports || [] },
      { title: SITE_TRANSLATIONS['common.otherAttachments'], files: details.otherAttachments || [] },
    ];
  }

  formatDate(date: string | null | undefined): string {
    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
