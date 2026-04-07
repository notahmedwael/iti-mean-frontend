import { Component, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaginationComponent } from '../shared/pagination/pagination';
import { OrderService } from '../../services/order.service';
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
  user: { _id: string; name: string; email: string };
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

  // ── Data signals ─────────────────────────────
  orders = signal<Order[]>([]);

  // ── Filters ───────────────────────────────────
  searchTerm = '';
  filterOrderStatus = '';
  filterPaymentStatus = '';

  // ── Pagination ────────────────────────────────
  currentPage = 1;
  itemsPerPage = 10;
  totalResults = 0;
  
  // ── Stats ─────────────────────────────────────
  totalOrdersCount = 0; // Total overall orders in DB
  pendingOrdersCount = 0; // Total pending overall (requires separate fetch or just local page)
  deliveredOrdersCount = 0; // Total delivered overall
  totalRevenueCount = 0; // Total revenue overall

  // NOTE: A real enterprise app would have a /stats endpoint for the overall counts above.
  // For now, we will just use the current page's totals or what we can infer.


  // ── Detail drawer ─────────────────────────────
  selectedOrder: Order | null = null;
  openMenuId: string | null = null;

  // ── Status options ────────────────────────────
  orderStatuses: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  paymentStatuses: PaymentStatus[] = ['Pending', 'Completed', 'Failed', 'Refunded'];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
    this.loading.set(true);
    this.error.set(null);
    this.orderService.getAllOrders({
      page: this.currentPage,
      limit: this.itemsPerPage,
      status: this.filterOrderStatus || undefined,
      paymentStatus: this.filterPaymentStatus || undefined,
    }).subscribe({
      next: (res: any) => {
        let ordersData = res.data?.data || [];
        // Optional local text-based mapping if search term is provided (ideally this should be a backend search)
        if (this.searchTerm) {
          const q = this.searchTerm.toLowerCase();
          ordersData = ordersData.filter((o: any) => 
            o._id.toLowerCase().includes(q) ||
            o.user?.firstName?.toLowerCase().includes(q) ||
            o.user?.lastName?.toLowerCase().includes(q) ||
            o.user?.email?.toLowerCase().includes(q)
          );
        }
        
        this.orders.set(ordersData);
        this.totalResults = res.data?.pagination?.total || ordersData.length;
        
        // Approximate metrics based on loaded data
        this.totalOrdersCount = this.totalResults;
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load orders.');
        this.loading.set(false);
      }
    });
  }

  // ── Computed ──────────────────────────────────
  // Replaced static pagedOrders with API driven directly from this.orders()
  get pagedOrders(): Order[] {
    return this.orders();
  }

  get totalPages(): number {
    return Math.ceil(this.totalResults / this.itemsPerPage) || 1;
  }

  get totalOrders(): number {
    return this.totalOrdersCount;
  }
  
  // Real enterprise setups would fetch accurate stats, but we'll approximate based on current loaded page for simplicity here
  get pendingOrders(): number {
    return this.orders().filter((o) => o.orderStatus === 'Pending').length;
  }
  get deliveredOrders(): number {
    return this.orders().filter((o) => o.orderStatus === 'Delivered').length;
  }
  get totalRevenue(): number {
    return this.orders()
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
    this.orderService.updateOrderStatusAdmin(order._id, status).subscribe({
      next: () => {
        order.orderStatus = status; // optimistically update
        this.fetchOrders(); // sync with backend
      },
      error: () => alert('Failed to update status')
    });
  }

  // No backend delete route exists, so avoiding functionality
  deleteOrder(id: string): void {
    alert('Orders cannot be deleted through this interface. Please contact developers for db-level removal.');
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
