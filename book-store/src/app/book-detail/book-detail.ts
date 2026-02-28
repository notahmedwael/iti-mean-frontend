import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe, TitleCasePipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService, Book } from '../services/book.service';
import { ReviewService, Review } from '../services/review.service';
import { Auth } from '../core/services/auth';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe, TitleCasePipe, DatePipe, FormsModule],
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.css',
})
export class BookDetail implements OnInit {
  book = signal<Book | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  // Reviews
  reviews = signal<Review[]>([]);
  reviewsLoading = signal(false);
  hasPurchased = signal(false);

  // Add review form
  newRating = 0;
  hoverRating = 0;
  newComment = '';
  submitting = signal(false);
  submitError = signal<string | null>(null);
  submitSuccess = signal(false);

  get originalPrice(): number {
    return this.book() ? parseFloat((this.book()!.price * 1.32).toFixed(2)) : 0;
  }

  get discountPercent(): number { return 32; }

  get starsArray(): number[] { return [1, 2, 3, 4, 5]; }

  get publishedYear(): string {
    const d = this.book()?.createdAt;
    return d ? new Date(d).getFullYear().toString() : '—';
  }

  get averageRating(): number {
    return this.book()?.ratingsAverage ?? 0;
  }

  get reviewCount(): number {
    return this.book()?.ratingsQuantity ?? 0;
  }

  /** Returns filled stars count (1–5 rounded) */
  filledStars(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }

  emptyStarsFor(rating: number): number[] {
    return Array(5 - Math.round(rating)).fill(0);
  }

  isOwnReview(review: Review): boolean {
    const uid = this.authService.getUserId();
    return !!uid && review.user?._id === uid;
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
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
    private reviewService: ReviewService,
    private authService: Auth,
  ) { }

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
        this.loadReviews(id);
      },
      error: () => {
        this.error.set('Book not found or failed to load.');
        this.loading.set(false);
      },
    });
  }

  private loadReviews(bookId: string): void {
    this.reviewsLoading.set(true);

    // If logged in, also check purchase status in parallel
    const purchase$ = this.authService.isLoggedIn()
      ? this.reviewService.checkPurchased(bookId).pipe(catchError(() => of(false)))
      : of(false);

    forkJoin({
      reviews: this.reviewService.getReviews(bookId).pipe(catchError(() => of([]))),
      purchased: purchase$,
    }).subscribe(({ reviews, purchased }) => {
      this.reviews.set(reviews);
      this.hasPurchased.set(purchased);
      this.reviewsLoading.set(false);
    });
  }

  setRating(star: number): void {
    this.newRating = star;
  }

  submitReview(): void {
    if (this.submitting() || this.newRating === 0) return;
    const bookId = this.book()?._id;
    if (!bookId) return;

    this.submitError.set(null);
    this.submitting.set(true);

    this.reviewService.addReview(bookId, this.newRating, this.newComment).subscribe({
      next: (review) => {
        // Refresh reviews from API to get populated user name
        this.reviewService.getReviews(bookId).subscribe({
          next: (reviews) => this.reviews.set(reviews),
          error: () => { },
        });
        this.newRating = 0;
        this.newComment = '';
        this.submitSuccess.set(true);
        this.submitting.set(false);
        setTimeout(() => this.submitSuccess.set(false), 3000);
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Failed to submit review.';
        this.submitError.set(msg);
        this.submitting.set(false);
      },
    });
  }

  deleteReview(reviewId: string): void {
    if (!confirm('Delete your review?')) return;
    const bookId = this.book()?._id;
    this.reviewService.deleteReview(reviewId).subscribe({
      next: () => {
        this.reviews.set(this.reviews().filter((r) => r._id !== reviewId));
      },
      error: () => alert('Failed to delete review.'),
    });
  }
}