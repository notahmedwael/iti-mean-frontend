import { Component, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaginationComponent } from '../shared/pagination/pagination';

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

  // ── Mock data (replace with HTTP service later) ──
  allOrders: Order[] = [
    {
      _id: 'ORD-001',
      user: { _id: 'u1', name: 'Sarah Mitchell', email: 'sarah.mitchell@example.com' },
      items: [
        {
          book: {
            _id: 'b1',
            name: 'The Great Gatsby',
            cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=60&h=80&fit=crop',
          },
          quantity: 1,
          price: 18.99,
        },
      ],
      shippingDetails: {
        firstName: 'Sarah',
        lastName: 'Mitchell',
        email: 'sarah.mitchell@example.com',
        phone: '+1 555-0101',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
      },
      orderStatus: 'Delivered',
      paymentMethod: 'Credit Card',
      paymentStatus: 'Completed',
      totalAmount: 18.99,
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      _id: 'ORD-002',
      user: { _id: 'u2', name: 'James Anderson', email: 'james.anderson@example.com' },
      items: [
        {
          book: {
            _id: 'b2',
            name: 'Atomic Habits',
            cover:
              'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=60&h=80&fit=crop',
          },
          quantity: 2,
          price: 24.99,
        },
        {
          book: {
            _id: 'b3',
            name: '1984',
            cover:
              'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=60&h=80&fit=crop',
          },
          quantity: 1,
          price: 14.99,
        },
      ],
      shippingDetails: {
        firstName: 'James',
        lastName: 'Anderson',
        email: 'james.anderson@example.com',
        phone: '+1 555-0102',
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90001',
        country: 'USA',
      },
      orderStatus: 'Processing',
      paymentMethod: 'PayPal',
      paymentStatus: 'Completed',
      totalAmount: 64.97,
      createdAt: '2024-02-03T14:20:00Z',
    },
    {
      _id: 'ORD-003',
      user: { _id: 'u3', name: 'Emily Chen', email: 'emily.chen@example.com' },
      items: [
        {
          book: {
            _id: 'b4',
            name: 'Sapiens',
            cover:
              'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=60&h=80&fit=crop',
          },
          quantity: 1,
          price: 22.99,
        },
      ],
      shippingDetails: {
        firstName: 'Emily',
        lastName: 'Chen',
        email: 'emily.chen@example.com',
        phone: '+1 555-0103',
        address: '789 Pine Rd',
        city: 'Chicago',
        state: 'IL',
        postalCode: '60601',
        country: 'USA',
      },
      orderStatus: 'Cancelled',
      paymentMethod: 'Debit Card',
      paymentStatus: 'Refunded',
      totalAmount: 22.99,
      createdAt: '2023-12-12T09:15:00Z',
    },
    {
      _id: 'ORD-004',
      user: { _id: 'u4', name: 'Michael Roberts', email: 'michael.roberts@example.com' },
      items: [
        {
          book: {
            _id: 'b5',
            name: 'The Alchemist',
            cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=60&h=80&fit=crop',
          },
          quantity: 1,
          price: 16.99,
        },
        {
          book: {
            _id: 'b6',
            name: 'Deep Work',
            cover:
              'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=60&h=80&fit=crop',
          },
          quantity: 1,
          price: 19.99,
        },
      ],
      shippingDetails: {
        firstName: 'Michael',
        lastName: 'Roberts',
        email: 'michael.roberts@example.com',
        phone: '+1 555-0104',
        address: '321 Elm St',
        city: 'Houston',
        state: 'TX',
        postalCode: '77001',
        country: 'USA',
      },
      orderStatus: 'Shipped',
      paymentMethod: 'Bank Transfer',
      paymentStatus: 'Completed',
      totalAmount: 36.98,
      createdAt: '2024-01-28T16:45:00Z',
    },
    {
      _id: 'ORD-005',
      user: { _id: 'u5', name: 'Sophia Williams', email: 'sophia.williams@example.com' },
      items: [
        {
          book: {
            _id: 'b7',
            name: 'Dune',
            cover:
              'https://images.unsplash.com/photo-1531901599143-df5010ab9438?w=60&h=80&fit=crop',
          },
          quantity: 3,
          price: 21.99,
        },
      ],
      shippingDetails: {
        firstName: 'Sophia',
        lastName: 'Williams',
        email: 'sophia.williams@example.com',
        phone: '+1 555-0105',
        address: '654 Maple Dr',
        city: 'Phoenix',
        state: 'AZ',
        postalCode: '85001',
        country: 'USA',
      },
      orderStatus: 'Pending',
      paymentMethod: 'Credit Card',
      paymentStatus: 'Pending',
      totalAmount: 65.97,
      createdAt: '2024-02-10T11:00:00Z',
    },
    {
      _id: 'ORD-006',
      user: { _id: 'u6', name: 'David Thompson', email: 'david.thompson@example.com' },
      items: [
        {
          book: {
            _id: 'b8',
            name: 'The Lean Startup',
            cover:
              'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=60&h=80&fit=crop',
          },
          quantity: 1,
          price: 23.99,
        },
      ],
      shippingDetails: {
        firstName: 'David',
        lastName: 'Thompson',
        email: 'david.thompson@example.com',
        phone: '+1 555-0106',
        address: '987 Cedar Ln',
        city: 'Philadelphia',
        state: 'PA',
        postalCode: '19101',
        country: 'USA',
      },
      orderStatus: 'Delivered',
      paymentMethod: 'PayPal',
      paymentStatus: 'Completed',
      totalAmount: 23.99,
      createdAt: '2024-02-18T08:30:00Z',
    },
  ];

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

  // ── Status options ────────────────────────────
  orderStatuses: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  paymentStatuses: PaymentStatus[] = ['Pending', 'Completed', 'Failed', 'Refunded'];

  ngOnInit(): void {
    // Simulate loading
    setTimeout(() => this.loading.set(false), 400);
  }

  // ── Computed ──────────────────────────────────
  get filteredOrders(): Order[] {
    return this.allOrders.filter((o) => {
      const q = this.searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        o._id.toLowerCase().includes(q) ||
        o.user.name.toLowerCase().includes(q) ||
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
    return this.allOrders.length;
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
  }
  onFilterChange(): void {
    this.currentPage = 1;
  }
  goToPage(p: number): void {
    this.currentPage = p;
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
