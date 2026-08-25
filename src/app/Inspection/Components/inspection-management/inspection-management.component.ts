import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';

import { InspectionItem } from '../../Models/inspection';

import { ListComponent } from '../list/list.component';
import { InspectionProcessComponent } from '../inspection-process/inspection-process.component';


@Component({
  selector: 'app-inspection-management',
  standalone: true,
  imports: [
    CommonModule,
    ListComponent,
    InspectionProcessComponent,
  ],
  templateUrl: './inspection-management.component.html',
  styleUrl: './inspection-management.component.scss'
})
export class InspectionManagementComponent {
  @ViewChild(ListComponent) listComponent?: ListComponent;

  isEditPopupOpen = false;

  selectedInspectionItem: InspectionItem | null = null;


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

}