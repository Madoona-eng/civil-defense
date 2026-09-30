import { Component, Input, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ArchivedService } from '../../Services/archived.service';
import { ArchivedDetails } from '../../Models/archived';
import { APPLICATION_STATUS_LABELS, APPLICANT_ROLE_LABELS, INSPECTION_OPINION_LABELS, PROCESS_STEP_LABELS, REVIEW_STATUS_LABELS } from '../../../Shared/Enums/enums';
import { SITE_TRANSLATIONS, SiteTranslationPipe } from '../../../Shared/Enums/site-translations';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [DatePipe, SiteTranslationPipe],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export class DetailsComponent implements OnInit {
  @Input() id!: string;

  details: ArchivedDetails | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(private readonly archivedService: ArchivedService) {}

  ngOnInit(): void {
    this.loadDetails();
  }

  loadDetails(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.archivedService.getById(this.id).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (!res.isSuccess) {
          this.errorMessage = res.message || SITE_TRANSLATIONS['archive.loadFailed'];
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
          SITE_TRANSLATIONS['archive.loadError'];
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
      ? SITE_TRANSLATIONS['applicant.proxy']
      : APPLICANT_ROLE_LABELS[role as keyof typeof APPLICANT_ROLE_LABELS] ?? role;
  }

  getReviewStatusLabel(status: string): string {
    return REVIEW_STATUS_LABELS[status as keyof typeof REVIEW_STATUS_LABELS] ?? status;
  }

  getStepLabel(step: string): string {
    return PROCESS_STEP_LABELS[step as keyof typeof PROCESS_STEP_LABELS] ?? step;
  }
}
