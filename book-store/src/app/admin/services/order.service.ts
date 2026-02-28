import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// ── Interfaces matching the backend model exactly ──────────────────────────

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded';
export type PaymentMethod = 'Credit Card' | 'Debit Card' | 'PayPal' | 'Bank Transfer';

export interface OrderItem {
  book: { _id: string; name: string; cover: string; price: number };
  quantity: number;
  price: number;
}

export interface ShippingDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  _id: string;
  user: { _id: string; firstName: string; lastName: string; email: string };
  items: OrderItem[];
  shippingDetails: ShippingDetails;
  orderStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  message: string;
  data: {
    data: Order[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = 'http://localhost:8000/order';

  constructor(private http: HttpClient) {}

  // GET /order/admin/all  ── Admin only
  getAllOrders(
    filters: {
      status?: string;
      paymentStatus?: string;
      page?: number;
      limit?: number;
    } = {},
  ): Observable<OrdersResponse> {
    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.paymentStatus) params = params.set('paymentStatus', filters.paymentStatus);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());

    return this.http.get<OrdersResponse>(`${this.apiUrl}/admin/all`, { params });
  }

  // PATCH /order/admin/update/:orderId  ── Admin only
  updateOrderStatus(
    orderId: string,
    payload: {
      orderStatus?: OrderStatus;
      paymentStatus?: PaymentStatus;
    },
  ): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/update/${orderId}`, payload);
  }

  // No delete endpoint exists in the backend yet — placeholder for future
  // deleteOrder(orderId: string): Observable<any> {
  //   return this.http.delete(`${this.apiUrl}/admin/${orderId}`);
  // }
}
