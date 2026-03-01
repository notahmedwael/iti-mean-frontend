import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-prompt-modal',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './login-prompt-modal.component.html',
})
export class LoginPromptModalComponent {
  @Input() message: string = 'Please sign in to continue.';
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}
