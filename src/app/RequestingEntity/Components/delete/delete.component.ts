import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiResponse, RequestingEntity } from '../../Models/requesting-entity';
import { RequestingEntityService } from '../../Services/requesting-entity.service';
import { SITE_TRANSLATIONS, SiteTranslationPipe } from '../../../Shared/Enums/site-translations';

@Component({
  selector: 'app-requesting-entity-delete',
  standalone: true,
  imports: [CommonModule, SiteTranslationPipe],
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.scss'
})
export class DeleteComponent {
  @Input() requestingEntity: RequestingEntity | null = null;

  @Output() deleted = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  deleting = false;
  errorMessage = '';

  constructor(private readonly requestingEntityService: RequestingEntityService) {}

  confirmDelete(): void {
    if (!this.requestingEntity?.id) {
      this.errorMessage = SITE_TRANSLATIONS['entity.notSelected'];
      return;
    }

    this.deleting = true;
    this.errorMessage = '';

    this.requestingEntityService.delete(this.requestingEntity.id).subscribe({
      next: (res: ApiResponse<boolean>) => {
        this.deleting = false;

        if (!res.isSuccess) {
          this.errorMessage = res.message || SITE_TRANSLATIONS['entity.deleteFailed'];
          return;
        }

        this.deleted.emit();
      },
      error: err => {
        this.deleting = false;
        console.error('RequestingEntity DELETE error:', err);

        this.errorMessage =
          err?.error?.message ||
          err?.error?.Message ||
          err?.message ||
          SITE_TRANSLATIONS['entity.deleteError'];
      }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}