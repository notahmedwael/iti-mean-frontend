import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true; // Let them through
  } else {
    // Redirect to login page
    router.navigate(['/login']);
    return false;
  }
};
