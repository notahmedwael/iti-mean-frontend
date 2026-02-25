import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000';
  private loggedIn = new BehaviorSubject<boolean>(!!localStorage.getItem('token'));

  isLoggedIn$ = this.loggedIn.asObservable();

  register(data: any) {
    return this.http.post(`${this.apiUrl}/users/signup`, data);
  }

  login(credentials: any) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/users/login`, credentials).pipe(
      tap((res) => {
        localStorage.setItem('token', res.token);
        this.loggedIn.next(true);
      }),
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.loggedIn.next(false);
  }

  isLoggedIn(): boolean {
    return this.loggedIn.value;
  }
}
