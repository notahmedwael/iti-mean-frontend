import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WishlistService } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { BookService, Book } from '../../services/book.service';
import { Auth } from '../../core/services/auth';
import { LoginPromptService } from '../../services/login-prompt.service';
import { cartAdded } from '../../animations';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, StarRatingComponent],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
  animations: [cartAdded],
})
export class ProductCardComponent {
  @Input() book!: Book;
  @Output() quickView = new EventEmitter<Book>();

  addedState = signal<'idle' | 'added'>('idle');

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private authService: Auth,
    private loginPromptService: LoginPromptService
  ) {}

  isWishlisted(): boolean {
    return this.wishlistService.isWishlisted(this.book._id);
  }

  toggleWishlist(): void {
    this.wishlistService.toggle(this.book._id);
  }

  addToCart(): void {
    if (!this.authService.isLoggedIn()) {
      this.loginPromptService.show('Please sign in to add books to your shopping cart.');
      return;
    }
    this.cartService.addItem(this.book, 1);
    this.addedState.set('added');
    setTimeout(() => this.addedState.set('idle'), 2000);
  }

  onQuickView(): void {
    this.quickView.emit(this.book);
  }

  formatPrice(price: number): string {
    return '$' + price.toFixed(2);
  }
}
