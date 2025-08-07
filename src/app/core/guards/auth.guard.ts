import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard to protect routes that require authentication
 * Redirects unauthenticated users to login page
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated
  const isAuthenticated = authService.isAuthenticated();

  if (isAuthenticated) {
    return true;
  }

  // Store the attempted URL for redirecting after login
  const redirectUrl = state.url;
  
  // Redirect to login page with return URL
  router.navigate(['/auth/login'], { 
    queryParams: { returnUrl: redirectUrl } 
  });
  
  return false;
};

/**
 * Guest Guard to prevent authenticated users from accessing auth pages
 * Redirects authenticated users to dashboard
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return true;
  }

  // Redirect authenticated users to dashboard
  router.navigate(['/dashboard']);
  return false;
};