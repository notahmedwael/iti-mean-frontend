import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Books } from './books/books';
import { BookDetail } from './book-detail/book-detail';
import { Profile } from './auth/profile/profile';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';
import { LayoutComponent } from './admin/layout/layout';
import { DashboardComponent } from './admin/dashboard/dashboard';
import { UsersComponent } from './admin/users/users';

export const routes: Routes = [
  // ── Auth (no layout wrapper) ──────────────────
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'register', component: Register, canActivate: [guestGuard] },

  // ── User-facing pages (shared layout via app.html) ──
  { path: 'books', component: Books },
  { path: 'books/:id', component: BookDetail },
  { path: 'profile', component: Profile, canActivate: [authGuard] },

  // ── Admin (admin layout with sidebar) ────────
  {
    path: 'admin',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
      { path: 'users', component: UsersComponent },
      // future: { path: 'books',  component: AdminBooksComponent  },
      // future: { path: 'orders', component: AdminOrdersComponent },
    ],
  },

  // ── Fallback ──────────────────────────────────
  { path: '', redirectTo: '/books', pathMatch: 'full' },
];
