import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  _id: string;
  book: string;
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    name?: string;
  };
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsResponse {
  status: string;
  len: number;
  data: Review[];
}

export interface ReviewResponse {
  status: string;
  len: number;
  data: Review;
}

export interface CreateReviewPayload {
  book: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewPayload {
  rating?: number;
  comment?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  getReviewsByBook(bookId: string): Observable<ReviewsResponse> {
    return this.http.get<ReviewsResponse>(
      `${this.baseUrl}/review?book=${bookId}`
    );
  }

  createReview(review: CreateReviewPayload): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(`${this.baseUrl}/review`, review);
  }

  updateReview(
    reviewId: string,
    update: UpdateReviewPayload
  ): Observable<ReviewResponse> {
    return this.http.patch<ReviewResponse>(
      `${this.baseUrl}/review/${reviewId}`,
      update
    );
  }

  deleteReview(reviewId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/review/${reviewId}`);
  }
}
