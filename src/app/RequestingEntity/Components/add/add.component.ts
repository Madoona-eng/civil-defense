import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../../Shared/Components/translate.pipe';

@Component({
  selector: 'app-requesting-entity-add',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    TranslatePipe
  ],
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent {
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  formModel = {
    code: null,
    name: ''
  };

  saving = false;
  successMessage = '';
  errorMessage = '';

  preventNegative(event: KeyboardEvent): void {
    if (event.key === '-' || event.key === 'e') {
      event.preventDefault();
    }
  }

  save(): void {
    // منطق حفظ الجهة
    this.saved.emit();
  }

  cancel(): void {
    this.cancelled.emit();
  }
}