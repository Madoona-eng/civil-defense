import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';

import { AddComponent } from '../add/add.component';
import { ListComponent } from '../list/list.component';
import { EditComponent } from '../edit/edit.component';
import { MatIconModule } from '@angular/material/icon';

import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '../../../Shared/Components/translate.pipe';


@Component({
  selector: 'app-activity-type-management',
  standalone: true,

  imports: [
    CommonModule,
    MatButtonModule,
      MatIconModule,
    TranslatePipe,
    
    AddComponent,
    ListComponent,
    EditComponent
  ],

  templateUrl: './activity-type-management.component.html',
  styleUrl: './activity-type-management.component.scss'
})
export class ActivityTypeManagementComponent {

  // =========================================================
  // LIST COMPONENT
  // =========================================================

  @ViewChild(ListComponent)
  listComponent?: ListComponent;


  // =========================================================
  // POPUP STATES
  // =========================================================

  isAddPopupOpen = false;

  isEditPopupOpen = false;

  selectedActivityTypeId: string | null = null;


  // =========================================================
  // ADD
  // =========================================================

  openAddPopup(): void {
    this.isAddPopupOpen = true;
  }


  closeAddPopup(): void {
    this.isAddPopupOpen = false;
  }


  // =========================================================
  // EDIT
  // =========================================================

  openEditPopup(id: string): void {
    this.selectedActivityTypeId = id;

    this.isEditPopupOpen = true;
  }


  closeEditPopup(): void {
    this.isEditPopupOpen = false;

    this.selectedActivityTypeId = null;
  }


  // =========================================================
  // RELOAD LIST
  // =========================================================

  reloadList(): void {
    this.listComponent?.loadActivityTypes();
  }


  // =========================================================
  // ADD SUCCESS
  // =========================================================

  onAddSaved(): void {
    this.closeAddPopup();

    this.reloadList();
  }


  // =========================================================
  // EDIT SUCCESS
  // =========================================================

  onEditSaved(): void {
    this.closeEditPopup();

    this.reloadList();
  }


}