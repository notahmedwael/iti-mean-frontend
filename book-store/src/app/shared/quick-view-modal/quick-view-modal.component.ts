import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { BookService, Book } from '../../services/book.service';
import { fadeInModal, fadeInBackdrop } from '../../animations';

@Component({
  selector: 'app-quick-view-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, StarRatingComponent],
  templateUrl: './quick-view-modal.component.html',
  styleUrl: './quick-view-modal.component.css',
  animations: [fadeInModal, fadeInBackdrop],
})
export class QuickViewModalComponent {
  @Input() book!: Book;
  @Output() close = new EventEmitter<void>();

  quantity = 1;

  constructor(
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.onClose();
  }

  isWishlisted(): boolean {
    return this.wishlistService.isWishlisted(this.book._id);
  }

  toggleWishlist(): void {
    this.wishlistService.toggle(this.book._id);
  }

  increaseQuantity(): void {
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    this.cartService.addItem(this.book, this.quantity);
    this.onClose();
  }

  onClose(): void {
    this.close.emit();
  }
}
