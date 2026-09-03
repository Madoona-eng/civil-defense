import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivityType } from '../../Models/activity-type';
import { ActivityTypeService } from '../../Services/activity-type.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule,   MatIconModule, MatMenuModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  @Output() editRequested = new EventEmitter<string>();
  @Output() deleteRequested = new EventEmitter<ActivityType>();

  activityTypes: ActivityType[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private readonly activityTypeService: ActivityTypeService) {}

  ngOnInit(): void {
    this.loadActivityTypes();
  }

  loadActivityTypes(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.activityTypeService.getAll().subscribe({
      next: response => {
        this.isLoading = false;

        if (!response.isSuccess) {
          this.errorMessage = response.message || 'تعذر تحميل أنواع النشاط';
          return;
        }

        this.activityTypes = response.data || [];
      },
      error: err => {
        this.isLoading = false;
        console.error('ActivityType GET error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل أنواع النشاط';
      }
    });
  }

  requestEdit(id: string): void {
    this.editRequested.emit(id);
  }

  requestDelete(item: ActivityType): void {
    this.deleteRequested.emit(item);
  }
}