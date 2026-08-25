import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LicensingProcessService } from '../LicensingProcess/Services/licensing-process.service';

@Component({
  selector: 'app-licensing-process-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shop-licenses.component.html',
  styleUrl: './shop-licenses.component.scss'
})
export class ShopLicensesComponent implements OnInit {
  @Output() editRequested = new EventEmitter<string>();
  @Output() deleteRequested = new EventEmitter<any>();
  @Output() detailsRequested = new EventEmitter<string>();

  items: any[] = [];
  isLoading = false;
  errorMessage = '';

  // Filter & Pagination
  searchTerm = '';
  processStep = '';
  processSteps = [
    { label: 'كل المراحل', value: '' },
    { label: 'تقديم الطلب', value: 'APPLICATION' },
    { label: 'المعاينة', value: 'INSPECTION' },
    { label: 'الموافقة النهائية', value: 'FINAL_APPROVAL' },
    { label: 'الأرشيف', value: 'ARCHIVE' }
  ];

  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 1;
  hasPreviousPage = false;
  hasNextPage = false;

  constructor(private readonly licensingProcessService: LicensingProcessService) {}

  ngOnInit(): void {
    this.loadLicensingProcesses();
  }

  loadLicensingProcesses(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const queryParams = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm || undefined,
      processStep: this.processStep || undefined
    };

    this.licensingProcessService.getAll(queryParams).subscribe({
      next: response => {
        this.isLoading = false;

        if (response && response.isSuccess === false) {
          this.errorMessage = response.message || 'تعذر تحميل تراخيص المحال';
          return;
        }

        const responseData = response.data || response;
        const rawItems = responseData.items || responseData || [];

        if (rawItems.length > 0) {
          console.log('=== API Raw Item ===', rawItems[0]);
        }

        this.items = rawItems.map((item: any) => ({
          ...item,
          id: item.id || item.Id,
          transactionCode: this.getValue(item, ['transactionCode', 'code', 'Code', 'TransactionCode']),
          submissionDate: this.getValue(item, ['createdDate', 'createdAt', 'creationDate', 'CreatedDate', 'requestDate', 'submissionDate']),
          shopName: this.getValue(item, [
            'shopName', 'facilityName', 'name', 'ShopName', 'FacilityName', 
            'facility.name', 'shop.name', 'facilityDetails.name', 'shopDetails.name'
          ]),
          shopAddress: this.getValue(item, [
            'address', 'location', 'shopAddress', 'Address', 'Location', 
            'facility.address', 'shop.address', 'addressDetails', 'locationDescription'
          ]),
          entityName: this.getValue(item, [
            'requestingEntityName', 'entityName', 'requestingEntity.name', 
            'entity.name', 'EntityName', 'requestingEntity.title', 'entity.title'
          ]),
          districtName: this.getValue(item, [
            'districtName', 'centerName', 'regionName', 'district.name', 
            'center.name', 'region.name', 'DistrictName', 'district.title'
          ]),
          activityTypeName: this.getValue(item, [
            'activityTypeName', 'activityType.name', 'activityType', 
            'ActivityTypeName', 'activityType.title'
          ]),
          applicantName: this.getValue(item, [
            'applicantName', 'createdByName', 'applicant', 
            'ApplicantName', 'applicant.name', 'createdBy'
          ]),
          currentStep: item.processStep ?? item.step ?? item.ProcessStep ?? item.Step ?? item.status ?? item.statusId ?? item.Status
        }));

        this.totalCount = responseData.totalCount || this.items.length;
        this.totalPages = responseData.totalPages || Math.ceil(this.totalCount / this.pageSize) || 1;

        this.updatePaginationState();
      },
      error: err => {
        this.isLoading = false;
        console.error('LicensingProcess GET error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل تراخيص المحال';
      }
    });
  }

  private getValue(obj: any, keys: string[]): string {
    for (const key of keys) {
      const val = key.includes('.') 
        ? key.split('.').reduce((o, i) => o?.[i], obj) 
        : obj?.[key];

      if (val !== null && val !== undefined && val !== '') {
        return val;
      }
    }
    return '---';
  }

  search(): void {
    this.pageNumber = 1;
    this.loadLicensingProcesses();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.processStep = '';
    this.search();
  }

  getStepLabel(step: any): string {
    if (step === null || step === undefined || step === '') {
      return 'غير محدد';
    }

    const stepMap: { [key: string]: string } = {
      '0': 'تقديم الطلب',
      '1': 'المعاينة',
      '2': 'الموافقة النهائية',
      '3': 'الأرشيف',
      '4': 'مكتمل',
      'APPLICATION': 'تقديم الطلب',
      'INSPECTION': 'المعاينة',
      'FINAL_APPROVAL': 'الموافقة النهائية',
      'ARCHIVE': 'الأرشيف',
      'Application': 'تقديم الطلب',
      'Inspection': 'المعاينة',
      'FinalApproval': 'الموافقة النهائية',
      'Archive': 'الأرشيف'
    };

    const stepKey = String(step).trim();
    return stepMap[stepKey] || this.processSteps.find(s => s.value === stepKey)?.label || stepKey;
  }

  requestDetails(id: string): void {
    this.detailsRequested.emit(id);
  }

  requestEdit(id: string): void {
    this.editRequested.emit(id);
  }

  requestDelete(item: any): void {
    this.deleteRequested.emit(item);
  }

  previousPage(): void {
    if (this.hasPreviousPage) {
      this.pageNumber--;
      this.loadLicensingProcesses();
    }
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.pageNumber++;
      this.loadLicensingProcesses();
    }
  }

  private updatePaginationState(): void {
    this.hasPreviousPage = this.pageNumber > 1;
    this.hasNextPage = this.pageNumber < this.totalPages;
  }
}