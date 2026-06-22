import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RequestingEntity } from '../../Models/requesting-entity';
import { RequestingEntityService } from '../../Services/requesting-entity.service';

@Component({
  selector: 'app-requesting-entity-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  @Output() editRequested = new EventEmitter<string>();
  @Output() deleteRequested = new EventEmitter<RequestingEntity>();

  requestingEntities: RequestingEntity[] = [];

  isLoading = false;
  errorMessage = '';

  constructor(private readonly requestingEntityService: RequestingEntityService) {}

  ngOnInit(): void {
    this.loadRequestingEntities();
  }

  loadRequestingEntities(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.requestingEntityService.getAll().subscribe({
      next: response => {
        this.isLoading = false;

        if (!response.isSuccess) {
          this.errorMessage = response.message || 'تعذر تحميل الجهات';
          return;
        }

        this.requestingEntities = response.data || [];
      },
      error: err => {
        this.isLoading = false;
        console.error('RequestingEntity GET error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          'حدث خطأ أثناء تحميل الجهات';
      }
    });
  }

  requestEdit(id: string): void {
    this.editRequested.emit(id);
  }

  requestDelete(item: RequestingEntity): void {
    this.deleteRequested.emit(item);
  }
}