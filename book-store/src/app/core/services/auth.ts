import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

interface JwtPayload {
  userId: string;
  role: 'User' | 'Admin';
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private loggedIn = new BehaviorSubject<boolean>(!!localStorage.getItem('token'));

  isLoggedIn$ = this.loggedIn.asObservable();

  /** Decode the base64 JWT middle segment — no library needed */
  private decodeToken(token: string): JwtPayload | null {
    try {
      return JSON.parse(atob(token.split('.')[1])) as JwtPayload;
    } catch {
      return null;
    }
  }

  register(data: any) {
    return this.http.post(`${this.apiUrl}/users/signup`, data);
  }

  login(credentials: any) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/users/login`, credentials).pipe(
      tap((res) => {
        localStorage.setItem('token', res.token);
        const payload = this.decodeToken(res.token);
        if (payload) {
          localStorage.setItem('userId', payload.userId);
          localStorage.setItem('role', payload.role);
        }
        this.loggedIn.next(true);
      }),
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    this.loggedIn.next(false);
  }

  isLoggedIn(): boolean {
    return this.loggedIn.value;
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  isAdmin(): boolean {
    return this.getRole() === 'Admin';
  }
}
