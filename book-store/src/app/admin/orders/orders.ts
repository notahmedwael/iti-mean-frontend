import { Component, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaginationComponent } from '../shared/pagination/pagination';
import { OrderService } from '../services/order.service';

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded';
export type PaymentMethod = 'Credit Card' | 'Debit Card' | 'PayPal' | 'Bank Transfer';

export interface OrderItem {
  book: { _id: string; name: string; cover: string };
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
  user: { _id: string; firstName: string; lastName: string; name?: string; email: string };
  items: OrderItem[];
  shippingDetails: ShippingDetails;
  orderStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  createdAt: string;
}

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent],
  templateUrl: './orders.html',
  styleUrls: ['./orders.css'],
})
export class AdminOrdersComponent implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);

  allOrders: Order[] = [];
  totalOrdersCount = 0;
  pages = 1;

  // ── Filters ───────────────────────────────────
  searchTerm = '';
  filterOrderStatus = '';
  filterPaymentStatus = '';

  // ── Pagination ────────────────────────────────
  currentPage = 1;
  itemsPerPage = 6;

  // ── Detail drawer ─────────────────────────────
  selectedOrder: Order | null = null;
  openMenuId: string | null = null;

  constructor(private orderService: OrderService) {}

  // ── Status options ────────────────────────────
  orderStatuses: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  paymentStatuses: PaymentStatus[] = ['Pending', 'Completed', 'Failed', 'Refunded'];

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
    this.loading.set(true);
    this.error.set(null);

    this.orderService
      .getAllOrders({
        status: this.filterOrderStatus || undefined,
        paymentStatus: this.filterPaymentStatus || undefined,
        page: this.currentPage,
        limit: this.itemsPerPage,
      })
      .subscribe({
        next: (res) => {
          this.allOrders = res.data.data.map((order) => ({
            ...order,
            user: {
              ...order.user,
              name: `${order.user.firstName} ${order.user.lastName}`,
            },
          }));
          this.totalOrdersCount = res.data.pagination.total;
          this.pages = res.data.pagination.pages;
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load admin orders', err);
          this.error.set('Failed to load orders from the database.');
          this.loading.set(false);
        },
      });
  }

  // ── Computed ──────────────────────────────────
  get filteredOrders(): Order[] {
    return this.allOrders.filter((o) => {
      const q = this.searchTerm.toLowerCase();
      const userName = (o.user.name || `${o.user.firstName} ${o.user.lastName}`).toLowerCase();
      const matchSearch =
        !q ||
        o._id.toLowerCase().includes(q) ||
        userName.includes(q) ||
        o.user.email.toLowerCase().includes(q);
      const matchOrder = !this.filterOrderStatus || o.orderStatus === this.filterOrderStatus;
      const matchPayment =
        !this.filterPaymentStatus || o.paymentStatus === this.filterPaymentStatus;
      return matchSearch && matchOrder && matchPayment;
    });
  }

  get pagedOrders(): Order[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredOrders.slice(start, start + this.itemsPerPage);
  }

  get totalOrders(): number {
    return this.totalOrdersCount;
  }
  get pendingOrders(): number {
    return this.allOrders.filter((o) => o.orderStatus === 'Pending').length;
  }
  get deliveredOrders(): number {
    return this.allOrders.filter((o) => o.orderStatus === 'Delivered').length;
  }
  get totalRevenue(): number {
    return this.allOrders
      .filter((o) => o.paymentStatus === 'Completed')
      .reduce((s, o) => s + o.totalAmount, 0);
  }

  // ── Actions ───────────────────────────────────
  onSearch(): void {
    this.currentPage = 1;
    this.fetchOrders();
  }
  onFilterChange(): void {
    this.currentPage = 1;
    this.fetchOrders();
  }
  goToPage(p: number): void {
    this.currentPage = p;
    this.fetchOrders();
  }

  viewOrder(order: Order): void {
    this.selectedOrder = order;
    this.closeMenu();
  }
  closeDrawer(): void {
    this.selectedOrder = null;
  }

  updateOrderStatus(order: Order, status: OrderStatus): void {
    order.orderStatus = status;
    console.log('TODO: PATCH /order/' + order._id, { orderStatus: status });
  }

  deleteOrder(id: string): void {
    if (confirm('Delete this order?')) {
      this.allOrders = this.allOrders.filter((o) => o._id !== id);
      this.closeMenu();
    }
  }

  toggleMenu(id: string, e: Event): void {
    e.stopPropagation();
    this.openMenuId = this.openMenuId === id ? null : id;
  }
  closeMenu(): void {
    this.openMenuId = null;
  }

  @HostListener('document:click')
  onDocClick(): void {
    this.closeMenu();
  }

  // ── Style helpers ─────────────────────────────
  orderStatusClass(s: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      Pending: 'bg-amber-50 text-amber-700 border-amber-200',
      Processing: 'bg-blue-50 text-blue-700 border-blue-200',
      Shipped: 'bg-purple-50 text-purple-700 border-purple-200',
      Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Cancelled: 'bg-red-50 text-red-800 border-red-200',
    };
    return map[s];
  }

  paymentStatusClass(s: PaymentStatus): string {
    const map: Record<PaymentStatus, string> = {
      Pending: 'bg-amber-50 text-amber-700 border-amber-200',
      Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Failed: 'bg-red-50 text-red-800 border-red-200',
      Refunded: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return map[s];
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  itemCount(order: Order): number {
    return order.items.reduce((s, i) => s + i.quantity, 0);
  }
}
