import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrderService, Order, OrderStatus, PaymentStatus } from '../services/order.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './orders.html',
  styleUrls: ['./orders.css'],
})
export class AdminOrdersComponent implements OnInit {
  // ── Data ──────────────────────────────────────
  orders: Order[] = [];
  isLoading = true;
  error: string | null = null;

  // ── Pagination (from backend) ─────────────────
  currentPage = 1;
  totalPages = 1;
  totalOrders = 0;
  limit = 10;

  // ── Filters ───────────────────────────────────
  searchTerm = '';
  filterOrderStatus = '';
  filterPaymentStatus = '';

  // ── Detail drawer ─────────────────────────────
  selectedOrder: Order | null = null;
  openMenuId: string | null = null;

  // ── Status update state ───────────────────────
  updatingOrderId: string | null = null;

  // ── Status options matching backend enums ─────
  orderStatuses: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  paymentStatuses: PaymentStatus[] = ['Pending', 'Completed', 'Failed', 'Refunded'];

  constructor(
    private orderService: OrderService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  // ── Fetch from backend ────────────────────────
  fetchOrders(): void {
    this.isLoading = true;
    this.error = null;

    this.orderService
      .getAllOrders({
        status: this.filterOrderStatus || undefined,
        paymentStatus: this.filterPaymentStatus || undefined,
        page: this.currentPage,
        limit: this.limit,
      })
      .subscribe({
        next: (res) => {
          this.orders = res.data.data;
          this.totalOrders = res.data.pagination.total;
          this.totalPages = res.data.pagination.pages;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to load orders.';
          this.isLoading = false;
          this.cdr.detectChanges();
          console.error('Orders fetch error:', err);
        },
      });
  }

  // ── Filters & pagination ──────────────────────
  onFilterChange(): void {
    this.currentPage = 1;
    this.fetchOrders();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.fetchOrders();
    }
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // ── Client-side search (across loaded page) ───
  get filteredOrders(): Order[] {
    const q = this.searchTerm.toLowerCase();
    if (!q) return this.orders;
    return this.orders.filter(
      (o) =>
        o._id.toLowerCase().includes(q) ||
        o.user.firstName.toLowerCase().includes(q) ||
        o.user.lastName.toLowerCase().includes(q) ||
        o.user.email.toLowerCase().includes(q),
    );
  }

  // ── Summary counts ────────────────────────────
  get pendingCount(): number {
    return this.orders.filter((o) => o.orderStatus === 'Pending').length;
  }
  get deliveredCount(): number {
    return this.orders.filter((o) => o.orderStatus === 'Delivered').length;
  }
  get pageRevenue(): number {
    return this.orders
      .filter((o) => o.paymentStatus === 'Completed')
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }

  // ── Update order status ───────────────────────
  updateStatus(order: Order, field: 'orderStatus' | 'paymentStatus', value: string): void {
    this.updatingOrderId = order._id;

    const payload =
      field === 'orderStatus'
        ? { orderStatus: value as OrderStatus }
        : { paymentStatus: value as PaymentStatus };

    // Optimistic update
    (order as any)[field] = value;

    this.orderService.updateOrderStatus(order._id, payload).subscribe({
      next: (res) => {
        // Sync with what backend actually saved
        const updated = res.data;
        order.orderStatus = updated.orderStatus;
        order.paymentStatus = updated.paymentStatus;
        this.updatingOrderId = null;

        // Keep drawer in sync if open
        if (this.selectedOrder?._id === order._id) {
          this.selectedOrder = { ...order };
        }
      },
      error: (err) => {
        console.error('Status update failed:', err);
        this.updatingOrderId = null;
        // Revert optimistic update
        this.fetchOrders();
      },
    });
  }

  // ── Drawer ────────────────────────────────────
  viewOrder(order: Order): void {
    this.selectedOrder = order;
    this.closeMenu();
  }

  closeDrawer(): void {
    this.selectedOrder = null;
  }

  // ── Menu ──────────────────────────────────────
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

  // ── Helpers ───────────────────────────────────
  customerName(order: Order): string {
    return `${order.user.firstName} ${order.user.lastName}`;
  }

  itemCount(order: Order): number {
    return order.items.reduce((s, i) => s + i.quantity, 0);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  orderStatusClass(s: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      Pending: 'bg-amber-50 text-amber-700 border-amber-200',
      Processing: 'bg-blue-50 text-blue-700 border-blue-200',
      Shipped: 'bg-purple-50 text-purple-700 border-purple-200',
      Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Cancelled: 'bg-red-50 text-red-800 border-red-200',
    };
    return map[s] ?? '';
  }

  paymentStatusClass(s: PaymentStatus): string {
    const map: Record<PaymentStatus, string> = {
      Pending: 'bg-amber-50 text-amber-700 border-amber-200',
      Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Failed: 'bg-red-50 text-red-800 border-red-200',
      Refunded: 'bg-gray-100 text-gray-600 border-gray-300',
    };
    return map[s] ?? '';
  }
}
