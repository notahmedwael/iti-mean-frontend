import { Component, signal, Signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService, Book } from '../../services/book.service';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductListItemComponent } from '../product-list-item/product-list-item.component';
import { QuickViewModalComponent } from '../quick-view-modal/quick-view-modal.component';

const SORT_OPTIONS = ['Most Popular', 'Price: Low to High', 'Price: High to Low', 'Top Rated', 'Newest'];

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProductCardComponent,
    ProductListItemComponent,
    QuickViewModalComponent,
  ],
  template: `
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      <div class="text-sm text-[#8A7260]">
        Showing <span class="font-bold text-[#602314]">{{ books().length }}</span> results
      </div>

      <div class="flex gap-3 items-center flex-wrap">
        <!-- Sort Dropdown -->
        <select
          [(ngModel)]="sortBy"
          (change)="sortBooks()"
          class="px-4 py-2 border border-[#602314]/20 rounded-lg text-sm text-[#602314]
                 bg-white hover:border-[#602314]/40 transition"
        >
          @for (option of sortOptions; track option) {
            <option>{{ option }}</option>
          }
        </select>

        <!-- View Toggle -->
        <div class="flex gap-2 bg-[#FAF6F0] rounded-lg p-1">
          <button
            (click)="view = 'grid'"
            [class]="
              'px-3 py-2 rounded text-sm font-medium transition-all ' +
              (view === 'grid'
                ? 'bg-white text-[#BC552A] shadow-sm'
                : 'text-[#8A7260] hover:text-[#602314]')
            "
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"
              />
            </svg>
          </button>
          <button
            (click)="view = 'list'"
            [class]="
              'px-3 py-2 rounded text-sm font-medium transition-all ' +
              (view === 'list'
                ? 'bg-white text-[#BC552A] shadow-sm'
                : 'text-[#8A7260] hover:text-[#602314]')
            "
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Trending Header -->
    <div class="flex items-center gap-2 mb-6">
      <svg class="w-5 h-5 text-[#DD9047]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23 3L9.83 16.17h0M23 3l-3.97 16.97a4 4 0 0 1-5.66 2.66L3 13.34a4 4 0 0 1-.66-5.66L16.17 9.83" />
      </svg>
      <h2 class="font-bold text-[#602314]">Trending Now</h2>
    </div>

    <!-- Grid View -->
    @if (view === 'grid') {
      <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        @for (book of books(); track book._id) {
          <app-product-card
            [book]="book"
            (quickView)="selectBook($event)"
          ></app-product-card>
        }
      </div>
    }

    <!-- List View -->
    @if (view === 'list') {
      <div class="space-y-3 mb-8">
        @for (book of books(); track book._id) {
          <app-product-list-item
            [book]="book"
            (quickView)="selectBook($event)"
          ></app-product-list-item>
        }
      </div>
    }

    <!-- Quick View Modal -->
    @if (selectedBook) {
      <app-quick-view-modal
        [book]="selectedBook"
        (close)="closeQuickView()"
      ></app-quick-view-modal>
    }
  `,
})
export class ProductGridComponent implements OnInit {
  private bookService = new BookService(null as any);
  
  books = signal<Book[]>([]);
  sortOptions = SORT_OPTIONS;

  view: 'grid' | 'list' = 'grid';
  sortBy = 'Most Popular';
  selectedBook: Book | null = null;

  constructor(bookService: BookService) {
    this.bookService = bookService;
  }

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.bookService.getAllBooks().subscribe({
      next: (response) => {
        this.books.set(response.data);
      },
      error: (err) => {
        console.error('Error loading books:', err);
        this.books.set([]);
      }
    });
  }

  sortBooks(): void {
    const sorted = [...this.books()];
    switch (this.sortBy) {
      case 'Price: Low to High':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'Price: High to Low':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'Top Rated':
        // Would need rating field from backend
        break;
      case 'Newest':
        // Would need createdAt field from backend
        break;
      default:
        break;
    }
    this.books.set(sorted);
  }

  selectBook(book: Book): void {
    this.selectedBook = book;
  }

  closeQuickView(): void {
    this.selectedBook = null;
  }
}
