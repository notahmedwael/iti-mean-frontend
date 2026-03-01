import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService, Order } from '../services/order.service';
import { UserService } from '../services/user.service';
import { BookService } from '../../services/book.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  // ── Stats ─────────────────────────────────────
  totalRevenue = 0;
  totalOrders = 0;
  totalBooks = 0;
  totalUsers = 0;

  // ── Recent orders ─────────────────────────────
  recentOrders: Order[] = [];

  // ── Loading flags ─────────────────────────────
  loadingStats = true;
  loadingOrders = true;

  constructor(
    private orderService: OrderService,
    private userService: UserService,
    private bookService: BookService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.fetchOrders();
    this.fetchUsers();
    this.fetchBooks();
  }

  // ── Fetch recent orders + derive revenue & count ──
  fetchOrders(): void {
    this.orderService.getAllOrders({ page: 1, limit: 5 }).subscribe({
      // FIX 2: Added ': any'
      next: (res: any) => {
        this.recentOrders = res.data.data;
        this.totalOrders = res.data.pagination.total;

        this.totalRevenue = res.data.data
          .filter((o: any) => o.paymentStatus === 'Completed')
          .reduce((sum: number, o: any) => sum + o.totalAmount, 0);

        this.loadingOrders = false;
        this.cdr.detectChanges();
      },
      // FIX 2: Added ': any'
      error: (err: any) => {
        console.error('Dashboard orders error:', err);
        this.loadingOrders = false;
        this.cdr.detectChanges();
      },
    });
  }

  fetchUsers(): void {
    this.userService.getAllUsers().subscribe({
      // FIX 2: Added ': any'
      next: (users: any) => {
        this.totalUsers = users.length;
        this.loadingStats = false; // FIX 3: Stop the loading skeleton!
        this.cdr.detectChanges();
      },
      // FIX 2: Added ': any'
      error: (err: any) => {
        console.error('Dashboard users error:', err);
        this.loadingStats = false;
      },
    });
  }

  fetchBooks(): void {
    this.bookService.getAllBooks({ page: 1, limit: 1 }).subscribe({
      // FIX 2: Added ': any'
      next: (res: any) => {
        this.totalBooks = res.len;
        this.loadingStats = false; // FIX 3: Stop the loading skeleton!
        this.cdr.detectChanges();
      },
      // FIX 2: Added ': any'
      error: (err: any) => {
        console.error('Dashboard books error:', err);
        this.loadingStats = false;
      },
    });
  }

  // ── Helpers ───────────────────────────────────
  customerName(order: Order): string {
    return `${order.user.firstName} ${order.user.lastName}`;
  }

  firstBook(order: Order): string {
    const name = order.items[0]?.book?.name || '—';
    return order.items.length > 1 ? `${name} +${order.items.length - 1}` : name;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  orderStatusClass(status: string): string {
    const map: Record<string, string> = {
      Delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
      Cancelled: 'bg-red-50 text-red-800 border border-red-200',
      Processing: 'bg-blue-50 text-blue-700 border border-blue-200',
      Shipped: 'bg-purple-50 text-purple-700 border border-purple-200',
    };
    return map[status] ?? '';
  }
}
