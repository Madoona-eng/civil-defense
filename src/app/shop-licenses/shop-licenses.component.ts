import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LicensingProcessService } from '../LicensingProcess/Services/licensing-process.service';
import { DetailsComponent } from '../LicensingProcess/Components/details/details.component';
import { EditComponent } from '../LicensingProcess/Components/edit/edit.component';
import { DeleteComponent } from '../LicensingProcess/Components/delete/delete.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../Shared/Components/confirm-dialog/confirm-dialog.component';
import { SITE_TRANSLATIONS, SiteTranslationPipe, translateSiteText } from '../Shared/Enums/site-translations';
import { AuthService } from '../auth/services/auth.service';
import { NewLicenseService } from '../NewLicenseStep/Services/new-license.service';

@Component({
  selector: 'app-shop-licenses',
  standalone: true,
  imports: [CommonModule, FormsModule, DetailsComponent, EditComponent, DeleteComponent, SiteTranslationPipe, MatDialogModule, MatSnackBarModule],
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
    { label: SITE_TRANSLATIONS['shop.allStages'], value: '' },
    { label: SITE_TRANSLATIONS['shop.application'], value: 'APPLICATION' },
    { label: SITE_TRANSLATIONS['shop.inspection'], value: 'INSPECTION' },
    { label: SITE_TRANSLATIONS['shop.finalApproval'], value: 'FINAL_APPROVAL' },
    { label: SITE_TRANSLATIONS['shop.archive'], value: 'ARCHIVE' }
  ];

  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 1;
  hasPreviousPage = false;
  hasNextPage = false;
  movingToInspectionId: string | null = null;

  constructor(
    private readonly licensingProcessService: LicensingProcessService,
    private readonly newLicenseService: NewLicenseService,
    private readonly authService: AuthService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
  ) {}

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
          this.errorMessage = response.message || SITE_TRANSLATIONS['shop.loadFailed'];
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
        this.errorMessage = err?.error?.message || err?.message || SITE_TRANSLATIONS['shop.loadError'];
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
      return SITE_TRANSLATIONS['common.unavailable'];
    }

    const stepMap: { [key: string]: string } = {
      '0': SITE_TRANSLATIONS['shop.application'],
      '1': SITE_TRANSLATIONS['step.inspection'],
      '2': SITE_TRANSLATIONS['step.finalApproval'],
      '3': SITE_TRANSLATIONS['step.archive'],
      '4': SITE_TRANSLATIONS['shop.complete'],
      'APPLICATION': SITE_TRANSLATIONS['shop.application'],
      'INSPECTION': SITE_TRANSLATIONS['step.inspection'],
      'FINAL_APPROVAL': SITE_TRANSLATIONS['step.finalApproval'],
      'ARCHIVE': SITE_TRANSLATIONS['step.archive']
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

  get canMoveToInspection(): boolean {
    const role = this.authService.getRole();
    return role === 'DataEntry' || role === 'SuperAdmin';
  }

  isNewLicenseStep(step: unknown): boolean {
    if (step === null || step === undefined || String(step).trim() === '') return false;

    const normalizedStep = String(step).trim().toLowerCase().replace(/[\s_-]/g, '');
    return normalizedStep === '0' || normalizedStep === 'newlicense' || normalizedStep === 'application';
  }

  moveToInspection(item: any): void {
    this.activeDropdownId = null;
    if (
      !this.canMoveToInspection ||
      !item?.id ||
      !this.isNewLicenseStep(item.currentStep) ||
      this.movingToInspectionId === item.id
    ) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        message: translateSiteText('newLicense.movePrompt', {
          establishmentName: item.establishmentName,
        }),
        confirmText: SITE_TRANSLATIONS['newLicense.confirmMove'],
        cancelText: SITE_TRANSLATIONS['common.cancel'],
        confirmClass: 'btn-save',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.movingToInspectionId = item.id;
      this.newLicenseService.moveToInspection(item.id).subscribe({
        next: response => {
          this.movingToInspectionId = null;

          if (!response.isSuccess) {
            this.snackBar.open(
              response.message || SITE_TRANSLATIONS['newLicense.moveFailed'],
              SITE_TRANSLATIONS['common.close'],
              { duration: 3000 },
            );
            return;
          }

          this.snackBar.open(
            SITE_TRANSLATIONS['newLicense.moved'],
            SITE_TRANSLATIONS['common.close'],
            { duration: 2500 },
          );
          this.loadLicensingProcesses();
        },
        error: error => {
          this.movingToInspectionId = null;
          this.snackBar.open(
            error?.error?.message || error?.message || SITE_TRANSLATIONS['newLicense.moveError'],
            SITE_TRANSLATIONS['common.close'],
            { duration: 3000 },
          );
        },
      });
    });
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