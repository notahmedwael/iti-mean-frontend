import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../shared/pagination/pagination';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Administrator' | 'Editor' | 'Customer';
  status: 'active' | 'banned';
  avatar: string;
  joinedDate: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
})
export class UsersComponent implements OnInit {
  // ── Data ────────────────────────────────────────
  allUsers: User[] = [
    {
      id: '1',
      name: 'Sarah Mitchell',
      email: 'sarah.mitchell@example.com',
      role: 'Administrator',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
      joinedDate: 'Jan 15, 2024',
    },
    {
      id: '2',
      name: 'James Anderson',
      email: 'james.anderson@example.com',
      role: 'Customer',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
      joinedDate: 'Feb 3, 2024',
    },
    {
      id: '3',
      name: 'Emily Chen',
      email: 'emily.chen@example.com',
      role: 'Customer',
      status: 'banned',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop',
      joinedDate: 'Dec 12, 2023',
    },
    {
      id: '4',
      name: 'Michael Roberts',
      email: 'michael.roberts@example.com',
      role: 'Editor',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
      joinedDate: 'Jan 28, 2024',
    },
    {
      id: '5',
      name: 'Sophia Williams',
      email: 'sophia.williams@example.com',
      role: 'Customer',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
      joinedDate: 'Feb 10, 2024',
    },
    {
      id: '6',
      name: 'David Thompson',
      email: 'david.thompson@example.com',
      role: 'Customer',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop',
      joinedDate: 'Feb 18, 2024',
    },
  ];

  // ── State ────────────────────────────────────────
  searchTerm = '';
  openMenuId: string | null = null;

  // ── Pagination ───────────────────────────────────
  currentPage = 1;
  itemsPerPage = 6;

  // ── Lifecycle ────────────────────────────────────
  ngOnInit(): void {}

  // ── Computed ─────────────────────────────────────
  get filteredUsers(): User[] {
    const q = this.searchTerm.toLowerCase();
    if (!q) return this.allUsers;
    return this.allUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q),
    );
  }

  get pagedUsers(): User[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredUsers.length / this.itemsPerPage));
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get totalUsers(): number {
    return this.allUsers.length;
  }
  get activeUsers(): number {
    return this.allUsers.filter((u) => u.status === 'active').length;
  }
  get bannedUsers(): number {
    return this.allUsers.filter((u) => u.status === 'banned').length;
  }

  get showingFrom(): number {
    return this.filteredUsers.length === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
  }
  get showingTo(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredUsers.length);
  }

  // ── Actions ──────────────────────────────────────
  toggleStatus(userId: string): void {
    const user = this.allUsers.find((u) => u.id === userId);
    if (user) {
      user.status = user.status === 'active' ? 'banned' : 'active';
    }
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.allUsers = this.allUsers.filter((u) => u.id !== userId);
      this.closeMenu();
      if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    }
  }

  editUser(userId: string): void {
    console.log('Edit user:', userId);
    this.closeMenu();
    // Navigate to edit page or open modal
  }

  // ── Menu ─────────────────────────────────────────
  toggleMenu(userId: string, event: Event): void {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === userId ? null : userId;
  }

  closeMenu(): void {
    this.openMenuId = null;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeMenu();
  }

  // ── Pagination ───────────────────────────────────
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  // ── Helpers ──────────────────────────────────────
  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  onSearch(): void {
    this.currentPage = 1;
  }
}
