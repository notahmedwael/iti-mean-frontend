import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeroSectionComponent } from '../shared/hero-section/hero-section.component';
import { BookService, Book } from '../services/book.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroSectionComponent,
    RouterLink,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private bookService = inject(BookService);
  private cartService = inject(CartService);

  latestBooks = signal<Book[]>([]);
  loadingBooks = signal(true);
  addedToCart = signal<string | null>(null);

  ngOnInit(): void {
    this.loadLatestBooks();
  }

  private loadLatestBooks(): void {
    this.bookService.getLatestBooks().subscribe({
      next: (res) => {
        this.latestBooks.set(res.data);
        this.loadingBooks.set(false);
      },
      error: (err) => {
        console.error('Failed to load latest books:', err);
        this.loadingBooks.set(false);
      },
    });
  }

  addToCart(book: Book): void {
    this.cartService.addItem(book, 1);
    this.addedToCart.set(book._id);
    setTimeout(() => {
      this.addedToCart.set(null);
    }, 2000);
  }
}