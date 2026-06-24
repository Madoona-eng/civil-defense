import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { AddComponent } from '../add/add.component';
import { ListComponent } from '../list/list.component';
import { DetailsComponent } from '../details/details.component';
import { EditComponent } from '../edit/edit.component';
import { DeleteComponent } from '../delete/delete.component';
import { LicensingProcessItem } from '../../Models/licensing-process';

@Component({
  selector: 'app-licensing-process-management',
  standalone: true,
  imports: [
    CommonModule,
    AddComponent,
    ListComponent,
    DetailsComponent,
    EditComponent,
    DeleteComponent
  ],
  templateUrl: './licensing-process-management.component.html',
  styleUrl: './licensing-process-management.component.scss'
})
export class LicensingProcessManagementComponent {
  @ViewChild(ListComponent) listComponent?: ListComponent;

  isAddPopupOpen = false;
  isDetailsPopupOpen = false;
  isEditPopupOpen = false;
  isDeletePopupOpen = false;

  selectedProcessId: string | null = null;
  selectedProcessItem: LicensingProcessItem | null = null;

  openAddPopup(): void {
    this.isAddPopupOpen = true;
  }

  closeAddPopup(): void {
    this.isAddPopupOpen = false;
  }

  onAddSaved(): void {
    this.closeAddPopup();
    this.reloadList();
  }

  openDetailsPopup(id: string): void {
    this.selectedProcessId = id;
    this.isDetailsPopupOpen = true;
  }

  closeDetailsPopup(): void {
    this.isDetailsPopupOpen = false;
    this.selectedProcessId = null;
  }

  openEditPopup(id: string): void {
    this.selectedProcessId = id;
    this.isEditPopupOpen = true;
  }

  closeEditPopup(): void {
    this.isEditPopupOpen = false;
    this.selectedProcessId = null;
  }

  onEditSaved(): void {
    this.closeEditPopup();
    this.reloadList();
  }

  openDeletePopup(item: LicensingProcessItem): void {
    this.selectedProcessItem = item;
    this.isDeletePopupOpen = true;
  }

  closeDeletePopup(): void {
    this.isDeletePopupOpen = false;
    this.selectedProcessItem = null;
  }

  onDeleteDone(): void {
    this.closeDeletePopup();
    this.reloadList();
  }

  reloadList(): void {
    this.listComponent?.loadLicensingProcesses();
  }
}