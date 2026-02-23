import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  // {
  //   path: 'dashboard',
  //   component: DashboardComponent, // Create this or use a placeholder
  //   canActivate: [authGuard], // The guard protects this route
  // },
  //   { path: '', redirectTo: '/login', pathMatch: 'full' },
];
