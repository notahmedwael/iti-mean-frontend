import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from './book.service';
import { environment } from '../../environments/environment';

export interface OrderItem {
  book: Book;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  totalAmount: number;
  orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: 'Credit Card' | 'Debit Card' | 'PayPal' | 'Bank Transfer';
  paymentStatus: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  shippingDetails: {
    firstName: string; lastName: string; email: string; phone: string;
    address: string; city: string; state: string; postalCode: string; country: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  status: string;
  data: { message: string; orders?: Order[]; data?: Order[]; total?: number; pagination?: any };
}

export interface OrderResponse {
  status: string;
  data: Order;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUserOrders(): Observable<OrdersResponse> {
    return this.http.get<OrdersResponse>(`${this.baseUrl}/order/my-orders`);
  }

  getOrderById(id: string): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.baseUrl}/order/${id}`);
  }

  createOrder(orderData: any): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.baseUrl}/order`, orderData);
  }

  updateOrderStatus(id: string, status: string): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(`${this.baseUrl}/order/${id}`, { status });
  }

  getAllOrders(filters: { page?: number; limit?: number; status?: string; paymentStatus?: string } = {}): Observable<OrdersResponse> {
    let params = new HttpParams();
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.status) params = params.set('status', filters.status);
    if (filters.paymentStatus) params = params.set('paymentStatus', filters.paymentStatus);
    return this.http.get<OrdersResponse>(`${this.baseUrl}/order/admin/all`, { params });
  }

  updateOrderStatusAdmin(id: string, orderStatus?: string, paymentStatus?: string): Observable<OrderResponse> {
    const body: any = {};
    if (orderStatus) body.orderStatus = orderStatus;
    if (paymentStatus) body.paymentStatus = paymentStatus;
    return this.http.patch<OrderResponse>(`${this.baseUrl}/order/admin/update/${id}`, body);
  }

  // Check if logged-in user has a Delivered order containing this book
  canReviewBook(bookId: string): Observable<{ canReview: boolean }> {
    return this.http.get<{ canReview: boolean }>(
      `${this.baseUrl}/order/can-review/${bookId}`
    );
  }
}