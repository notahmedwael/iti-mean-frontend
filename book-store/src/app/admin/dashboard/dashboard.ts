import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatCard {
  title: string;
  value: number;
  icon: 'revenue' | 'orders' | 'books' | 'users';
  change: string;
  up: boolean;
}

interface RecentOrder {
  id: string;
  customer: string;
  book: string;
  amount: string;
  status: 'completed' | 'pending' | 'cancelled';
  date: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent {
  breadcrumb = [{ label: 'Admin', link: '/' }, { label: 'Dashboard' }];

  stats: StatCard[] = [
    { title: 'Total Revenue', value: 48250, icon: 'revenue', change: '+12.5%', up: true },
    { title: 'Total Orders', value: 1284, icon: 'orders', change: '+8.2%', up: true },
    { title: 'Books in Stock', value: 3621, icon: 'books', change: '-2.1%', up: false },
    { title: 'Total Users', value: 24, icon: 'users', change: '+4.6%', up: true },
  ];

  recentOrders: RecentOrder[] = [
    {
      id: '#ORD-001',
      customer: 'Sarah Mitchell',
      book: 'The Great Gatsby',
      amount: '$18.99',
      status: 'completed',
      date: 'Jan 15, 2024',
    },
    {
      id: '#ORD-002',
      customer: 'James Anderson',
      book: 'Atomic Habits',
      amount: '$24.99',
      status: 'pending',
      date: 'Feb 3, 2024',
    },
    {
      id: '#ORD-003',
      customer: 'Emily Chen',
      book: '1984',
      amount: '$14.99',
      status: 'cancelled',
      date: 'Dec 12, 2023',
    },
    {
      id: '#ORD-004',
      customer: 'Michael Roberts',
      book: 'Sapiens',
      amount: '$22.99',
      status: 'completed',
      date: 'Jan 28, 2024',
    },
    {
      id: '#ORD-005',
      customer: 'Sophia Williams',
      book: 'The Alchemist',
      amount: '$16.99',
      status: 'completed',
      date: 'Feb 10, 2024',
    },
  ];

  statusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'cancelled':
        return 'bg-red-50 text-red-800 border border-red-200';
      default:
        return '';
    }
  }

  formatValue(stat: StatCard): string {
    if (stat.icon === 'revenue') return '$' + stat.value.toLocaleString();
    return stat.value.toLocaleString();
  }
}
