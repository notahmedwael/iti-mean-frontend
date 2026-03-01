import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Auth } from '../../core/services/auth';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { LoginPromptService } from '../../services/login-prompt.service';
import { CartModalComponent } from '../cart-modal/cart-modal.component';
import { WishlistModalComponent } from '../wishlist-modal/wishlist-modal.component';
import { LoginPromptModalComponent } from '../login-prompt-modal/login-prompt-modal.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AsyncPipe,
    CartModalComponent,
    WishlistModalComponent,
    LoginPromptModalComponent,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent {
  public authService = inject(Auth);
  public cartService = inject(CartService);
  public wishlistService = inject(WishlistService);
  public loginPromptService = inject(LoginPromptService);
  private router = inject(Router);

  showCartModal = signal(false);
  showWishlistModal = signal(false);
  showMobileMenu = signal(false);

  toggleMobileMenu() {
    this.showMobileMenu.update(v => !v);
  }

  logout() {
    this.authService.logout();
    this.showMobileMenu.set(false);
    this.router.navigate(['/']);
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
