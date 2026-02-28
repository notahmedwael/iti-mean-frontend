import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Book } from './book.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

  addItem(book: Book): void {
    const token = localStorage.getItem('token');
    if (!token) return;
    this.http
      .post(
        `${this.baseUrl}/cart`,
        { book: book._id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .subscribe();
  }
}
