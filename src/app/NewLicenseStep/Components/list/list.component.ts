import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LucideAngularModule, EllipsisVertical, Eye, Pencil, CircleArrowLeft, Trash2, ChevronsLeft } from 'lucide-angular';
import { NewLicenseListItem } from '../../Models/new-license';
import { SiteTranslationPipe } from '../../../Shared/Enums/site-translations';

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
    LucideAngularModule,
    SiteTranslationPipe,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent {
  readonly EllipsisVertical = EllipsisVertical;
  readonly Eye = Eye;
  readonly Pencil = Pencil;
  readonly CircleArrowLeft = CircleArrowLeft;
  readonly Trash2 = Trash2;
  readonly ChevronsLeft = ChevronsLeft;

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
    'actions'
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