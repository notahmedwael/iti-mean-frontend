import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

const BACKEND_URL = environment.apiUrl;

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);
  const router = inject(Router);
  const token = localStorage.getItem('token');

  // Only attach the JWT to requests going to our own backend
  if (token && req.url.startsWith(BACKEND_URL)) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && req.url.startsWith(BACKEND_URL)) {
        authService.logout();
        router.navigate(['/login']);
      } else if (error.status === 403) {
        router.navigate(['/']);
      }
      return throwError(() => error);
    }),
  );
};
