import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { BookService, Book } from '../services/book.service';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe, TitleCasePipe],
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.css',
})
export class BookDetail implements OnInit {
  book = signal<Book | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  // All zeros until reviews API is ready (Hashim's task)
  rating = 0;
  reviewCount = 0;
  soldCount = 0;

  get originalPrice(): number {
    return this.book() ? parseFloat((this.book()!.price * 1.32).toFixed(2)) : 0;
  }

  get discountPercent(): number { return 32; }

  get emptyStars(): number[] { return Array(5).fill(0); }

  get publishedYear(): string {
    const d = this.book()?.createdAt;
    return d ? new Date(d).getFullYear().toString() : '—';
  }

  // Cloudinary URL transform: crop + fill to fixed size for consistent card display
  getCoverUrl(url: string, w = 400, h = 560): string {
    if (!url || !url.includes('cloudinary.com')) return url;
    return url.replace('/upload/', `/upload/c_fill,w_${w},h_${h},q_auto,f_auto/`);
  }

  // Blurred background version — lower quality, larger size
  getBlurredBg(url: string): string {
    if (!url || !url.includes('cloudinary.com')) return url;
    return url.replace('/upload/', '/upload/c_fill,w_1400,h_700,q_30,e_blur:800,f_auto/');
  }

  constructor(
    private route: ActivatedRoute,
    private bookService: BookService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Invalid book ID.');
      this.loading.set(false);
      return;
    }
    this.bookService.getBookById(id).subscribe({
      next: (res) => {
        this.book.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Book not found or failed to load.');
        this.loading.set(false);
      },
    });
  }
}