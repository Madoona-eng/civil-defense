import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/components/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'civil-defense',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/dashboard-layout/dashboard-layout.component').then(
        (m) => m.DashboardLayoutComponent,
      ),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'activity-types/add',
        loadComponent: () =>
          import('./ActivityType/Components/add/add.component').then(
            (m) => m.AddComponent,
          ),
      },
      {
        path: 'activity-types',
        loadComponent: () =>
          import('./ActivityType/Components/activity-type-management/activity-type-management.component').then(
            (m) => m.ActivityTypeManagementComponent,
          ),
      },
      {
        path: 'requesting-entities',
        loadComponent: () =>
          import('./RequestingEntity/Components/requesting-entity-management/requesting-entity-management.component').then(
            (m) => m.RequestingEntityManagementComponent,
          ),
      },
      {
        path: 'districts',
        loadComponent: () =>
          import('./District/Components/district-management/district-management.component').then(
            (m) => m.DistrictManagementComponent,
          ),
      },
      {
        path: 'licensing-processes',
        loadComponent: () =>
          import('./LicensingProcess/Components/licensing-process-management/licensing-process-management.component').then(
            (m) => m.LicensingProcessManagementComponent,
          ),
      },
      {
        path: 'inspection',
        loadComponent: () =>
          import('./Inspection/Components/inspection-management/inspection-management.component').then(
            (m) => m.InspectionManagementComponent,
          ),
      },
      {
        path: 'final-approval',
        loadComponent: () =>
          import('./FinalApproval/Components/final-approval-management/final-approval-management.component').then(
            (m) => m.FinalApprovalManagementComponent,
          ),
      },
      {
        path: 'archived',
        loadComponent: () =>
          import('./Archived/Components/archived-management/archived-management.component').then(
            (m) => m.ArchivedManagementComponent,
          ),
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];
