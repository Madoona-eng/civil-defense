import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { DistrictService } from '../../District/Services/district.service';
import { StepCount } from '../../LicensingProcess/Models/licensing-process';
import { LicensingProcessService } from '../../LicensingProcess/Services/licensing-process.service';
import { AppIconComponent } from '../../Shared/Components/app-icon/app-icon.component';
import { PROCESS_STEP_LABELS, ProcessStep } from '../../Shared/Enums/enums';
import { formatDateForApi } from '../../Shared/Helpers/date.helper';
import { AppIconName } from '../../Shared/Icons/app-icons';
import { LookupItem } from '../../Shared/Models/LookupItem';

type RangeKey = 'all' | 'today' | 'month' | 'custom';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    FormsModule,
    AppIconComponent,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  readonly stepLabels = PROCESS_STEP_LABELS;

  readonly stepIcons: Record<ProcessStep, AppIconName> = {
    [ProcessStep.NewLicense]: 'ClipboardList',
    [ProcessStep.Inspection]: 'ClipboardCheck',
    [ProcessStep.FinalApproval]: 'ShieldCheck',
    [ProcessStep.Archive]: 'Archive',
  };

  readonly ranges: { key: 'all' | 'today' | 'month'; label: string }[] = [
    { key: 'all', label: 'الكل' },
    { key: 'today', label: 'اليوم' },
    { key: 'month', label: 'هذا الشهر' },
  ];

  // نبدأ بأصفار عشان الكروت ماتقفزش وقت التحميل
  steps: StepCount[] = Object.values(ProcessStep).map((step) => ({ step, count: 0 }));
  districts: LookupItem[] = [];

  isLoading = false;
  errorMessage = '';

  districtId = '';
  activeRange: RangeKey = 'all';
  dateFrom: Date | null = null;
  dateTo: Date | null = null;

  constructor(
    private readonly licensingProcessService: LicensingProcessService,
    private readonly districtService: DistrictService,
  ) {}

  ngOnInit(): void {
    this.loadDistricts();
    this.loadSummary();
  }

  loadDistricts(): void {
    this.districtService.getAll().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.districts = res.data || [];
        }
      },
      error: (err) => console.error('Dashboard districts error:', err),
    });
  }

  loadSummary(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.licensingProcessService
      .getDashboardSummary({
        districtId: this.districtId || undefined,
        dateFrom: formatDateForApi(this.dateFrom),
        dateTo: formatDateForApi(this.dateTo),
      })
      .subscribe({
        next: (res) => {
          this.isLoading = false;

          if (!res.isSuccess || !res.data) {
            this.errorMessage = res.message || 'تعذر تحميل الإحصائيات';
            return;
          }

          this.steps = res.data;
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage =
            err?.error?.message || err?.message || 'حدث خطأ أثناء تحميل الإحصائيات';
          console.error('Dashboard summary error:', err);
        },
      });
  }

  setRange(range: 'all' | 'today' | 'month'): void {
    this.activeRange = range;
    const today = new Date();

    if (range === 'all') {
      this.dateFrom = null;
      this.dateTo = null;
    } else if (range === 'today') {
      this.dateFrom = today;
      this.dateTo = today;
    } else {
      this.dateFrom = new Date(today.getFullYear(), today.getMonth(), 1);
      this.dateTo = today;
    }

    this.loadSummary();
  }

  onCustomDateChange(): void {
    this.activeRange = 'custom';
    this.loadSummary();
  }
}
