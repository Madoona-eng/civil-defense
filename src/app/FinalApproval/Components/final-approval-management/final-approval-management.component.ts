import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';

import { FinalApprovalItem } from '../../Models/final-approval';

import { ListComponent } from '../list/list.component';
import { DetailsComponent } from '../details/details.component';
import { EditComponent } from '../edit/edit.component';
import { DeleteComponent } from '../delete/delete.component';
import { ReturnToInspectionComponent } from '../return-to-inspection/return-to-inspection.component';

@Component({
  selector: 'app-final-approval-management',
  standalone: true,
  imports: [
    CommonModule,
    ListComponent,
    DetailsComponent,
    EditComponent,
    DeleteComponent,
    ReturnToInspectionComponent
  ],
  templateUrl: './final-approval-management.component.html',
  styleUrl: './final-approval-management.component.scss'
})
export class FinalApprovalManagementComponent {
  @ViewChild(ListComponent) listComponent?: ListComponent;

  isDetailsPopupOpen = false;
  isEditPopupOpen = false;
  isDeletePopupOpen = false;
  isReturnPopupOpen = false;

  selectedProcessId: string | null = null;
  selectedApprovalItem: FinalApprovalItem | null = null;
  selectedDeleteItem: FinalApprovalItem | null = null;
  selectedReturnItem: FinalApprovalItem | null = null;

  openDetailsPopup(id: string): void {
    this.selectedProcessId = id;
    this.isDetailsPopupOpen = true;
  }

  closeDetailsPopup(): void {
    this.selectedProcessId = null;
    this.isDetailsPopupOpen = false;
  }

  openEditPopup(item: FinalApprovalItem): void {
    this.selectedApprovalItem = item;
    this.isEditPopupOpen = true;
  }

  closeEditPopup(): void {
    this.selectedApprovalItem = null;
    this.isEditPopupOpen = false;
  }

  onEditSaved(): void {
    this.closeEditPopup();
    this.listComponent?.loadFinalApprovals();
  }

  openDeletePopup(item: FinalApprovalItem): void {
    this.selectedDeleteItem = item;
    this.isDeletePopupOpen = true;
  }

  closeDeletePopup(): void {
    this.selectedDeleteItem = null;
    this.isDeletePopupOpen = false;
  }

  onDeleteDone(): void {
    this.closeDeletePopup();
    this.listComponent?.loadFinalApprovals();
  }

  openReturnPopup(item: FinalApprovalItem): void {
    this.selectedReturnItem = item;
    this.isReturnPopupOpen = true;
  }

  closeReturnPopup(): void {
    this.selectedReturnItem = null;
    this.isReturnPopupOpen = false;
  }

  onReturnDone(): void {
    this.closeReturnPopup();
    this.listComponent?.loadFinalApprovals();
  }
}