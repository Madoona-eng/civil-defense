import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const superAdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getRole() === 'SuperAdmin'
    ? true
    : router.createUrlTree(['/civil-defense/dashboard']);
};
