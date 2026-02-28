import { Component, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PaginationComponent } from '../shared/pagination/pagination';
import { BookService, Book, Author, Category } from '../../services/book.service';
import { firstValueFrom } from 'rxjs';

// ── Types ────────────────────────────────────────────
interface BookForm {
  name: string;
  price: number | null;
  stock: number | null;
  author: string;
  category: string;
}

interface CloudinarySignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

type MiniModalType = 'author' | 'category' | null;

@Component({
  selector: 'app-admin-books',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './books.html',
  styleUrls: ['./books.css'],
})
export class AdminBooksComponent implements OnInit {
  private baseUrl = 'http://localhost:8000';

  // ── Books Data ───────────────────────────────────
  books = signal<Book[]>([]);
  authors = signal<Author[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // ── Pagination ───────────────────────────────────
  currentPage = 1;
  limit = 10;
  totalResults = 0;

  // ── Filters (books table) ────────────────────────
  searchTerm = '';
  filterAuthor = '';
  filterCategory = '';

  // ── Book Modal ────────────────────────────────────
  showModal = false;
  isEditing = false;
  editingId = '';
  submitting = signal(false);
  submitError = signal<string | null>(null);
  uploadProgress = signal<string | null>(null);

  form: BookForm = { name: '', price: null, stock: null, author: '', category: '' };

  // Cover upload state
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  uploadedCoverUrl: string | null = null;
  existingCoverUrl: string | null = null;

  // ── Mini Modal (Author / Category) ───────────────
  miniModal: MiniModalType = null;
  miniEditing = false;
  miniEditingId = '';
  miniName = '';
  miniBio = '';    // author only
  miniSubmitting = signal(false);
  miniError = signal<string | null>(null);

  /** List for table inside mini-modal */
  miniAuthorList = signal<Author[]>([]);
  miniCategoryList = signal<Category[]>([]);

  constructor(private http: HttpClient, private bookService: BookService) { }

  ngOnInit(): void {
    this.fetchBooks();
    this.loadAuthorsAndCategories();
  }

  // ── Shared loader ─────────────────────────────────
  loadAuthorsAndCategories(): void {
    this.bookService.getAllAuthors().subscribe({
      next: (r) => {
        this.authors.set(r.data);
        this.miniAuthorList.set(r.data);
      }
    });
    this.bookService.getAllCategories().subscribe({
      next: (r) => {
        this.categories.set(r.data);
        this.miniCategoryList.set(r.data);
      }
    });
  }

  // ── Books Fetch ───────────────────────────────────
  fetchBooks(): void {
    this.loading.set(true);
    this.error.set(null);
    let params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('limit', this.limit.toString());
    if (this.searchTerm) params = params.set('search', this.searchTerm);
    if (this.filterAuthor) params = params.set('author', this.filterAuthor);
    if (this.filterCategory) params = params.set('category', this.filterCategory);

    this.http.get<{ status: string; len: number; data: Book[] }>(`${this.baseUrl}/book`, { params })
      .subscribe({
        next: (res) => { this.books.set(res.data); this.totalResults = res.len; this.loading.set(false); },
        error: () => { this.error.set('Failed to load books.'); this.loading.set(false); },
      });
  }

  onFilterChange(): void { this.currentPage = 1; this.fetchBooks(); }
  onClearFilters(): void {
    this.searchTerm = '';
    this.filterAuthor = '';
    this.filterCategory = '';
    this.currentPage = 1;
    this.fetchBooks();
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.filterAuthor || this.filterCategory);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) { this.currentPage = page; this.fetchBooks(); }
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.totalResults / this.limit)); }

  // ── File Input ────────────────────────────────────
  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (!file) return;
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.selectedFile = file;
    this.previewUrl = URL.createObjectURL(file);
    this.uploadedCoverUrl = null;
  }

  private async uploadToCloudinary(): Promise<string> {
    this.uploadProgress.set('Getting upload signature…');
    const sig = await firstValueFrom(
      this.http.get<CloudinarySignature>(`${this.baseUrl}/upload/signature`)
    );
    this.uploadProgress.set('Uploading to Cloudinary…');
    const fd = new FormData();
    fd.append('file', this.selectedFile!);
    fd.append('api_key', sig.apiKey);
    fd.append('timestamp', sig.timestamp.toString());
    fd.append('signature', sig.signature);
    fd.append('folder', sig.folder);
    const result = await firstValueFrom(
      this.http.post<{ secure_url: string }>(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, fd)
    );
    this.uploadProgress.set(null);
    return result.secure_url;
  }

  // ── Book Modal ────────────────────────────────────
  openCreate(): void {
    this.isEditing = false;
    this.editingId = '';
    this.form = { name: '', price: null, stock: null, author: '', category: '' };
    this._resetFile();
    this.existingCoverUrl = null;
    this.submitError.set(null);
    this.uploadProgress.set(null);
    this.showModal = true;
  }

  openEdit(book: Book): void {
    this.isEditing = true;
    this.editingId = book._id;
    this.form = { name: book.name, price: book.price, stock: book.stock, author: book.author?._id ?? '', category: book.category?._id ?? '' };
    this._resetFile();
    this.existingCoverUrl = book.cover;
    this.submitError.set(null);
    this.uploadProgress.set(null);
    this.showModal = true;
  }

  private _resetFile(): void {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.selectedFile = null; this.previewUrl = null; this.uploadedCoverUrl = null;
  }

  closeModal(): void { this.showModal = false; this._resetFile(); }

  @HostListener('keydown.escape')
  onEscape(): void { this.closeModal(); this.closeMiniModal(); }

  async submitForm(): Promise<void> {
    if (this.submitting()) return;
    if (!this.isEditing && !this.selectedFile) { this.submitError.set('Please select a cover image.'); return; }
    this.submitError.set(null);
    this.submitting.set(true);
    try {
      const coverUrl = this.selectedFile ? await this.uploadToCloudinary() : this.existingCoverUrl!;
      const body = { name: this.form.name.trim(), cover: coverUrl, price: this.form.price, stock: this.form.stock, author: this.form.author, category: this.form.category };
      const req$ = this.isEditing ? this.http.patch(`${this.baseUrl}/book/${this.editingId}`, body) : this.http.post(`${this.baseUrl}/book`, body);
      await firstValueFrom(req$);
      this.submitting.set(false);
      this.closeModal();
      this.fetchBooks();
    } catch (err: any) {
      this.submitting.set(false);
      this.uploadProgress.set(null);
      this.submitError.set(err?.error?.message ?? 'Failed to save book. Please try again.');
    }
  }

  deleteBook(book: Book): void {
    if (!confirm(`Delete "${book.name}"? This cannot be undone.`)) return;
    this.http.delete(`${this.baseUrl}/book/${book._id}`).subscribe({
      next: () => this.fetchBooks(),
      error: () => alert('Failed to delete book.'),
    });
  }

  get currentPreview(): string | null {
    return this.previewUrl ?? this.uploadedCoverUrl ?? this.existingCoverUrl ?? null;
  }

  // ── Mini Modal (Author / Category) ──────────────
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
    this.miniEditing = false;
    this.miniName = '';
    this.miniBio = '';
    this.miniError.set(null);
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
      // Refresh the list
      this.loadAuthorsAndCategories();
    } catch (err: any) {
      this.miniSubmitting.set(false);
      this.miniError.set(err?.error?.message ?? 'Failed. Please try again.');
    }
  }

  deleteMini(id: string): void {
    const isAuthor = this.miniModal === 'author';
    const label = isAuthor ? 'author' : 'category';
    if (!confirm(`Delete this ${label}? This will fail if books are still assigned to it.`)) return;
    const endpoint = isAuthor ? `${this.baseUrl}/author/${id}` : `${this.baseUrl}/category/${id}`;
    this.http.delete(endpoint).subscribe({
      next: () => this.loadAuthorsAndCategories(),
      error: (err) => alert(err?.error?.message ?? `Failed to delete ${label}.`),
    });
  }
}
