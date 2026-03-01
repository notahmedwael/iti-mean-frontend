import { Component, OnInit, signal, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BookService, Book, Category, Author } from '../../services/book.service';
import { firstValueFrom } from 'rxjs';

interface BookForm {
  name: string;
  price: number | null;
  stock: number | null;
  author: string;
  category: string;
}

type MiniModalType = 'author' | 'category' | null;

@Component({
  selector: 'app-admin-books',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './books.html',
  styleUrls: ['./books.css'],
})
export class AdminBooksComponent implements OnInit {
  private baseUrl = 'http://localhost:8000';

  // ── Book list signals
  books = signal<Book[]>([]);
  categories = signal<Category[]>([]);
  authors = signal<Author[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // ── Filters
  search = '';
  selectedCategory = '';
  selectedAuthor = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  // ── Pagination
  currentPage = 1;
  limit = 10;
  totalResults = 0;

  // ── Dropdown menu
  openMenuId: string | null = null;

  // ── Book modal state
  showModal = false;
  isEditing = false;
  editingId = '';
  submitting = signal(false);
  submitError = signal<string | null>(null);
  form: BookForm = { name: '', price: null, stock: null, author: '', category: '' };

  // ── Mini-modal state (Author / Category)
  miniModal: MiniModalType = null;
  miniEditing = false;
  miniEditingId = '';
  miniName = '';
  miniBio = '';
  miniSubmitting = signal(false);
  miniError = signal<string | null>(null);
  miniAuthorList = signal<Author[]>([]);
  miniCategoryList = signal<Category[]>([]);

  constructor(private bookService: BookService, private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchBooks();
    this.loadAuthorsAndCategories();
  }

  // ── Shared loader ─────────────────────────────
  loadAuthorsAndCategories(): void {
    this.bookService.getAllAuthors().subscribe({
      next: (r) => { this.authors.set(r.data); this.miniAuthorList.set(r.data); },
    });
    this.bookService.getAllCategories().subscribe({
      next: (r) => { this.categories.set(r.data); this.miniCategoryList.set(r.data); },
    });
  }

  // ── Books fetch ───────────────────────────────────────────────────────────
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
      next: (res) => { this.books.set(res.data); this.totalResults = res.len; this.loading.set(false); },
      error: () => { this.error.set('Failed to load books. Make sure the backend is running.'); this.loading.set(false); },
    });
  }

  // ── Filter/search handlers ────────────────────
  onSearch(): void { this.currentPage = 1; this.fetchBooks(); }
  onFilterChange(): void { this.currentPage = 1; this.fetchBooks(); }
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
  nextPage(): void { if (this.currentPage < this.totalPages) { this.currentPage++; this.fetchBooks(); } }
  prevPage(): void { if (this.currentPage > 1) { this.currentPage--; this.fetchBooks(); } }
  get totalPages(): number { return Math.max(1, Math.ceil(this.totalResults / this.limit)); }
  get hasActiveFilters(): boolean {
    return !!(this.search || this.selectedCategory || this.selectedAuthor || this.minPrice || this.maxPrice);
  }

  // ── Dropdown menu ─────────────────────────────
  toggleMenu(id: string, e: Event): void {
    e.stopPropagation();
    this.openMenuId = this.openMenuId === id ? null : id;
  }
  closeMenu(): void { this.openMenuId = null; }

  @HostListener('document:click')
  onDocClick(): void { this.closeMenu(); }

  // ── Book Modal ────────────────────────────────
  openCreate(): void {
    this.form = { name: '', price: null, stock: null, author: '', category: '' };
    this.isEditing = false;
    this.editingId = '';
    this.submitError.set(null);
    this.showModal = true;
  }

  openEdit(book: Book): void {
    this.isEditing = true;
    this.editingId = book._id;
    this.form = {
      name: book.name,
      price: book.price,
      stock: book.stock,
      author: (book.author as any)?._id ?? book.author,
      category: (book.category as any)?._id ?? book.category,
    };
    this.submitError.set(null);
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  @HostListener('keydown.escape')
  onEscape(): void { this.closeModal(); this.closeMiniModal(); }

  async submitForm(): Promise<void> {
    if (this.submitting()) return;
    const { name, price, stock, author, category } = this.form;
    if (!name?.trim() || price == null || stock == null || !author || !category) {
      this.submitError.set('All fields are required.');
      return;
    }
    this.submitError.set(null);
    this.submitting.set(true);
    try {
      const body = { name: name.trim(), price, stock, author, category };
      if (this.isEditing) {
        await firstValueFrom(this.http.patch(`${this.baseUrl}/book/${this.editingId}`, body));
      } else {
        await firstValueFrom(this.http.post(`${this.baseUrl}/book`, body));
      }
      this.submitting.set(false);
      this.closeModal();
      this.fetchBooks();
    } catch (err: any) {
      this.submitting.set(false);
      this.submitError.set(err?.error?.message ?? 'Failed to save book. Please try again.');
    }
  }

  // ── Admin actions ─────────────────────────────
  addBook(): void { this.openCreate(); }
  editBook(id: string): void {
    const book = this.books().find(b => b._id === id);
    if (book) this.openEdit(book);
    this.closeMenu();
  }
  deleteBook(id: string): void {
    const book = this.books().find(b => b._id === id);
    if (!confirm(`Delete "${book?.name ?? 'this book'}"? This cannot be undone.`)) return;
    this.http.delete(`${this.baseUrl}/book/${id}`).subscribe({
      next: () => this.fetchBooks(),
      error: (err) => alert(err?.error?.message ?? 'Failed to delete book.'),
    });
    this.closeMenu();
  }

  // ── Mini Modal (Author / Category) ───────────
  openMiniModal(type: MiniModalType): void {
    this.miniModal = type;
    this.miniEditing = false;
    this.miniEditingId = '';
    this.miniName = '';
    this.miniBio = '';
    this.miniError.set(null);
  }

  closeMiniModal(): void {
    this.miniModal = null;
    this.cancelEditMini();
  }

  startEditMini(item: Author | Category): void {
    this.miniEditing = true;
    this.miniEditingId = item._id;
    this.miniName = item.name;
    this.miniBio = (item as Author).bio ?? '';
    this.miniError.set(null);
  }

  cancelEditMini(): void {
    this.miniEditing = false;
    this.miniEditingId = '';
    this.miniName = '';
    this.miniBio = '';
  }

  async submitMini(): Promise<void> {
    if (this.miniSubmitting() || !this.miniName.trim()) {
      this.miniError.set('Name is required.');
      return;
    }
    this.miniError.set(null);
    this.miniSubmitting.set(true);
    const isAuthor = this.miniModal === 'author';
    const endpoint = isAuthor ? `${this.baseUrl}/author` : `${this.baseUrl}/category`;
    const body: any = { name: this.miniName.trim() };
    if (isAuthor && this.miniBio.trim()) body.bio = this.miniBio.trim();
    try {
      if (this.miniEditing) {
        await firstValueFrom(this.http.patch(`${endpoint}/${this.miniEditingId}`, body));
      } else {
        await firstValueFrom(this.http.post(endpoint, body));
      }
      this.miniSubmitting.set(false);
      this.cancelEditMini();
      this.loadAuthorsAndCategories();
    } catch (err: any) {
      this.miniSubmitting.set(false);
      this.miniError.set(err?.error?.message ?? 'Failed. Please try again.');
    }
  }

  deleteMini(id: string): void {
    const isAuthor = this.miniModal === 'author';
    const label = isAuthor ? 'author' : 'category';
    if (!confirm(`Delete this ${label}? Books assigned to it may be affected.`)) return;
    const endpoint = isAuthor ? `${this.baseUrl}/author/${id}` : `${this.baseUrl}/category/${id}`;
    this.http.delete(endpoint).subscribe({
      next: () => this.loadAuthorsAndCategories(),
      error: (err) => alert(err?.error?.message ?? `Failed to delete ${label}.`),
    });
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
