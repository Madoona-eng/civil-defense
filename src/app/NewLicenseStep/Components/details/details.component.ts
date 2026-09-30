import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { APPLICANT_ROLE_LABELS, ApplicantRole } from '../../../Shared/Enums/enums';
import { ApiResponse } from '../../../Shared/Models/ApiResponse';
import { AttachmentGroup, NewLicenseDetails } from '../../Models/new-license';
import { NewLicenseService } from '../../Services/new-license.service';

export interface DetailsDialogData {
  id: string;
}

@Component({
  selector: 'app-new-license-details',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export class DetailsComponent implements OnInit {
  details: NewLicenseDetails | null = null;

  loading = false;
  errorMessage = '';
  failedImages = new Set<string>();

  constructor(
    private readonly newLicenseService: NewLicenseService,
    private readonly dialogRef: MatDialogRef<DetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DetailsDialogData,
  ) {}

  ngOnInit(): void {
    this.loadDetails(this.data.id);
  }

  loadDetails(id: string): void {
    this.loading = true;
    this.errorMessage = '';
    this.details = null;
    this.failedImages.clear();

    this.newLicenseService.getById(id).subscribe({
      next: (response: ApiResponse<NewLicenseDetails>) => {
        this.loading = false;

        if (!response.isSuccess || !response.data) {
          this.errorMessage = response.message || 'تعذر تحميل تفاصيل المعاملة';
          return;
        }

        this.details = response.data;
      },
      error: (err) => {
        this.loading = false;
        console.error('NewLicense details GET error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل تفاصيل المعاملة';
      },
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  getFileUrl(filePath: string): string {
    return this.newLicenseService.buildFileUrl(filePath);
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

  openFile(filePath: string): void {
    window.open(this.getFileUrl(filePath), '_blank');
  }

  getAttachmentGroups(details: NewLicenseDetails): AttachmentGroup[] {
    return [
      { title: 'خطابات الجهة', files: details.entityLetters || [] },
      { title: 'مستندات الإثبات', files: details.proofDocuments || [] },
      { title: 'التقارير الهندسية', files: details.engineeringReports || [] },
      { title: 'مرفقات أخرى', files: details.otherAttachments || [] },
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

  getApplicantRoleLabel(role: string): string {
    return APPLICANT_ROLE_LABELS[role as ApplicantRole] ?? role;
  }
}
