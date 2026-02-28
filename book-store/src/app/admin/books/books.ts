import { Component, OnInit, signal, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BookService, Book, Category, Author } from '../../services/book.service';

@Component({
  selector: 'app-admin-books',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './books.html',
  styleUrls: ['./books.css'],
})
export class AdminBooksComponent implements OnInit {
  // ── Signals (same as user Books)
  books = signal<Book[]>([]);
  categories = signal<Category[]>([]);
  authors = signal<Author[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Filters
  search = '';
  selectedCategory = '';
  selectedAuthor = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  // ── Pagination ────────────────────────────────
  currentPage = 1;
  limit = 10;
  totalResults = 0;

  // ── Admin state ───────────────────────────────
  openMenuId: string | null = null;

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.fetchBooks();
    this.fetchCategories();
    this.fetchAuthors();
  }

  // ── Data fetching (same as user Books) ────────
  fetchBooks(): void {
    this.loading.set(true);
    this.error.set(null);

    this.bookService
      .getAllBooks({
        page: this.currentPage,
        limit: this.limit,
        search: this.search || undefined,
        category: this.selectedCategory || undefined,
        author: this.selectedAuthor || undefined,
        minPrice: this.minPrice ?? undefined,
        maxPrice: this.maxPrice ?? undefined,
      })
      .subscribe({
        next: (res) => {
          this.books.set(res.data);
          this.totalResults = res.len;
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to load books. Make sure the backend is running.');
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

  // ── Filter/search handlers ────────────────────
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

  // ── Pagination ────────────────────────────────
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
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

  get totalPages(): number {
    return Math.ceil(this.totalResults / this.limit);
  }
  get hasActiveFilters(): boolean {
    return !!(
      this.search ||
      this.selectedCategory ||
      this.selectedAuthor ||
      this.minPrice ||
      this.maxPrice
    );
  }

  // ── Admin actions ─────────────────────────────
  addBook(): void {
    console.log('TODO: open Add Book modal');
  }

  editBook(id: string): void {
    console.log('TODO: open Edit Book modal for', id);
    this.closeMenu();
  }

  deleteBook(id: string): void {
    if (confirm('Are you sure you want to delete this book?')) {
      console.log('TODO: call DELETE /book/' + id);
      // After API call succeeds, refresh:
      // this.fetchBooks();
    }
    this.closeMenu();
  }

  // ── Dropdown menu ─────────────────────────────
  toggleMenu(id: string, e: Event): void {
    e.stopPropagation();
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  closeMenu(): void {
    this.openMenuId = null;
  }

  @HostListener('document:click')
  onDocClick(): void {
    this.closeMenu();
  }

  // ── Helpers ───────────────────────────────────
  stockClass(stock: number): string {
    if (stock === 0) return 'bg-red-50 text-red-800 border-red-200';
    if (stock < 10) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  stockLabel(stock: number): string {
    if (stock === 0) return 'Out of Stock';
    if (stock < 10) return 'Low Stock';
    return 'In Stock';
  }
}
