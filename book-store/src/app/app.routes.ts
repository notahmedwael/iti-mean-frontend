import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Books } from './books/books';
import { BookDetail } from './book-detail/book-detail';


export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'books', component: Books},
  { path: 'books/:id', component: BookDetail },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
