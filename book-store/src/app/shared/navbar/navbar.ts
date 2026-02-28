import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Auth } from '../../core/services/auth';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, AsyncPipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent {
  public authService = inject(Auth);
  public cartService = inject(CartService);
  public wishlistService = inject(WishlistService);
  private router = inject(Router);

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
}
