import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, AsyncPipe], // This makes the clickable links in your HTML work
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent {
  public authService = inject(Auth); // Public so we can use it in HTML
  private router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
