import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { AddComponent } from '../add/add.component';
import { ListComponent } from '../list/list.component';
import { EditComponent } from '../edit/edit.component';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../../Shared/Components/translate.pipe';


@Component({
  selector: 'app-district-management',
  standalone: true,
  imports: [
    CommonModule,
    AddComponent,
    ListComponent,
    EditComponent,
    MatIconModule,
    TranslatePipe
  ],
  templateUrl: './district-management.component.html',
  styleUrl: './district-management.component.scss'
})
export class DistrictManagementComponent {
  @ViewChild(ListComponent) listComponent?: ListComponent;

  isAddPopupOpen = false;
  isEditPopupOpen = false;

  selectedDistrictId: string | null = null;

  openAddPopup(): void {
    this.isAddPopupOpen = true;
  }

  closeAddPopup(): void {
    this.isAddPopupOpen = false;
  }

  openEditPopup(id: string): void {
    this.selectedDistrictId = id;
    this.isEditPopupOpen = true;
  }

  closeEditPopup(): void {
    this.isEditPopupOpen = false;
    this.selectedDistrictId = null;
  }

  reloadList(): void {
    this.listComponent?.loadDistricts();
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