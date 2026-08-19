import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-civil-defense-dashboard-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './civil-defense-dashboard-sidebar.component.html',
  styleUrls: ['./civil-defense-dashboard-sidebar.component.css']
})
export class CivilDefenseDashboardSidebarComponent {
  @Input() selectedStatus: string = '';
  @Input() userName: string = 'Admin';
  @Input() userRole: string = ''; // القيمة القادمة من الـ Token (DataEntry, Inspector, FinalApprover, Archive)

  @Input() totalRequests: number = 0;
  @Input() newRequests: number = 0;
  @Input() inspectionRequests: number = 0;
  @Input() finalApprovalRequests: number = 0;

  @Output() statusSelected = new EventEmitter<string>();
  @Output() createRequest = new EventEmitter<void>();
  @Output() openInspection = new EventEmitter<void>();
  @Output() openApprovals = new EventEmitter<void>();
  @Output() openArchive = new EventEmitter<void>();
  @Output() manageActivityTypes = new EventEmitter<void>();
  @Output() logoutRequested = new EventEmitter<void>();

  onStatusSelect(status: string): void {
    this.statusSelected.emit(status);
  }

  // دالة للتحقق من الصلاحيات
  hasRole(allowedRoles: string[]): boolean {
    if (!this.userRole) return false;
    // تم إضافة Admin تلقائياً لرؤية جميع الشاشات عند الحاجة
    return allowedRoles.includes(this.userRole) || this.userRole === 'Admin';
  }
}