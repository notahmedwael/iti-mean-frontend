import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BookService, Book } from '../services/book.service';
import { ReviewService, Review } from '../services/review.service';
import { CartService } from '../services/cart.service';
import { WishlistService } from '../services/wishlist.service';
import { Auth } from '../core/services/auth';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.css',
})
export class BookDetail implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private bookService = inject(BookService);
  private reviewService = inject(ReviewService);
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private formBuilder = inject(FormBuilder);
  private authService = inject(Auth);
  private destroy$ = new Subject<void>();

  book = signal<Book | null>(null);
  reviews = signal<Review[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  reviewForm!: FormGroup;
  submittingReview = signal(false);
  reviewSubmitted = signal(false);
  isWishlisted = signal(false);
  addedToCart = signal(false);
  currentUserId = signal<string | null>(null);
  reviewToDelete = signal<string | null>(null);
  deletingReview = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Invalid book ID.');
      this.loading.set(false);
      return;
    }
    this.currentUserId.set(this.authService.getUserId());
    this.loadBook(id);
    this.loadReviews(id);
    this.initializeReviewForm();
    
    // Subscribe to wishlist changes
    this.wishlistService.ids$
      .pipe(takeUntil(this.destroy$))
      .subscribe(ids => {
        this.isWishlisted.set(id ? ids.includes(id) : false);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeReviewForm(): void {
    this.reviewForm = this.formBuilder.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: [
        '',
        [
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
    });
  }

  private loadBook(bookId: string): void {
    this.loading.set(true);
    this.bookService.getBookById(bookId).subscribe({
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

  private loadReviews(bookId: string): void {
    this.reviewService.getReviewsByBook(bookId).subscribe({
      next: (res) => {
        this.reviews.set(res.data);
      },
      error: (err) => {
        console.error('Failed to load reviews:', err);
        this.reviews.set([]);
      },
    });
  }

  addToCart(): void {
    if (this.book()) {
      this.cartService.addItem(this.book()!);
      this.addedToCart.set(true);
      setTimeout(() => {
        this.addedToCart.set(false);
      }, 2000);
    }
  }

  toggleWishlist(): void {
    if (this.book()) {
      this.wishlistService.toggle(this.book()!._id);
      // Signal will be updated automatically via subscription
    }
  }

  submitReview(): void {
    if (
      !this.book() ||
      this.reviewForm.invalid ||
      this.submittingReview()
    ) {
      return;
    }

    this.submittingReview.set(true);
    const reviewPayload = {
      book: this.book()!._id,
      rating: this.reviewForm.get('rating')?.value,
      comment: this.reviewForm.get('comment')?.value || undefined,
    };

    this.reviewService.createReview(reviewPayload).subscribe({
      next: (res) => {
        this.reviews.set([res.data, ...this.reviews()]);
        this.reviewForm.reset({ rating: 5, comment: '' });
        this.submittingReview.set(false);
        this.reviewSubmitted.set(true);
        setTimeout(() => {
          this.reviewSubmitted.set(false);
        }, 3000);
      },
      error: (err) => {
        console.error('Failed to submit review:', err);
        this.submittingReview.set(false);
      },
    });
  }

  deleteReview(reviewId: string): void {
    this.reviewToDelete.set(reviewId);
  }

  confirmDeleteReview(): void {
    const reviewId = this.reviewToDelete();
    if (!reviewId) return;

    this.deletingReview.set(true);
    this.reviewService.deleteReview(reviewId).subscribe({
      next: () => {
        this.reviews.set(
          this.reviews().filter((r) => r._id !== reviewId)
        );
        this.reviewToDelete.set(null);
        this.deletingReview.set(false);
      },
      error: (err) => {
        console.error('Failed to delete review:', err);
        this.deletingReview.set(false);
      },
    });
  }

  cancelDeleteReview(): void {
    this.reviewToDelete.set(null);
  }

  isOwnReview(review: Review): boolean {
    return this.currentUserId() === review.user?._id;
  }

  getRatingStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  getAverageRating(): number {
    if (this.reviews().length === 0) return 0;
    const sum = this.reviews().reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / this.reviews().length) * 10) / 10;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}