import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'Admin' | 'User';
  status: 'active' | 'banned';
  avatar?: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:8000/users';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<any>(this.apiUrl).pipe(map((response) => response.data));
  }

  // Uses the admin-only route which allows role and skips passwordConfirm
  createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    DOB?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/create`, data);
  }

  updateUser(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, data);
  }

  updateUserStatus(userId: string, status: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${userId}`, { status });
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }
}
