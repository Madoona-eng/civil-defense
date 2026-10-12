import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AppIconComponent } from '../../../Shared/Components/app-icon/app-icon.component';
import { PROCESS_STEP_LABELS, ProcessStep } from '../../../Shared/Enums/enums';
import { formatDateTime } from '../../../Shared/Helpers/date.helper';
import { TransactionCodePipe } from '../../../Shared/Pipes/transaction-code.pipe';
import { DeletedProcessItem } from '../../Models/licensing-process';

@Component({
  selector: 'app-licensing-process-deleted-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatTooltipModule,
    AppIconComponent,
    TransactionCodePipe,
  ],
  templateUrl: './deleted-list.component.html',
  styleUrl: './deleted-list.component.scss',
})
export class DeletedListComponent {
  @Input() items: DeletedProcessItem[] = [];
  @Input() isLoading = false;
  @Input() errorMessage = '';
  @Input() pageNumber = 1;
  @Input() pageSize = 10;
  @Input() totalCount = 0;

  @Output() pageChanged = new EventEmitter<PageEvent>();
  @Output() restoreRequested = new EventEmitter<DeletedProcessItem>();

  readonly formatDateTime = formatDateTime;

  readonly displayedColumns = [
    'transactionCode',
    'establishmentName',
    'requestingEntity',
    'district',
    'applicantName',
    'currentStep',
    'deletedAt',
    'deletedBy',
    'actions',
  ];

  getStepLabel(step: ProcessStep): string {
    return PROCESS_STEP_LABELS[step] ?? step;
  }
}