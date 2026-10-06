import { Component, Input, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ArchivedService } from '../../Services/archived.service';
import { ArchivedDetails } from '../../Models/archived';
import { APPLICATION_STATUS_LABELS, APPLICANT_ROLE_LABELS, INSPECTION_OPINION_LABELS, PROCESS_STEP_LABELS, REVIEW_STATUS_LABELS } from '../../../Shared/Enums/enums';
import { TranslatePipe } from '../../../Shared/Components/translate.pipe';
import { iconByName, isImageFile, openFile } from '../../../Shared/Helpers/file.helper';
import { buildFileUrl } from '../../../Shared/Utils/file-url';

type AttachmentKey =
  | 'entityLetters'
  | 'proofDocuments'
  | 'engineeringReports'
  | 'inspectionReports'
  | 'otherAttachments';

interface AttachmentGroup {
  title: string;
  files: ArchivedDetails[AttachmentKey];
}

const ATTACHMENT_FIELDS: { key: AttachmentKey; label: string }[] = [
  { key: 'entityLetters', label: 'common.entityLetters' },
  { key: 'proofDocuments', label: 'common.proofDocuments' },
  { key: 'engineeringReports', label: 'common.engineeringReports' },
  { key: 'inspectionReports', label: 'common.inspectionReports' },
  { key: 'otherAttachments', label: 'common.otherAttachments' },
];

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [DatePipe, MatIconModule, TranslatePipe],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export class DetailsComponent implements OnInit {
  @Input() id!: string;

  readonly isImageFile = isImageFile;
  readonly openFile = openFile;
  readonly getFileUrl = buildFileUrl;
  readonly iconByName = iconByName;

  details: ArchivedDetails | null = null;
  isLoading = false;
  errorMessage = '';
  failedImages = new Set<string>();

  constructor(private readonly archivedService: ArchivedService) {}

  ngOnInit(): void {
    this.loadDetails();
  }

  loadDetails(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.details = null;
    this.failedImages.clear();

    this.archivedService.getById(this.id).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (!res.isSuccess) {
          this.errorMessage = res.message || 'فشل تحميل تفاصيل الأرشيف';
          return;
        }
        this.details = res.data;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل التفاصيل الأرشيفية';
      },
    });
  }

  getOpinionLabel(opinion: string): string {
    return INSPECTION_OPINION_LABELS[opinion as keyof typeof INSPECTION_OPINION_LABELS] ?? opinion;
  }

  getFinalStatusLabel(status: string): string {
    return APPLICATION_STATUS_LABELS[status as keyof typeof APPLICATION_STATUS_LABELS] ?? status;
  }

  getApplicantRoleLabel(role: string): string {
    return role === 'Agent'
      ? 'وكيل'
      : APPLICANT_ROLE_LABELS[role as keyof typeof APPLICANT_ROLE_LABELS] ?? role;
  }

  getReviewStatusLabel(status: string): string {
    return REVIEW_STATUS_LABELS[status as keyof typeof REVIEW_STATUS_LABELS] ?? status;
  }

  getStepLabel(step: string): string {
    return PROCESS_STEP_LABELS[step as keyof typeof PROCESS_STEP_LABELS] ?? step;
  }

  getAttachmentGroups(details: ArchivedDetails): AttachmentGroup[] {
    return ATTACHMENT_FIELDS.map(({ key, label }) => ({
      title: label,
      files: details[key] || [],
    })).filter((group) => group.files.length > 0);
  }

  hasAnyAttachments(details: ArchivedDetails): boolean {
    return this.getAttachmentGroups(details).length > 0;
  }

  hasImageError(filePath: string): boolean {
    return this.failedImages.has(filePath);
  }

  onImageError(filePath: string): void {
    this.failedImages.add(filePath);
  }
}