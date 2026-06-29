import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { AddComponent } from '../add/add.component';
import { ListComponent } from '../list/list.component';
import { EditComponent } from '../edit/edit.component';
import { DeleteComponent } from '../delete/delete.component';
import { RequestingEntity } from '../../Models/requesting-entity';

@Component({
  selector: 'app-requesting-entity-management',
  standalone: true,
  imports: [
    CommonModule,
    AddComponent,
    ListComponent,
    EditComponent,
    DeleteComponent
  ],
  templateUrl: './requesting-entity-management.component.html',
  styleUrl: './requesting-entity-management.component.scss'
})
export class RequestingEntityManagementComponent {
  @ViewChild(ListComponent) listComponent?: ListComponent;

  isAddPopupOpen = false;
  isEditPopupOpen = false;
  isDeletePopupOpen = false;

  selectedRequestingEntityId: string | null = null;
  selectedRequestingEntity: RequestingEntity | null = null;

  openAddPopup(): void {
    this.isAddPopupOpen = true;
  }

  closeAddPopup(): void {
    this.isAddPopupOpen = false;
  }

  openEditPopup(id: string): void {
    this.selectedRequestingEntityId = id;
    this.isEditPopupOpen = true;
  }

  closeEditPopup(): void {
    this.isEditPopupOpen = false;
    this.selectedRequestingEntityId = null;
  }

  openDeletePopup(item: RequestingEntity): void {
    this.selectedRequestingEntity = item;
    this.isDeletePopupOpen = true;
  }

  closeDeletePopup(): void {
    this.isDeletePopupOpen = false;
    this.selectedRequestingEntity = null;
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

  onDeleteDone(): void {
    this.closeDeletePopup();
    this.reloadList();
  }
}