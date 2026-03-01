import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BookService, Book } from '../services/book.service';
import { ReviewService, Review } from '../services/review.service';
import { OrderService } from '../services/order.service';
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
  private route        = inject(ActivatedRoute);
  private bookService  = inject(BookService);
  private reviewService = inject(ReviewService);
  private orderService = inject(OrderService);
  private cartService  = inject(CartService);
  private wishlistService = inject(WishlistService);
  private formBuilder  = inject(FormBuilder);
  private authService  = inject(Auth);
  private destroy$     = new Subject<void>();

  book          = signal<Book | null>(null);
  reviews       = signal<Review[]>([]);
  loading       = signal(true);
  error         = signal<string | null>(null);

  // ── Review permission ──────────────────────────────
  // null = still checking, true = can review, false = cannot
  canReview         = signal<boolean | null>(null);
  checkingPermission = signal(false);
  // Has the logged-in user already posted a review on this book?
  hasAlreadyReviewed = signal(false);

  // ── Review form ────────────────────────────────────
  reviewForm!: FormGroup;
  submittingReview  = signal(false);
  reviewSubmitted   = signal(false);
  submitError       = signal<string | null>(null);

  // ── Delete review ──────────────────────────────────
  reviewToDelete  = signal<string | null>(null);
  deletingReview  = signal(false);

  // ── Misc ───────────────────────────────────────────
  isWishlisted  = signal(false);
  addedToCart   = signal(false);
  currentUserId = signal<string | null>(null);

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
    this.initReviewForm();

    // Only check review permission if the user is logged in
    if (this.authService.isLoggedIn()) {
      this.checkReviewPermission(id);
    }

    this.wishlistService.ids$
      .pipe(takeUntil(this.destroy$))
      .subscribe(ids => this.isWishlisted.set(id ? ids.includes(id) : false));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Data loading ───────────────────────────────────
  private loadBook(bookId: string): void {
    this.loading.set(true);
    this.bookService.getBookById(bookId).subscribe({
      next: (res) => { this.book.set(res.data); this.loading.set(false); },
      error: () => { this.error.set('Book not found or failed to load.'); this.loading.set(false); },
    });
  }

  private loadReviews(bookId: string): void {
    this.reviewService.getReviewsByBook(bookId).subscribe({
      next: (res) => {
        this.reviews.set(res.data);
        // Check if user already reviewed this book
        const uid = this.currentUserId();
        if (uid) {
          this.hasAlreadyReviewed.set(res.data.some(r => r.user?._id === uid));
        }
      },
      error: () => this.reviews.set([]),
    });
  }

  // ── Permission check ───────────────────────────────
  // Calls GET /order/can-review/:bookId
  // Backend checks: user has a Delivered order containing this book
  private checkReviewPermission(bookId: string): void {
    this.checkingPermission.set(true);
    this.orderService.canReviewBook(bookId).subscribe({
      next: (res: { canReview: boolean }) => {
        this.canReview.set(res.canReview);
        this.checkingPermission.set(false);
      },
      error: () => {
        this.canReview.set(false);
        this.checkingPermission.set(false);
      },
    });
  }

  // ── Review form ────────────────────────────────────
  private initReviewForm(): void {
    this.reviewForm = this.formBuilder.group({
      rating:  [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.minLength(10), Validators.maxLength(500)]],
    });
  }

  submitReview(): void {
    if (!this.book() || this.reviewForm.invalid || this.submittingReview()) return;

    this.submittingReview.set(true);
    this.submitError.set(null);

    const payload = {
      book:    this.book()!._id,
      rating:  this.reviewForm.get('rating')?.value,
      comment: this.reviewForm.get('comment')?.value || undefined,
    };

    this.reviewService.createReview(payload).subscribe({
      next: (res) => {
        this.reviews.set([res.data, ...this.reviews()]);
        this.reviewForm.reset({ rating: 5, comment: '' });
        this.submittingReview.set(false);
        this.reviewSubmitted.set(true);
        this.hasAlreadyReviewed.set(true);
        setTimeout(() => this.reviewSubmitted.set(false), 4000);
      },
      error: (err) => {
        this.submitError.set(err?.error?.message || 'Failed to post review. Please try again.');
        this.submittingReview.set(false);
      },
    });
  }

  // ── Delete review ──────────────────────────────────
  deleteReview(reviewId: string): void { this.reviewToDelete.set(reviewId); }
  cancelDeleteReview(): void          { this.reviewToDelete.set(null); }

  confirmDeleteReview(): void {
    const reviewId = this.reviewToDelete();
    if (!reviewId) return;
    this.deletingReview.set(true);

    this.reviewService.deleteReview(reviewId).subscribe({
      next: () => {
        this.reviews.set(this.reviews().filter(r => r._id !== reviewId));
        this.reviewToDelete.set(null);
        this.deletingReview.set(false);
        this.hasAlreadyReviewed.set(false); // they can now submit a new one
      },
      error: () => this.deletingReview.set(false),
    });
  }

  // ── Cart / Wishlist ────────────────────────────────
  addToCart(): void {
    if (!this.book()) return;
    this.cartService.addItem(this.book()!);
    this.addedToCart.set(true);
    setTimeout(() => this.addedToCart.set(false), 2000);
  }

  toggleWishlist(): void {
    if (this.book()) this.wishlistService.toggle(this.book()!._id);
  }

  // ── Helpers ────────────────────────────────────────
  isOwnReview(review: Review): boolean {
    return this.currentUserId() === review.user?._id;
  }

  getRatingStars(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  getAverageRating(): number {
    if (!this.reviews().length) return 0;
    const sum = this.reviews().reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / this.reviews().length) * 10) / 10;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  // Computed: can the review form be shown?
  // true only when: logged in + canReview = true + not already reviewed
  get showReviewForm(): boolean {
    return (
      this.authService.isLoggedIn() &&
      this.canReview() === true &&
      !this.hasAlreadyReviewed()
    );
  }

  // Explain why the form is hidden
  get reviewBlockReason(): string | null {
    if (!this.authService.isLoggedIn())   return 'login';
    if (this.checkingPermission())         return 'checking';
    if (this.canReview() === false)        return 'not_purchased';
    if (this.hasAlreadyReviewed())         return 'already_reviewed';
    return null;
  }
}