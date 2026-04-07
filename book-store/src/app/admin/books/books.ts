import { Component, OnInit, signal, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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

type ModalMode =
  | 'none'
  | 'addBook'
  | 'editBook'
  | 'addCategory'
  | 'editCategory'
  | 'addAuthor'
  | 'editAuthor';

@Component({
  selector: 'app-admin-books',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './books.html',
  styleUrls: ['./books.css'],
})
export class AdminBooksComponent implements OnInit {
  // ── Data signals ──────────────────────────────────
  books = signal<Book[]>([]);
  categories = signal<Category[]>([]);
  authors = signal<Author[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // ── Filters ───────────────────────────────────────
  search = '';
  selectedCategory = '';
  selectedAuthor = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  // ── Pagination ────────────────────────────────────
  currentPage = 1;
  limit = 10;
  totalResults = 0;

  // ── Active tab (Books / Categories / Authors) ─────
  activeTab: 'books' | 'categories' | 'authors' = 'books';

  // ── Modal state ───────────────────────────────────
  modalMode: ModalMode = 'none';
  modalLoading = false;
  modalError = '';

  // Book form
  bookForm = { name: '', price: 0, stock: 1, author: '', category: '', cover: '' };
  editingBookId = '';
  coverFile: File | null = null;
  coverPreview = '';
  uploadingCover = false;

  // Category form
  categoryForm = { name: '' };
  editingCategoryId = '';

  // Author form
  authorForm = { name: '', bio: '' };
  editingAuthorId = '';

  constructor(
    private bookService: BookService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.fetchBooks();
    this.loadAuthorsAndCategories();
  }

  // ── Fetch methods ─────────────────────────────────
  fetchBooks(): void {
    this.loading.set(true);
    this.error.set(null);
<<<<<<< HEAD
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
          this.error.set('Failed to load books.');
          this.loading.set(false);
        },
      });
=======
    this.bookService.getAllBooks({
      page: this.currentPage, limit: this.limit,
      search: this.search || undefined,
      category: this.selectedCategory || undefined,
      author: this.selectedAuthor || undefined,
      minPrice: this.minPrice ?? undefined,
      maxPrice: this.maxPrice ?? undefined,
    }).subscribe({
      next: (res) => { this.books.set(res.data); this.totalResults = res.len ?? (res as any).total ?? (res as any).results ?? (res.data ? res.data.length : 0); this.loading.set(false); },
      error: () => { this.error.set('Failed to load books.'); this.loading.set(false); },
    });
>>>>>>> 50201485910a27417a9f8f2ac7d921a5f7176b67
  }

  loadAuthorsAndCategories(): void {
    this.bookService.getAllAuthors().subscribe({
      next: (r) => this.authors.set(r.data),
    });
    this.bookService.getAllCategories().subscribe({
      next: (r) => this.categories.set(r.data),
    });
  }

  fetchCategories(): void {
    this.bookService.getAllCategories().subscribe({
      next: (r) => this.categories.set(r.data),
    });
  }

  fetchAuthors(): void {
    this.bookService.getAllAuthors().subscribe({
      next: (r) => this.authors.set(r.data),
    });
  }

  // ── Filter/search ─────────────────────────────────
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

  // ── Pagination ────────────────────────────────────
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
    return Math.ceil(this.totalResults / this.limit) || 1;
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

  // ── Navigate to public book detail ───────────────
  goToBook(id: string): void {
    this.router.navigate(['/books', id]);
  }

  // ── Modal helpers ─────────────────────────────────
  openModal(mode: ModalMode): void {
    this.modalMode = mode;
    this.modalError = '';
    this.modalLoading = false;
  }

  closeModal(): void {
    this.modalMode = 'none';
    this.modalError = '';
    this.coverFile = null;
    this.coverPreview = '';
    this.bookForm = { name: '', price: 0, stock: 1, author: '', category: '', cover: '' };
    this.categoryForm = { name: '' };
    this.authorForm = { name: '', bio: '' };
    this.editingBookId = '';
    this.editingCategoryId = '';
    this.editingAuthorId = '';
  }

  get isModalOpen(): boolean {
    return this.modalMode !== 'none';
  }

  // ── BOOK modal actions ────────────────────────────
  openAddBook(): void {
    this.bookForm = { name: '', price: 0, stock: 1, author: '', category: '', cover: '' };
    this.coverPreview = '';
    this.coverFile = null;
    this.openModal('addBook');
  }

  openEditBook(book: Book): void {
    this.editingBookId = book._id;
    this.bookForm = {
      name: book.name,
      price: book.price,
      stock: book.stock,
      author: (book.author as any)?._id || (book.author as any),
      category: (book.category as any)?._id || (book.category as any),
      cover: book.cover,
    };
    this.coverPreview = book.cover;
    this.coverFile = null;
    this.openModal('editBook');
  }

  onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.coverFile = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => (this.coverPreview = e.target?.result as string);
    reader.readAsDataURL(this.coverFile);
  }

  // Upload to Cloudinary via signed upload
  async uploadCoverToCloudinary(): Promise<string> {
    if (!this.coverFile) return this.bookForm.cover;
    this.uploadingCover = true;

    try {
      const sig = await firstValueFrom(this.bookService.getUploadSignature());
      if (!sig?.cloudName || !sig?.apiKey || !sig?.signature || !sig?.timestamp) {
        throw new Error('Invalid Cloudinary signature response');
      }

      const formData = new FormData();
      formData.append('file', this.coverFile);
      formData.append('api_key', sig.apiKey);
      formData.append('timestamp', sig.timestamp.toString());
      formData.append('signature', sig.signature);
      formData.append('folder', sig.folder);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data?.secure_url) {
        const msg = data?.error?.message || 'Cloudinary upload failed';
        throw new Error(msg);
      }

      return data.secure_url;
    } catch (error: any) {
      throw new Error(error?.message || 'Cover upload failed');
    } finally {
      this.uploadingCover = false;
    }
  }

  async saveBook(): Promise<void> {
    this.modalLoading = true;
    this.modalError = '';
    try {
      const coverUrl = this.coverFile ? await this.uploadCoverToCloudinary() : this.bookForm.cover;

      if (!coverUrl) {
        throw new Error('Book cover upload failed. Please try again.');
      }

      const payload = { ...this.bookForm, cover: coverUrl };

      if (this.modalMode === 'addBook') {
        this.bookService.createBook(payload as any).subscribe({
          next: () => {
            this.closeModal();
            this.fetchBooks();
          },
          error: (e) => {
            this.modalError = e?.error?.message || 'Failed to create book.';
            this.modalLoading = false;
          },
        });
      } else {
        this.bookService.updateBook(this.editingBookId, payload).subscribe({
          next: () => {
            this.closeModal();
            this.fetchBooks();
          },
          error: (e) => {
            this.modalError = e?.error?.message || 'Failed to update book.';
            this.modalLoading = false;
          },
        });
      }
    } catch (err: any) {
      this.modalError = err;
      this.modalLoading = false;
    }
  }

  deleteBook(id: string): void {
    if (!confirm('Delete this book permanently?')) return;
    this.bookService.deleteBook(id).subscribe({
      next: () => this.fetchBooks(),
      error: (e) => alert(e?.error?.message || 'Failed to delete book.'),
    });
  }

  // ── CATEGORY modal actions ────────────────────────
  openAddCategory(): void {
    this.categoryForm = { name: '' };
    this.openModal('addCategory');
  }

  openEditCategory(cat: Category): void {
    this.editingCategoryId = cat._id;
    this.categoryForm = { name: cat.name };
    this.openModal('editCategory');
  }

  saveCategory(): void {
    this.modalLoading = true;
    this.modalError = '';
    if (this.modalMode === 'addCategory') {
      this.bookService.createCategory(this.categoryForm).subscribe({
        next: () => {
          this.closeModal();
          this.fetchCategories();
        },
        error: (e) => {
          this.modalError = e?.error?.message || 'Failed to create category.';
          this.modalLoading = false;
        },
      });
    } else {
      this.bookService.updateCategory(this.editingCategoryId, this.categoryForm).subscribe({
        next: () => {
          this.closeModal();
          this.fetchCategories();
        },
        error: (e) => {
          this.modalError = e?.error?.message || 'Failed to update category.';
          this.modalLoading = false;
        },
      });
    }
  }

  deleteCategory(id: string): void {
    if (!confirm('Delete this category? This will fail if books are assigned to it.')) return;
    this.bookService.deleteCategory(id).subscribe({
      next: () => this.fetchCategories(),
      error: (e) => alert(e?.error?.message || 'Cannot delete — books still assigned.'),
    });
  }

  // ── AUTHOR modal actions ──────────────────────────
  openAddAuthor(): void {
    this.authorForm = { name: '', bio: '' };
    this.openModal('addAuthor');
  }

  openEditAuthor(author: Author): void {
    this.editingAuthorId = author._id;
    this.authorForm = { name: author.name, bio: author.bio || '' };
    this.openModal('editAuthor');
  }

  saveAuthor(): void {
    this.modalLoading = true;
    this.modalError = '';
    if (this.modalMode === 'addAuthor') {
      this.bookService.createAuthor(this.authorForm).subscribe({
        next: () => {
          this.closeModal();
          this.fetchAuthors();
        },
        error: (e) => {
          this.modalError = e?.error?.message || 'Failed to create author.';
          this.modalLoading = false;
        },
      });
    } else {
      this.bookService.updateAuthor(this.editingAuthorId, this.authorForm).subscribe({
        next: () => {
          this.closeModal();
          this.fetchAuthors();
        },
        error: (e) => {
          this.modalError = e?.error?.message || 'Failed to update author.';
          this.modalLoading = false;
        },
      });
    }
  }

  deleteAuthor(id: string): void {
    if (!confirm('Delete this author? This will fail if books are assigned to them.')) return;
    this.bookService.deleteAuthor(id).subscribe({
      next: () => this.fetchAuthors(),
      error: (e) => alert(e?.error?.message || 'Cannot delete — books still assigned.'),
    });
  }

  // ── Helpers ───────────────────────────────────────
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

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.closeModal();
  }
}
