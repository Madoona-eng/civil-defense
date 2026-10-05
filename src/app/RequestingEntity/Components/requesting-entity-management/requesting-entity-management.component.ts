import { CommonModule } from '@angular/common';
import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { AddComponent } from '../add/add.component';
import { ListComponent } from '../list/list.component';
import { EditComponent } from '../edit/edit.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '../../../Shared/Components/translate.pipe';

@Component({
  selector: 'app-requesting-entity-management',
  standalone: true,
  imports: [
    CommonModule,
    AddComponent,
    ListComponent,
    EditComponent,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TranslatePipe
  ],
  templateUrl: './requesting-entity-management.component.html',
  styleUrl: './requesting-entity-management.component.scss'
})
export class RequestingEntityManagementComponent {
  @ViewChild(ListComponent) listComponent?: ListComponent;

  isAddPopupOpen = false;
  isEditPopupOpen = false;

  selectedRequestingEntityId: string | null = null;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  openAddPopup(): void {
    console.log('Open Add Popup Triggered'); // للتأكد عبر הـ Console
    this.isAddPopupOpen = true;
    this.cdr.detectChanges(); // إجبار Angular على إعادة رسم الـ DOM
  }

  closeAddPopup(): void {
    this.isAddPopupOpen = false;
    this.cdr.detectChanges();
  }

  openEditPopup(id: string): void {
    this.selectedRequestingEntityId = id;
    this.isEditPopupOpen = true;
    this.cdr.detectChanges();
  }

  closeEditPopup(): void {
    this.isEditPopupOpen = false;
    this.selectedRequestingEntityId = null;
    this.cdr.detectChanges();
  }

  reloadList(): void {
    this.listComponent?.loadRequestingEntities();
  }

  onAddSaved(): void {
    this.closeAddPopup();
    this.reloadList();
  }

  onEditSaved(): void {
    this.closeEditPopup();
    this.reloadList();
  }

}