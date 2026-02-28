import { Component, inject, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart-modal',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart-modal.component.html',
  styleUrl: './cart-modal.component.css',
})
export class CartModalComponent implements OnInit {
  public cartService = inject(CartService);
  @Output() close = new EventEmitter<void>();

  items = signal<CartItem[]>([]);
  totalPrice = signal(0);

  ngOnInit() {
    this.cartService.items$.subscribe((items) => {
      this.items.set(items);
      this.totalPrice.set(this.cartService.getTotalPrice());
    });
  }

  closeModal() {
    this.close.emit();
  }

  removeItem(bookId: string) {
    this.cartService.removeItem(bookId);
  }

  updateQuantity(bookId: string, quantity: number) {
    this.cartService.updateQuantity(bookId, quantity);
  }

  checkout() {
    this.closeModal();
  }
}
