import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { AppIconComponent } from '../../../Shared/Components/app-icon/app-icon.component';
import { formatDate } from '../../../Shared/Helpers/date.helper';
import { NewLicenseListItem } from '../../Models/new-license';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    AppIconComponent,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent {
  readonly formatDate = formatDate;

  @Input() items: NewLicenseListItem[] = [];
  @Input() isLoading = false;
  @Input() isMovingAll = false;
  @Input() errorMessage = '';

  @Input() pageNumber = 1;
  @Input() pageSize = 10;
  @Input() totalCount = 0;

  @Output() pageChanged = new EventEmitter<PageEvent>();
  @Output() detailsRequested = new EventEmitter<NewLicenseListItem>();
  @Output() editRequested = new EventEmitter<NewLicenseListItem>();
  @Output() moveToNextStepRequested = new EventEmitter<NewLicenseListItem>();
  @Output() moveAllToNextStepRequested = new EventEmitter<void>();
  @Output() deleteRequested = new EventEmitter<NewLicenseListItem>();

  displayedColumns: string[] = [
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

  onPageChange(event: PageEvent): void {
    this.pageChanged.emit(event);
  }

  onDetails(item: NewLicenseListItem): void {
    this.detailsRequested.emit(item);
  }

  onEdit(item: NewLicenseListItem): void {
    this.editRequested.emit(item);
  }

  onMoveToNextStep(item: NewLicenseListItem): void {
    this.moveToNextStepRequested.emit(item);
  }

  onMoveAllToNextStep(): void {
    this.moveAllToNextStepRequested.emit();
  }

  onDelete(item: NewLicenseListItem): void {
    this.deleteRequested.emit(item);
  }
}
