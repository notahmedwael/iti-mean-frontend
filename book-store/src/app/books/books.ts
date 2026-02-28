import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { BookService, Book, Category, Author } from '../services/book.service';

const CATEGORY_TABS = ['All Books', 'Classic Fiction', 'Mystery', 'Science Fiction', 'Romance', 'Philosophy', 'Biography', 'Poetry', 'Self-Help', 'History'];

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe, TitleCasePipe],
  templateUrl: './books.html',
  styleUrl: './books.css',
})
export class Books implements OnInit {
  books = signal<Book[]>([]);
  categories = signal<Category[]>([]);
  authors = signal<Author[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // category tabs
  categoryTabs = CATEGORY_TABS;
  activeTab = 'All Books';

  // sidebar filters
  search = '';
  selectedCategory = '';   // single category ID sent to API
  selectedAuthor = '';     // single author ID sent to API
  minPrice: number | null = null;
  maxPrice: number | null = null;
  authorsOpen = true;
  priceOpen = true;
  categoriesOpen = true;

  // sort & view
  sortBy = 'createdAt';  // backend sort param — oldest first by default
  viewMode: 'grid' | 'list' = 'grid';

  readonly sortOptions: { label: string; value: string }[] = [
    { label: 'Oldest First', value: 'createdAt' },
    { label: 'Newest First', value: '-createdAt' },
    { label: 'Top Rated', value: '-ratingsAverage' },
    { label: 'Lowest Rated', value: 'ratingsAverage' },
    { label: 'Title A → Z', value: 'name' },
    { label: 'Title Z → A', value: '-name' },
    { label: 'Price Low → High', value: 'price' },
    { label: 'Price High → Low', value: '-price' },
  ];

  // pagination
  currentPage = 1;
  limit = 12;
  totalResults = 0;

  constructor(private bookService: BookService) { }

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
      sort: this.sortBy || undefined,
      category: this.selectedCategory || undefined,   // ✅ sent to API
      author: this.selectedAuthor || undefined,       // ✅ sent to API
      minPrice: this.minPrice ?? undefined,
      maxPrice: this.maxPrice ?? undefined,
    }).subscribe({
      next: (res) => {
        this.books.set(res.data);
        this.totalResults = res.len;
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load books.');
        this.loading.set(false);
      },
    });
  }

  fetchCategories(): void {
    this.bookService.getAllCategories().subscribe({
      next: (res) => this.categories.set(res.data),
      error: () => { },
    });
  }

  fetchAuthors(): void {
    this.bookService.getAllAuthors().subscribe({
      next: (res) => this.authors.set(res.data),
      error: () => { },
    });
  }

  onTabChange(tab: string): void {
    this.activeTab = tab;
    this.currentPage = 1;
    this.fetchBooks();
  }

  onCategoryChange(id: string): void {
    // toggle off if same category clicked again
    this.selectedCategory = this.selectedCategory === id ? '' : id;
    this.currentPage = 1;
    this.fetchBooks();
  }

  onAuthorChange(): void {
    this.currentPage = 1;
    this.fetchBooks();
  }

  onSortChange(): void {
    this.currentPage = 1;
    this.fetchBooks();
  }

  onClearFilters(): void {
    this.selectedCategory = '';
    this.selectedAuthor = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.search = '';
    this.currentPage = 1;
    this.fetchBooks();
  }

  onApplyFilters(): void {
    this.currentPage = 1;
    this.fetchBooks();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) { this.currentPage++; this.fetchBooks(); }
  }

  prevPage(): void {
    if (this.currentPage > 1) { this.currentPage--; this.fetchBooks(); }
  }

  get totalPages(): number { return Math.ceil(this.totalResults / this.limit); }
  get activeFilterCount(): number {
    return (this.selectedCategory ? 1 : 0) + (this.selectedAuthor ? 1 : 0);
  }
  get hasActiveFilters(): boolean { return this.activeFilterCount > 0 || !!this.search; }

  // Price helpers
  getOriginalPrice(price: number): string { return (price * 1.3).toFixed(2); }

  // Stars — uses real ratingsAverage from API
  filledStars(rating: number): number[] { return Array(Math.round(rating || 0)).fill(0); }
  emptyStars(rating: number): number[] { return Array(5 - Math.round(rating || 0)).fill(0); }
}