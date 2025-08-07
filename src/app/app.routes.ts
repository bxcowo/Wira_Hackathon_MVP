import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent),
    title: 'TransitAI - Monitoreo Inteligente de Tránsito Urbano'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent),
        title: 'Iniciar Sesión - TransitAI',
        canActivate: [guestGuard]
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'dashboard',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard - TransitAI',
        canActivate: [authGuard]
      }
    ]
  },
  {
    // Redirect any unknown route to home
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
