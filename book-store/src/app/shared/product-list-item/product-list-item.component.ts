import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WishlistService } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { BookService, Book } from '../../services/book.service';

@Component({
  selector: 'app-product-list-item',
  standalone: true,
  imports: [CommonModule, StarRatingComponent],
  templateUrl: './product-list-item.component.html',
  styleUrl: './product-list-item.component.css',
})
export class ProductListItemComponent {
  @Input() book!: Book;
  @Output() quickView = new EventEmitter<Book>();

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService
  ) {}

  isWishlisted(): boolean {
    return this.wishlistService.isWishlisted(this.book._id);
  }

  toggleWishlist(): void {
    this.wishlistService.toggle(this.book._id);
  }

  addToCart(): void {
    this.cartService.addItem(this.book, 1);
  }

  onQuickView(): void {
    this.quickView.emit(this.book);
  }

  formatPrice(price: number): string {
    return '$' + price.toFixed(2);
  }
}
