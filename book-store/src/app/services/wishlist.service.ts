import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private _ids = new BehaviorSubject<string[]>([]);
  public ids$ = this._ids.asObservable();

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    const stored = localStorage.getItem('wishlist');
    if (stored) {
      this._ids.next(JSON.parse(stored));
    }
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('wishlist', JSON.stringify(this._ids.value));
  }

  toggle(id: string): void {
    const ids = this._ids.value;
    const index = ids.indexOf(id);
    if (index > -1) {
      ids.splice(index, 1);
    } else {
      ids.push(id);
    }
    this._ids.next(ids);
    this.saveToLocalStorage();
  }

  add(id: string): void {
    if (!this.isWishlisted(id)) {
      const ids = this._ids.value;
      ids.push(id);
      this._ids.next(ids);
      this.saveToLocalStorage();
    }
  }

  remove(id: string): void {
    const ids = this._ids.value.filter((item) => item !== id);
    this._ids.next(ids);
    this.saveToLocalStorage();
  }

  isWishlisted(id: string): boolean {
    return this._ids.value.includes(id);
  }

  clear(): void {
    this._ids.next([]);
    this.saveToLocalStorage();
  }

  getIds(): string[] {
    return this._ids.value;
  }
}
