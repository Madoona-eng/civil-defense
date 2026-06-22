import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { AddComponent } from '../add/add.component';
import { ListComponent } from '../list/list.component';
import { EditComponent } from '../edit/edit.component';
import { DeleteComponent } from '../delete/delete.component';
import { ActivityType } from '../../Models/activity-type';

@Component({
  selector: 'app-activity-type-management',
  standalone: true,
  imports: [
    CommonModule,
    AddComponent,
    ListComponent,
    EditComponent,
    DeleteComponent
  ],
  templateUrl: './activity-type-management.component.html',
  styleUrl: './activity-type-management.component.scss'
})
export class ActivityTypeManagementComponent {
  @ViewChild(ListComponent) listComponent?: ListComponent;

  isAddPopupOpen = false;
  isEditPopupOpen = false;
  isDeletePopupOpen = false;

  selectedActivityTypeId: string | null = null;
  selectedActivityType: ActivityType | null = null;

  openAddPopup(): void {
    this.isAddPopupOpen = true;
  }

  closeAddPopup(): void {
    this.isAddPopupOpen = false;
  }

  openEditPopup(id: string): void {
    this.selectedActivityTypeId = id;
    this.isEditPopupOpen = true;
  }

  closeEditPopup(): void {
    this.isEditPopupOpen = false;
    this.selectedActivityTypeId = null;
  }

  openDeletePopup(item: ActivityType): void {
    this.selectedActivityType = item;
    this.isDeletePopupOpen = true;
  }

  closeDeletePopup(): void {
    this.isDeletePopupOpen = false;
    this.selectedActivityType = null;
  }

  reloadList(): void {
    this.listComponent?.loadActivityTypes();
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