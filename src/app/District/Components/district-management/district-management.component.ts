import { Component, ViewChild } from '@angular/core';
import { AddComponent } from '../add/add.component';
import { ListComponent } from '../list/list.component';
import { EditComponent } from '../edit/edit.component';
import { DeleteComponent } from '../delete/delete.component';
import { DistrictSummary } from '../../Models/district';

@Component({
  selector: 'app-district-management',
  standalone: true,
  imports: [ListComponent, AddComponent, EditComponent, DeleteComponent],
  templateUrl: './district-management.component.html',
  styleUrl: './district-management.component.scss'
})
export class DistrictManagementComponent {
  @ViewChild(ListComponent) listComponent?: ListComponent;

  isAddPopupOpen = false;
  isEditPopupOpen = false;
  isDeletePopupOpen = false;
  selectedDistrictId: string | null = null;
  selectedDistrict: DistrictSummary | null = null;

  openAddPopup(): void { this.isAddPopupOpen = true; }
  closeAddPopup(): void { this.isAddPopupOpen = false; }

  openEditPopup(id: string): void {
    this.selectedDistrictId = id;
    this.isEditPopupOpen = true;
  }
  closeEditPopup(): void {
    this.isEditPopupOpen = false;
    this.selectedDistrictId = null;
  }

  openDeletePopup(item: DistrictSummary): void {
    this.selectedDistrict = item;
    this.isDeletePopupOpen = true;
  }
  closeDeletePopup(): void {
    this.isDeletePopupOpen = false;
    this.selectedDistrict = null;
  }

  reloadList(): void { this.listComponent?.loadDistricts(); }

  onAddSaved(): void { this.closeAddPopup(); this.reloadList(); }
  onEditSaved(): void { this.closeEditPopup(); this.reloadList(); }
  onDeleteDone(): void { this.closeDeletePopup(); this.reloadList(); }
}