import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly STORAGE_KEY = 'wishlist_ids';
  private _ids = new BehaviorSubject<string[]>([]);

  /** Observable set of wishlisted book IDs */
  ids$: Observable<string[]> = this._ids.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        this._ids.next(JSON.parse(stored));
      } catch {
        this._ids.next([]);
      }
    }
  }

  private saveToStorage(ids: string[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ids));
    this._ids.next(ids);
  }

  /** Toggle a book in/out of the wishlist */
  toggle(bookId: string): void {
    const current = this._ids.value;
    if (current.includes(bookId)) {
      this.saveToStorage(current.filter((id) => id !== bookId));
    } else {
      this.saveToStorage([...current, bookId]);
    }
  }

  /** Remove a book from the wishlist (same as toggle-off) */
  remove(bookId: string): void {
    const current = this._ids.value;
    this.saveToStorage(current.filter((id) => id !== bookId));
  }

  /** Synchronously return current wishlist IDs */
  getIds(): string[] {
    return this._ids.value;
  }

  /** Check if a book is in the wishlist */
  isWishlisted(bookId: string): boolean {
    return this._ids.value.includes(bookId);
  }
}
