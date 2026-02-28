import { Component, OnInit, signal, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BookService, Book, Category, Author } from '../services/book.service';
import { CartService } from '../services/cart.service';
import { WishlistService } from '../services/wishlist.service';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './books.html',
  styleUrl: './books.css',
})
export class Books implements OnInit, AfterViewInit {
  books = signal<Book[]>([]);
  categories = signal<Category[]>([]);
  authors = signal<Author[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  addedToCart = signal<string | null>(null);
  wishlistIds = signal<string[]>([]);
  
  // Filters
  search = '';
  selectedCategory = '';
  selectedAuthor = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  // Pagination State
  currentPage = 1;
  limit = 12; // Using 12 as it divides well into 2, 3, and 4 column grids
  hasNextPage = false;

  constructor(
    private bookService: BookService,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  ngAfterViewInit(): void {
    this.wishlistService.ids$.subscribe(ids => this.wishlistIds.set(ids));
  }

  ngOnInit(): void {
    this.fetchBooks();
    this.fetchCategories();
    this.fetchAuthors();
  }

  fetchBooks(): void {
    this.loading.set(true);
    this.error.set(null);

    this.bookService.getAllBooks({
      page: this.currentPage,
      limit: this.limit,
      search: this.search || undefined,
      category: this.selectedCategory || undefined,
      author: this.selectedAuthor || undefined,
      minPrice: this.minPrice ?? undefined,
      maxPrice: this.maxPrice ?? undefined,
    }).subscribe({
      next: (res) => {
        this.books.set(res.data);
        
        // If the number of books returned equals our limit, 
        // we assume there is more data on the next page.
        this.hasNextPage = res.data.length === this.limit;
        
        this.loading.set(false);
        // Smooth scroll to top when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: () => {
        this.error.set('Failed to load books. Please check your connection.');
        this.loading.set(false);
      },
    });
  }

  fetchCategories(): void {
    this.bookService.getAllCategories().subscribe({
      next: (res) => this.categories.set(res.data),
      error: () => {},
    });
  }

  fetchAuthors(): void {
    this.bookService.getAllAuthors().subscribe({
      next: (res) => this.authors.set(res.data),
      error: () => {},
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.fetchBooks();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.fetchBooks();
  }

  onClearFilters(): void {
    this.search = '';
    this.selectedCategory = '';
    this.selectedAuthor = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.currentPage = 1;
    this.fetchBooks();
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      this.fetchBooks();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchBooks();
    }
  }

  get hasActiveFilters(): boolean {
    return !!(this.search || this.selectedCategory || this.selectedAuthor || this.minPrice || this.maxPrice);
  }

  addToCart(book: Book): void {
    this.cartService.addItem(book, 1);
    this.addedToCart.set(book._id);
    setTimeout(() => this.addedToCart.set(null), 2000);
  }

  toggleWishlist(book: Book): void {
    this.wishlistService.toggle(book._id);
  }

  isWishlisted(bookId: string): boolean {
    return this.wishlistIds().includes(bookId);
  }
}