import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private baseUrl = 'http://localhost:8000';
  private _ids = new BehaviorSubject<string[]>([]);

  /** Observable set of wishlisted book IDs */
  ids$: Observable<string[]> = this._ids.asObservable();

  constructor(private http: HttpClient) { }

  toggle(bookId: string): void {
    const current = this._ids.value;
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    if (current.includes(bookId)) {
      this.http
        .delete(`${this.baseUrl}/wishlist/${bookId}`, { headers })
        .subscribe(() => this._ids.next(current.filter((id) => id !== bookId)));
    } else {
      this.http
        .post(`${this.baseUrl}/wishlist`, { book: bookId }, { headers })
        .subscribe(() => this._ids.next([...current, bookId]));
    }
  }
}
