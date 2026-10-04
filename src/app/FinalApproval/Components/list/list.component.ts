import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import {
  Archive,
  EllipsisVertical,
  FileCheck,
  LucideAngularModule,
  RotateCcw,
  Trash2,
} from 'lucide-angular';

import { AuthService } from '../../../auth/services/auth.service';
import { RETURN_STATE_LABELS, ReturnState } from '../../../Shared/Enums/enums';
import { FinalApprovalItem } from '../../Models/final-approval';

@Component({
  selector: 'app-final-approval-list',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    MatButtonModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent {
  @Input() items: FinalApprovalItem[] = [];
  @Input() isLoading = false;
  @Input() errorMessage = '';
  @Input() pageNumber = 1;
  @Input() pageSize = 10;
  @Input() totalCount = 0;
  @Input() archivingItemId: string | null = null;

  @Output() pageChanged = new EventEmitter<PageEvent>();
  @Output() editRequested = new EventEmitter<FinalApprovalItem>();
  @Output() deleteRequested = new EventEmitter<FinalApprovalItem>();
  @Output() returnRequested = new EventEmitter<FinalApprovalItem>();
  @Output() archiveRequested = new EventEmitter<FinalApprovalItem>();

  readonly displayedColumns: string[] = [
    'transactionCode',
    'submissionDate',
    'establishmentName',
    'establishmentAddress',
    'requestingEntity',
    'district',
    'activityType',
    'applicantName',
    'actions',
  ];

  readonly EllipsisVertical = EllipsisVertical;
  readonly FileCheck = FileCheck;
  readonly RotateCcw = RotateCcw;
  readonly Archive = Archive;
  readonly Trash2 = Trash2;

  constructor(private readonly authService: AuthService) {}

  get canManageFinalApproval(): boolean {
    const role = this.authService.getRole();
    return role === 'FinalApprover' || role === 'SuperAdmin';
  }

  getReturnStateLabel(isReturned: boolean): string {
    return RETURN_STATE_LABELS[isReturned ? ReturnState.Returned : ReturnState.NotReturned];
  }

  onPageChange(event: PageEvent): void {
    this.pageChanged.emit(event);
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

  requestArchive(item: FinalApprovalItem): void {
    this.archiveRequested.emit(item);
  }
}
