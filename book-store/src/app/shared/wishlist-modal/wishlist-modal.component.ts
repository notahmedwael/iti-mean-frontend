import { Component, inject, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WishlistService } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';
import { BookService, Book } from '../../services/book.service';
import { Auth } from '../../core/services/auth';
import { LoginPromptService } from '../../services/login-prompt.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-wishlist-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wishlist-modal.component.html',
  styleUrl: './wishlist-modal.component.css',
})
export class WishlistModalComponent implements OnInit {
  public wishlistService = inject(WishlistService);
  public cartService = inject(CartService);
  private bookService = inject(BookService);
  private authService = inject(Auth);
  private loginPromptService = inject(LoginPromptService);
  @Output() close = new EventEmitter<void>();

  wishlistBooks = signal<Book[]>([]);
  loading = signal(true);
  addedToCartId = signal<string | null>(null);

  ngOnInit() {
    this.loadWishlistBooks();
    // Subscribe to future changes
    this.wishlistService.ids$.subscribe(() => {
      this.loadWishlistBooks();
    });
  }

  private loadWishlistBooks() {
    // Get current wishlist IDs directly from the service
    const ids = this.wishlistService.getIds();
    
    if (ids.length > 0) {
      this.loading.set(true);
      const bookRequests = ids.map((id: string) => this.bookService.getBookById(id));
      forkJoin(bookRequests).subscribe({
        next: (books) => {
          this.wishlistBooks.set(
            books
              .map((response) => response.data)
              .filter((book): book is Book => !!book)
          );
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
    } else {
      this.wishlistBooks.set([]);
      this.loading.set(false);
    }
  }

  closeModal() {
    this.close.emit();
  }

  removeFromWishlist(bookId: string) {
    this.wishlistService.remove(bookId);
  }

  addToCart(book: Book) {
    if (!this.authService.isLoggedIn()) {
      this.loginPromptService.show('Please sign in to add books to your shopping cart.');
      this.closeModal();
      return;
    }
    this.cartService.addItem(book, 1);
    this.addedToCartId.set(book._id);
    setTimeout(() => this.addedToCartId.set(null), 2000);
  }
}
