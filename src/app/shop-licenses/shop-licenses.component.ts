import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LicensingProcessService } from '../LicensingProcess/Services/licensing-process.service';
import { DetailsComponent } from '../LicensingProcess/Components/details/details.component';
import { EditComponent } from '../LicensingProcess/Components/edit/edit.component';
import { DeleteComponent } from '../LicensingProcess/Components/delete/delete.component';

@Component({
  selector: 'app-shop-licenses',
  standalone: true,
  imports: [CommonModule, FormsModule, DetailsComponent, EditComponent, DeleteComponent],
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

  activeDropdownId: string | null = null;

  // Popup states
  isDetailsPopupOpen = false;
  isEditPopupOpen = false;
  isDeletePopupOpen = false;
  selectedProcessId: string | null = null;
  selectedProcessItem: any = null;

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

        // طباعة أول عنصر بشكل منظم للتعرف على المسميات الحقيقية بالـ Console
        if (rawItems.length > 0) {
          console.log('=== Sample API Item Keys ===', Object.keys(rawItems[0]));
          console.dir(rawItems[0]);
        }

        this.items = rawItems.map((item: any) => {
          return {
            ...item,
            id: item.id || item.Id,
            transactionCode: this.getValue(item, ['transactionCode', 'code', 'Code', 'TransactionCode', 'requestNumber', 'licenseNumber']),
            submissionDate: this.getValue(item, ['createdDate', 'createdAt', 'creationDate', 'CreatedDate', 'requestDate', 'submissionDate', 'date']),

            // اسم المنشأة / المحل
            establishmentName: this.getValue(item, [
              'establishmentName', 'facilityName', 'shopName', 'name', 'title',
              'FacilityName', 'ShopName', 'facility.name', 'shop.name', 'establishment.name',
              'facility.title', 'shop.title'
            ]),

            // العنوان
            establishmentAddress: this.getValue(item, [
              'establishmentAddress', 'address', 'location', 'shopAddress',
              'Address', 'Location', 'facility.address', 'shop.address', 'establishment.address',
              'detailsAddress', 'fullAddress'
            ]),

            // الجهة
            requestingEntity: this.getValue(item, [
              'requestingEntity', 'requestingEntityName', 'entityName', 'entity',
              'requestingEntity.name', 'requestingEntity.title', 'entity.name', 'EntityName',
              'requestingEntityTitle', 'entityTitle'
            ]),

            // المركز / المنطقة
            district: this.getValue(item, [
              'district', 'districtName', 'centerName', 'regionName', 'center', 'region',
              'district.name', 'center.name', 'region.name', 'district.title', 'DistrictName',
              'districtTitle', 'centerTitle'
            ]),

            // نوع النشاط
            activityType: this.getValue(item, [
              'activityType', 'activityTypeName', 'activityType.name', 'activityType.title',
              'ActivityTypeName', 'activityTypeTitle', 'businessType', 'activity'
            ]),

            // مقدم الطلب
            applicantName: this.getValue(item, [
              'applicantName', 'createdByName', 'applicant', 'createdBy', 'ApplicantName',
              'applicant.name', 'applicant.fullName', 'ownerName', 'clientName'
            ]),

            currentStep: item.processStep ?? item.step ?? item.ProcessStep ?? item.Step ?? item.status ?? item.statusId ?? item.Status
          };
        });

        this.totalCount = responseData.totalCount || this.items.length;
        this.totalPages = responseData.totalPages || Math.ceil(this.totalCount / this.pageSize) || 1;

        this.updatePaginationState();
      },
      error: err => {
        this.isLoading = false;
        console.error('LicensingProcess GET error:', err);
        this.errorMessage = err?.error?.message || err?.message || 'حدث خطأ أثناء تحميل تراخيص المحال';
      }
    });
  }

  private getValue(obj: any, keys: string[]): string {
    if (!obj) return '---';

    for (const key of keys) {
      let val: any;

      if (key.includes('.')) {
        val = key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
      } else {
        val = obj[key];
      }

      // إذا كانت القيمة عبارة عن Object يحتوي على أسم أو عنوان
      if (val && typeof val === 'object') {
        val = val.name || val.title || val.arName || val.nameAr || val.enName || val.value || null;
      }

      if (val !== null && val !== undefined && String(val).trim() !== '' && String(val) !== 'null') {
        return String(val);
      }
    }
    return '---';
  }

  toggleDropdown(id: string, event: Event): void {
    event.stopPropagation();
    this.activeDropdownId = this.activeDropdownId === id ? null : id;
  }

  @HostListener('document:click')
  closeDropdowns(): void {
    this.activeDropdownId = null;
  }

  openDetailsPopup(id: string): void {
    this.selectedProcessId = id;
    this.isDetailsPopupOpen = true;
  }

  closeDetailsPopup(): void {
    this.isDetailsPopupOpen = false;
    this.selectedProcessId = null;
  }

  openEditPopup(id: string): void {
    this.selectedProcessId = id;
    this.isEditPopupOpen = true;
  }

  closeEditPopup(): void {
    this.isEditPopupOpen = false;
    this.selectedProcessId = null;
  }

  onEditSaved(): void {
    this.closeEditPopup();
    this.loadLicensingProcesses();
  }

  openDeletePopup(item: any): void {
    this.selectedProcessItem = item;
    this.isDeletePopupOpen = true;
  }

  closeDeletePopup(): void {
    this.isDeletePopupOpen = false;
    this.selectedProcessItem = null;
  }

  onDeleteDone(): void {
    this.closeDeletePopup();
    this.loadLicensingProcesses();
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
      'ARCHIVE': 'الأرشيف'
    };

    const stepKey = String(step).trim();
    return stepMap[stepKey] || this.processSteps.find(s => s.value === stepKey)?.label || stepKey;
  }

  requestDetails(id: string): void {
    this.activeDropdownId = null;
    this.openDetailsPopup(id);
  }

  requestEdit(id: string): void {
    this.activeDropdownId = null;
    this.openEditPopup(id);
  }

  requestDelete(item: any): void {
    this.activeDropdownId = null;
    this.openDeletePopup(item);
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