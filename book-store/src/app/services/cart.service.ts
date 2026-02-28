import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Book } from './book.service';

export interface CartItem {
  book: Book;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private _items = new BehaviorSubject<CartItem[]>([]);
  public items$ = this._items.asObservable();

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    const stored = localStorage.getItem('cart');
    if (stored) {
      this._items.next(JSON.parse(stored));
    }
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this._items.value));
  }

  addItem(book: Book, quantity: number = 1): void {
    const items = this._items.value;
    const existing = items.find((item) => item.book._id === book._id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ book, quantity });
    }
    this._items.next(items);
    this.saveToLocalStorage();
  }

  removeItem(bookId: string): void {
    const items = this._items.value.filter((item) => item.book._id !== bookId);
    this._items.next(items);
    this.saveToLocalStorage();
  }

  updateQuantity(bookId: string, quantity: number): void {
    const items = this._items.value;
    const item = items.find((item) => item.book._id === bookId);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(bookId);
      } else {
        item.quantity = quantity;
        this._items.next(items);
        this.saveToLocalStorage();
      }
    }
  }

  clear(): void {
    this._items.next([]);
    this.saveToLocalStorage();
  }

  getTotalQuantity(): number {
    return this._items.value.reduce((sum, item) => sum + item.quantity, 0);
  }

  getTotalPrice(): number {
    return this._items.value.reduce(
      (sum, item) => sum + item.book.price * item.quantity,
      0
    );
  }
}
