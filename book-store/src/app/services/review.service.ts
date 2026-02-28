import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Review {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: {
    _id?: string;
    firstName: string;
    lastName: string;
  };
  book: string;
}

export interface ReviewsResponse {
  status: string;
  len: number;
  data: Review[];
}

export interface OrderItem {
  book: { _id: string } | string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  items: OrderItem[];
}

export interface MyOrdersResponse {
  status: string;
  data: { orders: Order[]; total: number; message: string };
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

  getReviews(bookId: string): Observable<Review[]> {
    return this.http
      .get<ReviewsResponse>(`${this.baseUrl}/review`, { params: { book: bookId } })
      .pipe(map((res) => res.data));
  }

  addReview(bookId: string, rating: number, comment: string): Observable<Review> {
    return this.http
      .post<{ status: string; data: Review }>(`${this.baseUrl}/review`, {
        book: bookId,
        rating,
        comment,
      })
      .pipe(map((res) => res.data));
  }

  deleteReview(reviewId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/review/${reviewId}`);
  }

  /** Check if the logged-in user has bought this book by scanning their order history */
  checkPurchased(bookId: string): Observable<boolean> {
    return this.http.get<MyOrdersResponse>(`${this.baseUrl}/order/my-orders`).pipe(
      map((res) => {
        const orders: Order[] = res.data?.orders ?? [];
        return orders.some((order) =>
          order.items.some((item) => {
            const id = typeof item.book === 'string' ? item.book : item.book._id;
            return id === bookId;
          }),
        );
      }),
    );
  }
}
