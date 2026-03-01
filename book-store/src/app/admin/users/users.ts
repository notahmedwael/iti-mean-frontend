import { Component, OnInit, HostListener, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../services/user.service';

import { UserService, User as UserModel } from '../services/user.service';
import { UserModal } from '../components/user-modal/user-modal';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, UserModal],
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
})
export class UsersComponent implements OnInit {
  allUsers: User[] = [];
  isLoading = true;

  isModalOpen = false;
  modalMode: 'add' | 'edit' = 'add';
  selectedUser: any = null;

  searchTerm = '';
  openMenuId: string | null = null;
  currentPage = 1;
  itemsPerPage = 6;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.allUsers = users;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ── Computed ─────────────────────────────────────
  get filteredUsers(): User[] {
    const q = this.searchTerm.toLowerCase();
    if (!q) return this.allUsers;
    return this.allUsers.filter(
      (u) =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
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
    const user = this.allUsers.find((u) => u._id === userId);
    if (user) {
      const newStatus = user.status === 'active' ? 'banned' : 'active';
      user.status = newStatus; // optimistic update
      this.userService.updateUserStatus(userId, newStatus).subscribe({
        error: (err) => {
          console.error('Failed to update status', err);
          user.status = newStatus === 'active' ? 'banned' : 'active'; // revert
        },
      });
    }
  }

  deleteUser(id: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.allUsers = this.allUsers.filter((u) => u._id !== id);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Delete failed:', err),
      });
    }
  }

  // ── Modal ────────────────────────────────────────
  openAddModal(): void {
    this.modalMode = 'add';
    this.selectedUser = null;
    this.isModalOpen = true;
  }

  openEditModal(user: User): void {
    this.modalMode = 'edit';
    this.selectedUser = user;
    this.isModalOpen = true;
    this.closeMenu();
  }

  handleSave(formData: any): void {
    if (this.modalMode === 'add') {
      // ── Map form fields to match the backend model ──
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role || 'User',
        dob: formData.dob || undefined, // form uses 'dob', model uses 'DOB'
      };

      this.userService.createUser(payload).subscribe({
        next: () => {
          this.isModalOpen = false;
          this.fetchUsers(); // refresh table
        },
        error: (err) => {
          console.error('Error creating user:', err);
          // Show the exact backend error message if available
          alert(err.error?.message || 'Failed to create user. Check console for details.');
        },
      });
    } else {
      // ── Edit: only send fields that can be changed ──
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        dob: formData.dob || undefined,
        // password only if provided
        ...(formData.password ? { password: formData.password } : {}),
      };

      this.userService.updateUser(this.selectedUser._id, payload).subscribe({
        next: () => {
          this.isModalOpen = false;
          this.fetchUsers(); // refresh table
        },
        error: (err) => {
          console.error('Error updating user:', err);
          alert(err.error?.message || 'Failed to update user. Check console for details.');
        },
      });
    }
  }

  // ── Menu & Helpers ───────────────────────────────
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

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  getInitials(firstName: string, lastName: string): string {
    if (!firstName || !lastName) return 'U';
    return (firstName[0] + lastName[0]).toUpperCase();
  }

  onSearch(): void {
    this.currentPage = 1;
  }
}