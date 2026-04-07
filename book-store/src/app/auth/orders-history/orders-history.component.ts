import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';

@Component({
  selector: 'app-orders-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders-history.component.html',
  styleUrl: './orders-history.component.css',
})
export class OrdersHistoryComponent implements OnInit {
  private orderService = inject(OrderService);

  orders = signal<Order[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  selectedOrder = signal<Order | null>(null);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.error.set(null);

    this.orderService.getUserOrders().subscribe({
      next: (res) => {
        this.orders.set(res.data.orders || []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load orders. Please try again later.');
        this.loading.set(false);
      },
    });
  }

  selectOrder(order: Order): void {
    this.selectedOrder.set(this.selectedOrder() === order ? null : order);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Pending':
        return '⏳';
      case 'Processing':
        return '⚙️';
      case 'Shipped':
        return '📦';
      case 'Delivered':
        return '✅';
      case 'Cancelled':
        return '❌';
      default:
        return '📋';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatTime(date: string): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
