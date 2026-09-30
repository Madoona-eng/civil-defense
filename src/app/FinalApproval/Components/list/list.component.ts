import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {
  ApiResponse,
  FinalApprovalItem,
  FinalApprovalQuery,
  LookupItem,
  PagedResult
} from '../../Models/final-approval';

import { FinalApprovalService } from '../../Services/final-approval.service';

import { RequestingEntityService } from '../../../RequestingEntity/Services/requesting-entity.service';
import { DistrictService } from '../../../District/Services/district.service';
import { ActivityTypeService } from '../../../ActivityType/Services/activity-type.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ConfirmDialogComponent } from '../../../Shared/Components/confirm-dialog/confirm-dialog.component';
import { SITE_TRANSLATIONS, SiteTranslationPipe, translateSiteText } from '../../../Shared/Enums/site-translations';

@Component({
  selector: 'app-final-approval-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SiteTranslationPipe, MatIconModule, MatMenuModule, MatDialogModule, MatSnackBarModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  @Output() detailsRequested = new EventEmitter<string>();
  @Output() editRequested = new EventEmitter<FinalApprovalItem>();
  @Output() deleteRequested = new EventEmitter<FinalApprovalItem>();
  @Output() returnRequested = new EventEmitter<FinalApprovalItem>();

  items: FinalApprovalItem[] = [];

  requestingEntities: LookupItem[] = [];
  districts: LookupItem[] = [];
  activityTypes: LookupItem[] = [];

  isLoading = false;
  loadingLookups = false;
  errorMessage = '';

  districtId = '';
  requestingEntityId = '';
  activityTypeId = '';
  opinion = '';
  searchTerm = '';

  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  hasNextPage = false;
  hasPreviousPage = false;
  archivingItemId: string | null = null;

  constructor(
    private readonly finalApprovalService: FinalApprovalService,
    private readonly requestingEntityService: RequestingEntityService,
    private readonly districtService: DistrictService,
    private readonly activityTypeService: ActivityTypeService,
    private readonly authService: AuthService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadLookups();
    this.loadFinalApprovals();
  }

  loadLookups(): void {
    this.loadingLookups = true;

    forkJoin({
      requestingEntities: this.requestingEntityService.getAll(),
      districts: this.districtService.getAll(),
      activityTypes: this.activityTypeService.getAll()
    }).subscribe({
      next: result => {
        this.loadingLookups = false;

        if (result.requestingEntities.isSuccess) {
          this.requestingEntities = result.requestingEntities.data || [];
        }

        if (result.districts.isSuccess) {
          this.districts = result.districts.data || [];
        }

        if (result.activityTypes.isSuccess) {
          this.activityTypes = result.activityTypes.data || [];
        }
      },
      error: err => {
        this.loadingLookups = false;
        console.error('Final approval lookups error:', err);
      }
    });
  }

  loadFinalApprovals(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const query: FinalApprovalQuery = {
      districtId: this.districtId,
      requestingEntityId: this.requestingEntityId,
      activityTypeId: this.activityTypeId,
      opinion: this.opinion,
      searchTerm: this.searchTerm.trim(),
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    };

    this.finalApprovalService.getAll(query).subscribe({
      next: (response: ApiResponse<PagedResult<FinalApprovalItem>>) => {
        this.isLoading = false;

        if (!response.isSuccess) {
          this.errorMessage = response.message || SITE_TRANSLATIONS['final.listLoadFailed'];
          return;
        }

        this.items = response.data.items || [];
        this.pageNumber = response.data.pageNumber;
        this.pageSize = response.data.pageSize;
        this.totalCount = response.data.totalCount;
        this.totalPages = response.data.totalPages;
        this.hasNextPage = response.data.hasNextPage;
        this.hasPreviousPage = response.data.hasPreviousPage;
      },
      error: err => {
        this.isLoading = false;
        console.error('Final approval GET error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          SITE_TRANSLATIONS['final.listLoadError'];
      }
    });
  }

  search(): void {
    this.pageNumber = 1;
    this.loadFinalApprovals();
  }

  resetFilters(): void {
    this.districtId = '';
    this.requestingEntityId = '';
    this.activityTypeId = '';
    this.opinion = '';
    this.searchTerm = '';
    this.pageNumber = 1;
    this.loadFinalApprovals();
  }

  nextPage(): void {
    if (!this.hasNextPage) {
      return;
    }

    this.pageNumber++;
    this.loadFinalApprovals();
  }

  previousPage(): void {
    if (!this.hasPreviousPage) {
      return;
    }

    this.pageNumber--;
    this.loadFinalApprovals();
  }

  requestDetails(id: string): void {
    this.detailsRequested.emit(id);
  }

  requestEdit(item: FinalApprovalItem): void {
    this.editRequested.emit(item);
  }

  requestDelete(item: FinalApprovalItem): void {
    this.deleteRequested.emit(item);
  }

  requestReturn(item: FinalApprovalItem): void {
    this.returnRequested.emit(item);
  }

  get canManageFinalApproval(): boolean {
    const role = this.authService.getRole();
    return role === 'FinalApprover' || role === 'SuperAdmin';
  }

  moveToArchive(item: FinalApprovalItem): void {
    if (!this.canManageFinalApproval || !item.id || this.archivingItemId === item.id) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        message: translateSiteText('final.archivePrompt', {
          establishmentName: item.establishmentName,
        }),
        confirmText: SITE_TRANSLATIONS['final.moveArchive'],
        cancelText: SITE_TRANSLATIONS['common.cancel'],
        confirmClass: 'btn-save',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.archivingItemId = item.id;
      this.finalApprovalService.moveToArchive(item.id).subscribe({
        next: response => {
          this.archivingItemId = null;

          if (!response.isSuccess) {
            this.snackBar.open(
              response.message || SITE_TRANSLATIONS['final.archiveFailed'],
              SITE_TRANSLATIONS['common.close'],
              { duration: 3000 },
            );
            return;
          }

          this.snackBar.open(
            SITE_TRANSLATIONS['final.archived'],
            SITE_TRANSLATIONS['common.close'],
            { duration: 2500 },
          );
          this.loadFinalApprovals();
        },
        error: error => {
          this.archivingItemId = null;
          this.snackBar.open(
            error?.error?.message || error?.message || SITE_TRANSLATIONS['final.archiveError'],
            SITE_TRANSLATIONS['common.close'],
            { duration: 3000 },
          );
        },
      });
    });
  }

  getStepLabel(step: string): string {
    if (step === 'FinalApproval') {
      return SITE_TRANSLATIONS['step.finalApproval'];
    }

    if (step === 'Archive') {
      return SITE_TRANSLATIONS['step.archive'];
    }

    if (step === 'Inspection') {
      return SITE_TRANSLATIONS['step.inspection'];
    }

    if (step === 'NewLicense') {
      return SITE_TRANSLATIONS['step.newLicense'];
    }

    return step || '-';
  }
}