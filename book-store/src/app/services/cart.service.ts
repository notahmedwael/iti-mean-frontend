import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Book } from './book.service';

export interface CartItem {
  book: Book;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private baseUrl = environment.apiUrl;
  private _items = new BehaviorSubject<CartItem[]>([]);

  /** Observable list of cart items */
  items$ = this._items.asObservable();

  constructor(private http: HttpClient) {
    // Try to load cart if token exists on initialization
    if (localStorage.getItem('token')) {
      this.loadCart();
    }
  }

  loadCart(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this._items.next([]);
      return;
    }

    this.http
      .get<{ status: string; data: any }>(`${this.baseUrl}/cart`)
      .subscribe({
        next: (res) => {
          if (res.status === 'successful' && res.data) {
            this._items.next(res.data.items || []);
          }
        },
        error: () => this._items.next([]),
      });
  }

  addItem(book: Book, quantity = 1): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.http
      .post<{ status: string; data: any }>(`${this.baseUrl}/cart/add`, {
        book: book._id,
        quantity,
      })
      .subscribe({
        next: (res) => {
          if (res.status === 'successful' && res.data) {
            this._items.next(res.data.items || []);
          }
        },
      });
  }

  removeItem(bookId: string): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.http
      .delete<{ status: string; data: any }>(`${this.baseUrl}/cart/remove/${bookId}`)
      .subscribe({
        next: (res) => {
          if (res.status === 'successful' && res.data) {
            this._items.next(res.data.items || []);
          }
        },
      });
  }

  updateQuantity(bookId: string, quantity: number): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.http
      .patch<{ status: string; data: any }>(`${this.baseUrl}/cart/update/${bookId}`, {
        quantity,
      })
      .subscribe({
        next: (res) => {
          if (res.status === 'successful' && res.data) {
            this._items.next(res.data.items || []);
          }
        },
      });
  }

  getTotalPrice(): number {
    return this._items.value.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);
  }

  getTotalQuantity(): number {
    return this._items.value.reduce((sum, item) => sum + item.quantity, 0);
  }

  clear(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this._items.next([]);
      return;
    }

    this.http.delete(`${this.baseUrl}/cart/clear`).subscribe({
      next: () => this._items.next([]),
    });
  }
}
