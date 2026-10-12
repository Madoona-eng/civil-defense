import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import {
  APPLICANT_ROLE_LABELS,
  APPLICATION_STATUS_LABELS,
  ApplicantRole,
  ApplicationStatus,
  INSPECTION_OPINION_LABELS,
  InspectionOpinion,
  PAYMENT_STATE_LABELS,
  PROCESS_STEP_LABELS,
  PaymentState,
  ProcessStep,
  RETURN_STATE_LABELS,
  REVIEW_STATUS_LABELS,
  ReturnState,
  ReviewStatus,
} from '../../../Shared/Enums/enums';
import { formatDate, formatDateTime } from '../../../Shared/Helpers/date.helper';
import { iconByName, isImageFile, openFile } from '../../../Shared/Helpers/file.helper';
import { buildFileUrl } from '../../../Shared/Utils/file-url';

import { ArDigitsPipe } from '../../../Shared/Pipes/ar-digits.pipe';
import { TransactionCodePipe } from '../../../Shared/Pipes/transaction-code.pipe';
import { LicensingAttachment, LicensingProcessDetails } from '../../Models/licensing-process';
import { LicensingProcessService } from '../../Services/licensing-process.service';

type AttachmentKey =
  | 'entityLetters'
  | 'proofDocuments'
  | 'engineeringReports'
  | 'inspectionReports'
  | 'otherAttachments';

interface AttachmentGroup {
  title: string;
  files: LicensingAttachment[];
}

const ATTACHMENT_FIELDS: { key: AttachmentKey; label: string }[] = [
  { key: 'entityLetters', label: 'خطابات الجهة' },
  { key: 'proofDocuments', label: 'أوراق الثبوت' },
  { key: 'engineeringReports', label: 'التقارير الهندسية' },
  { key: 'inspectionReports', label: 'تقارير المعاينة' },
  { key: 'otherAttachments', label: 'مرفقات أخرى' },
];

@Component({
  selector: 'app-licensing-process-details',
  standalone: true,
  imports: [MatIconModule, ArDigitsPipe, TransactionCodePipe],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export class DetailsComponent implements OnChanges {
  @Input() processId: string | null = null;
  @Output() closed = new EventEmitter<void>();

  readonly formatDateTime = formatDateTime;
  readonly isImageFile = isImageFile;
  readonly openFile = openFile;
  readonly getFileUrl = buildFileUrl;
  readonly iconByName = iconByName;
  readonly formatDate = formatDate;

  details: LicensingProcessDetails | null = null;
  loading = false;
  errorMessage = '';

  failedImages = new Set<string>();

  constructor(private readonly licensingProcessService: LicensingProcessService) {}

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
      next: (response) => {
        this.loading = false;

        if (!response.isSuccess || !response.data) {
          this.errorMessage = response.message || 'تعذر تحميل بيانات المعاملة';
          return;
        }

        this.details = response.data;
      },
      error: (err) => {
        this.loading = false;
        console.error('LicensingProcess GET BY ID error:', err);
        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل بيانات المعاملة';
      },
    });
  }

  close(): void {
    this.closed.emit();
  }

  // ---------- Attachments ----------
  getAttachmentGroups(details: LicensingProcessDetails): AttachmentGroup[] {
    return ATTACHMENT_FIELDS.map(({ key, label }) => ({
      title: label,
      files: details[key] || [],
    }));
  }

  hasAnyAttachments(details: LicensingProcessDetails): boolean {
    return this.getAttachmentGroups(details).some((group) => group.files.length > 0);
  }

  hasImageError(filePath: string): boolean {
    return this.failedImages.has(filePath);
  }

  onImageError(filePath: string): void {
    this.failedImages.add(filePath);
  }

  // ---------- Labels ----------
  getStepLabel(step: string | null | undefined): string {
    return PROCESS_STEP_LABELS[step as ProcessStep] || step || '-';
  }

  getRoleLabel(role: string | null | undefined): string {
    return APPLICANT_ROLE_LABELS[role as ApplicantRole] || role || '-';
  }

  getReturnLabel(isReturned: boolean): string {
    return RETURN_STATE_LABELS[isReturned ? ReturnState.Returned : ReturnState.NotReturned];
  }

  getOpinionLabel(opinion: string | null | undefined): string {
    return opinion ? INSPECTION_OPINION_LABELS[opinion as InspectionOpinion] || opinion : '-';
  }

  getFinalStatusLabel(status: string | null | undefined): string {
    return status ? APPLICATION_STATUS_LABELS[status as ApplicationStatus] || status : '-';
  }

  getReviewStatusLabel(status: string | null | undefined): string {
    return status ? REVIEW_STATUS_LABELS[status as ReviewStatus] || status : '-';
  }

  getPaymentLabel(isPaid: boolean): string {
    return PAYMENT_STATE_LABELS[isPaid ? PaymentState.Paid : PaymentState.NotPaid];
  }
}
