import { Component, Input, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ArchivedService } from '../../Services/archived.service';
import { ArchivedDetails } from '../../Models/archived';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [DatePipe],
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
          this.errorMessage = res.message || 'تعذر تحميل التفاصيل';
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
          'حدث خطأ أثناء تحميل التفاصيل';
      },
    });
  }
  getOpinionLabel(opinion: string): string {
    const map: Record<string, string> = {
      Compliant: 'مستوفي',
      NonCompliant: 'غير مستوفي',
    };
    return map[opinion] ?? opinion;
  }

  getFinalStatusLabel(status: string): string {
    const map: Record<string, string> = {
      Waiting: 'انتظار',
      Closed: 'مغلق',
      Completed: 'مكتمل',
    };
    return map[status] ?? status;
  }

  getApplicantRoleLabel(role: string): string {
    const map: Record<string, string> = {
      Owner: 'مالك',
      Agent: 'توكيل',
    };
    return map[role] ?? role;
  }

  getReviewStatusLabel(status: string): string {
    const map: Record<string, string> = {
      Accepted: 'مقبول',
      Rejected: 'مرفوض',
    };
    return map[status] ?? status;
  }

  getStepLabel(step: string): string {
    const map: Record<string, string> = {
      NewLicense: 'طلب جديد',
      Inspection: 'معاينة',
      FinalApproval: 'موافقة نهائية',
      Archive: 'أرشيف',
    };
    return map[step] ?? step;
  }
}
