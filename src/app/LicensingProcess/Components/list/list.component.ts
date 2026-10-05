import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { Eye, EllipsisVertical, LucideAngularModule, Pencil, Trash2 } from 'lucide-angular';

import {
  PROCESS_STEP_LABELS,
  ProcessStep,
  RETURN_STATE_LABELS,
  ReturnState,
} from '../../../Shared/Enums/enums';
import { LicensingProcessItem } from '../../Models/licensing-process';

@Component({
  selector: 'app-licensing-process-list',
  standalone: true,
  imports: [
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
  @Input() items: LicensingProcessItem[] = [];
  @Input() isLoading = false;
  @Input() errorMessage = '';
  @Input() pageNumber = 1;
  @Input() pageSize = 10;
  @Input() totalCount = 0;

  @Output() pageChanged = new EventEmitter<PageEvent>();
  @Output() detailsRequested = new EventEmitter<string>();
  @Output() editRequested = new EventEmitter<string>();
  @Output() deleteRequested = new EventEmitter<LicensingProcessItem>();

  readonly displayedColumns: string[] = [
    'transactionCode',
    'submissionDate',
    'establishmentName',
    'establishmentAddress',
    'requestingEntity',
    'district',
    'activityType',
    'applicantName',
    'currentStep',
    'isReturned',
    'actions',
  ];

  readonly EllipsisVertical = EllipsisVertical;
  readonly Eye = Eye;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;

  getStepLabel(step: string): string {
    return PROCESS_STEP_LABELS[step as ProcessStep] ?? step;
  }

  getReturnStateLabel(isReturned: boolean): string {
    return RETURN_STATE_LABELS[isReturned ? ReturnState.Returned : ReturnState.NotReturned];
  }

  onPageChange(event: PageEvent): void {
    this.pageChanged.emit(event);
  }

  requestDetails(item: LicensingProcessItem): void {
    this.detailsRequested.emit(item.id);
  }

  requestEdit(item: LicensingProcessItem): void {
    this.editRequested.emit(item.id);
  }

  requestDelete(item: LicensingProcessItem): void {
    this.deleteRequested.emit(item);
  }
}