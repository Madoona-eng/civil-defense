import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RequestingEntity } from '../../Models/requesting-entity';
import { RequestingEntityService } from '../../Services/requesting-entity.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../Shared/Components/confirm-dialog/confirm-dialog.component';
import { TranslatePipe } from '../../../Shared/Components/translate.pipe';


@Component({
  selector: 'app-requesting-entity-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    TranslatePipe
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  @Output() editRequested = new EventEmitter<string>();

  requestingEntities: RequestingEntity[] = [];

  private readonly deletingEntityIds = new Set<string>();
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly requestingEntityService: RequestingEntityService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar
  ) {}

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
    if (!item.id || this.deletingEntityIds.has(item.id)) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        message: `هل أنت متأكد من حذف الجهة "${item.name}"؟`,
        confirmText: 'حذف',
        cancelText: 'إلغاء',
        confirmClass: 'btn-danger'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed || this.deletingEntityIds.has(item.id)) return;

      this.deletingEntityIds.add(item.id);
      this.requestingEntityService.delete(item.id).subscribe({
        next: response => {
          this.deletingEntityIds.delete(item.id);

          if (!response.isSuccess) {
            this.snackBar.open(response.message || 'تعذر حذف الجهة', 'إغلاق', {
              duration: 3000
            });
            return;
          }

          this.snackBar.open('تم حذف الجهة بنجاح', 'إغلاق', { duration: 2500 });
          this.loadRequestingEntities();
        },
        error: err => {
          this.deletingEntityIds.delete(item.id);
          console.error('RequestingEntity DELETE error:', err);
          this.snackBar.open(
            err?.error?.message ||
              err?.error?.Message ||
              err?.message ||
              'حدث خطأ أثناء حذف الجهة',
            'إغلاق',
            { duration: 3000 }
          );
        }
      });
    });
  }
}