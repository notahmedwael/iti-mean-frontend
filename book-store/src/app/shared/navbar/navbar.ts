import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Auth } from '../../core/services/auth';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { CartModalComponent } from '../cart-modal/cart-modal.component';
import { WishlistModalComponent } from '../wishlist-modal/wishlist-modal.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AsyncPipe,
    CartModalComponent,
    WishlistModalComponent,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent {
  public authService = inject(Auth);
  public cartService = inject(CartService);
  public wishlistService = inject(WishlistService);
  private router = inject(Router);

  showCartModal = signal(false);
  showWishlistModal = signal(false);

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getCartCount() {
    return this.cartService.getTotalQuantity();
  }

  getWishlistCount() {
    return this.wishlistService.ids$;
  }

  openCartModal() {
    this.showCartModal.set(true);
  }

  closeCartModal() {
    this.showCartModal.set(false);
  }

  openWishlistModal() {
    this.showWishlistModal.set(true);
  }

  closeWishlistModal() {
    this.showWishlistModal.set(false);
  }

  scrollToLatestBooks() {
    setTimeout(() => {
      const element = document.querySelector('[data-latest-books]');
      element?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
}
