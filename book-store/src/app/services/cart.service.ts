import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Book } from './book.service';

export interface CartItem {
  book: Book;
  quantity: number;
  price: number;
}

export interface CartResponse {
  status: string;
  data: {
    _id: string;
    user: string;
    items: CartItem[];
    totalPrice: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8000';

  private _items = new BehaviorSubject<CartItem[]>([]);
  public items$ = this._items.asObservable();

  constructor() {
    this.loadCart();
  }

  /**
   * Load cart from backend
   */
  private loadCart(): void {
    this.getCart().subscribe({
      next: (res) => {
        this._items.next(res.data.items);
      },
      error: (err) => {
        // If unauthorized, cart will be empty until user logs in
        console.error('Failed to load cart:', err);
        this._items.next([]);
      },
    });
  }

  /**
   * View user's shopping cart
   */
  private getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(`${this.baseUrl}/cart`);
  }

  /**
   * Add item to cart
   */
  addItem(book: Book, quantity: number = 1): void {
    const payload = {
      book: book._id,
      quantity,
    };

    this.http
      .post<CartResponse>(`${this.baseUrl}/cart/add`, payload)
      .pipe(
        tap((res) => {
          this._items.next(res.data.items);
        })
      )
      .subscribe({
        error: (err) => {
          console.error('Failed to add item to cart:', err);
        },
      });
  }

  /**
   * Remove item from cart
   */
  removeItem(bookId: string): void {
    this.http
      .delete<CartResponse>(`${this.baseUrl}/cart/remove/${bookId}`)
      .pipe(
        tap((res) => {
          this._items.next(res.data.items);
        })
      )
      .subscribe({
        error: (err) => {
          console.error('Failed to remove item from cart:', err);
        },
      });
  }

  /**
   * Update item quantity in cart
   */
  updateQuantity(bookId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(bookId);
      return;
    }

    const payload = { quantity };
    this.http
      .patch<CartResponse>(`${this.baseUrl}/cart/update/${bookId}`, payload)
      .pipe(
        tap((res) => {
          this._items.next(res.data.items);
        })
      )
      .subscribe({
        error: (err) => {
          console.error('Failed to update cart quantity:', err);
        },
      });
  }

  /**
   * Clear entire cart
   */
  clear(): void {
    this.http
      .delete<CartResponse>(`${this.baseUrl}/cart/clear`)
      .pipe(
        tap((res) => {
          this._items.next(res.data.items);
        })
      )
      .subscribe({
        error: (err) => {
          console.error('Failed to clear cart:', err);
        },
      });
  }

  /**
   * Get total quantity of items in cart
   */
  getTotalQuantity(): number {
    return this._items.value.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Get total price of cart
   */
  getTotalPrice(): number {
    return this._items.value.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  /**
   * Get current items (synchronous access to latest state)
   */
  getItems(): CartItem[] {
    return this._items.value;
  }

  /**
   * Reload cart from backend (useful after login)
   */
  refreshCart(): void {
    this.loadCart();
  }
}
