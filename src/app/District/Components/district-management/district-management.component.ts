import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { AddComponent } from '../add/add.component';
import { ListComponent } from '../list/list.component';
import { EditComponent } from '../edit/edit.component';
import { DeleteComponent } from '../delete/delete.component';
import { District } from '../../Models/district';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-district-management',
  standalone: true,
  imports: [
    CommonModule,
    AddComponent,
    ListComponent,
    EditComponent,
    DeleteComponent , MatIconModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, 
    MatTableModule, MatPaginatorModule, MatSortModule, FormsModule, ReactiveFormsModule
  ],
  templateUrl: './district-management.component.html',
  styleUrl: './district-management.component.scss'
})
export class DistrictManagementComponent {
  @ViewChild(ListComponent) listComponent?: ListComponent;

  isAddPopupOpen = false;
  isEditPopupOpen = false;
  isDeletePopupOpen = false;

  selectedDistrictId: string | null = null;
  selectedDistrict: District | null = null;

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

  openDeletePopup(item: District): void {
    this.selectedDistrict = item;
    this.isDeletePopupOpen = true;
  }

  closeDeletePopup(): void {
    this.isDeletePopupOpen = false;
    this.selectedDistrict = null;
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

  onDeleteDone(): void {
    this.closeDeletePopup();
    this.reloadList();
  }
}