import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import {
  LucideAngularModule,
  PanelRightOpen,
  PanelLeftOpen,
  LogOut,
} from 'lucide-angular';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideAngularModule,
    MatButtonModule,
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
})
export class DashboardLayoutComponent implements OnInit {
  readonly PanelRightOpen = PanelRightOpen;
  readonly PanelLeftOpen = PanelLeftOpen;
  readonly LogOut = LogOut;
  title = 'لوحة التحكم';
  username = '';
  userRole = '';
  isCollapsed = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.userRole = this.authService.getRole();

    // إرسال المستخدم مباشرة لصفحته المخصصة لو كان داخل على الرابط الرئيسي
    if (
      this.router.url === '/civil-defense/dashboard' ||
      this.router.url === '/civil-defense'
    ) {
      this.redirectToDefaultRoute();
    }
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  // دالة للتحقق من الصلاحيات في الـ Template
  // دالة التحقق من الصلاحيات في dashboard-layout.component.ts
  hasRole(allowedRoles: string[]): boolean {
    if (!this.userRole) return false;
    // إعطاء صلاحية رؤية الكل لـ SuperAdmin و Admin
    return (
      allowedRoles.includes(this.userRole) ||
      this.userRole === 'SuperAdmin' ||
      this.userRole === 'Admin'
    );
  }

  // توجيه تلقائي للصفحة الخاصة بالـ Role
  private redirectToDefaultRoute(): void {
    switch (this.userRole) {
      case 'DataEntry':
        this.router.navigate(['/civil-defense/licensing-processes']);
        break;
      case 'Inspector':
        this.router.navigate(['/civil-defense/inspection']);
        break;
      case 'FinalApprover':
        this.router.navigate(['/civil-defense/final-approval']);
        break;
      case 'Archive':
        this.router.navigate(['/civil-defense/archive']);
        break;
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
