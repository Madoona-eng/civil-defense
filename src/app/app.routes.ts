import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/components/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'civil-defense',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/dashboard-layout/dashboard-layout.component')
        .then(m => m.DashboardLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'activity-types/add',
        loadComponent: () =>
          import('./ActivityType/Components/add/add.component')
            .then(m => m.AddComponent)
      },
      {
        path: 'activity-types',
        loadComponent: () =>
          import('./ActivityType/Components/activity-type-management/activity-type-management.component')
            .then(m => m.ActivityTypeManagementComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];