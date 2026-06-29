import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';

import { InspectionItem } from '../../Models/inspection';

import { ListComponent } from '../list/list.component';
import { DetailsComponent } from '../details/details.component';
import { EditComponent } from '../edit/edit.component';
import { DeleteComponent } from '../delete/delete.component';

@Component({
  selector: 'app-inspection-management',
  standalone: true,
  imports: [
    CommonModule,
    ListComponent,
    DetailsComponent,
    EditComponent,
    DeleteComponent
  ],
  templateUrl: './inspection-management.component.html',
  styleUrl: './inspection-management.component.scss'
})
export class InspectionManagementComponent {
  @ViewChild(ListComponent) listComponent?: ListComponent;

  isDetailsPopupOpen = false;
  isEditPopupOpen = false;
  isDeletePopupOpen = false;

  selectedProcessId: string | null = null;
  selectedInspectionItem: InspectionItem | null = null;
  selectedDeleteItem: InspectionItem | null = null;

  openDetailsPopup(id: string): void {
    this.selectedProcessId = id;
    this.isDetailsPopupOpen = true;
  }

  closeDetailsPopup(): void {
    this.selectedProcessId = null;
    this.isDetailsPopupOpen = false;
  }

  openEditPopup(item: InspectionItem): void {
    this.selectedInspectionItem = item;
    this.isEditPopupOpen = true;
  }

  closeEditPopup(): void {
    this.selectedInspectionItem = null;
    this.isEditPopupOpen = false;
  }

  onEditSaved(): void {
    this.closeEditPopup();
    this.listComponent?.loadInspections();
  }

  openDeletePopup(item: InspectionItem): void {
    this.selectedDeleteItem = item;
    this.isDeletePopupOpen = true;
  }

  closeDeletePopup(): void {
    this.selectedDeleteItem = null;
    this.isDeletePopupOpen = false;
  }

  onDeleteDone(): void {
    this.closeDeletePopup();
    this.listComponent?.loadInspections();
  }
}