import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Books } from './books/books';
import { BookDetail } from './book-detail/book-detail';
import { Profile } from './auth/profile/profile';
import { Home } from './home/home';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';
import { adminGuard } from './core/guards/admin-guard';
import { LayoutComponent } from './admin/layout/layout';
import { DashboardComponent } from './admin/dashboard/dashboard';
import { UsersComponent } from './admin/users/users';
import { SharedLayoutComponent } from './shared/shared-layout/shared-layout.component';

export const routes: Routes = [
  // ── Auth routes (no layout) ──────────────────
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'register', component: Register, canActivate: [guestGuard] },

  // ── Main pages with shared layout ───────────
  {
    path: '',
    component: SharedLayoutComponent,
    children: [
      { path: '', component: Home },
      { path: 'books', component: Books },
      { path: 'books/:id', component: BookDetail },
      { path: 'profile', component: Profile, canActivate: [authGuard] },
    ],
  },

  // ── Admin (admin layout with sidebar) ────────
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UsersComponent },
    ],
  },

  // ── Fallback ──────────────────────────────────
  { path: '**', redirectTo: '' },
];
