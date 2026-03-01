import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoginPromptService {
  private _visible = signal(false);
  private _message = signal('Please sign in to continue.');

  visible = this._visible.asReadonly();
  message = this._message.asReadonly();

  show(message?: string): void {
    if (message) this._message.set(message);
    this._visible.set(true);
  }

  hide(): void {
    this._visible.set(false);
  }
}
