import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RequestingEntity } from '../../Models/requesting-entity';
import { RequestingEntityService } from '../../Services/requesting-entity.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '../../../Shared/Components/translate.pipe';


@Component({
  selector: 'app-requesting-entity-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatMenuModule, MatButtonModule, MatProgressSpinnerModule, TranslatePipe],
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
          this.errorMessage = response.message || 'entity.listLoadFailed';
          return;
        }

        this.requestingEntities = response.data || [];
      },
      error: err => {
        this.isLoading = false;
        console.error('RequestingEntity GET error:', err);

        const message =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message;
        this.errorMessage = typeof message === 'string' ? message : 'entity.listLoadError';
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