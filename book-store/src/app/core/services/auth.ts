import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000';

  register(data: any) {
    return this.http.post(`${this.apiUrl}/users/signup`, data);
  }

  login(credentials: any) {
    return this.http
      .post<{ token: string }>(`${this.apiUrl}/users/login`, credentials)
      .pipe(tap((res) => localStorage.setItem('token', res.token)));
  }

  logout() {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
