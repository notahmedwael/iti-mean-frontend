import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-modal.html',
  styleUrl: './user-modal.css',
})
export class UserModal implements OnInit {
  private fb = inject(FormBuilder);

  @Input() mode: 'add' | 'edit' = 'add';
  @Input() userData: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  isLoading = false;

  userForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
    lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['User', [Validators.required]],
    dob: [''],
  });

  ngOnInit(): void {
    if (this.mode === 'edit' && this.userData) {
      // When editing, password isn't usually required unless changing it
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();

      // Fill form with existing data
      this.userForm.patchValue({
        firstName: this.userData.firstName,
        lastName: this.userData.lastName,
        email: this.userData.email,
        role: this.userData.role || 'User',
        dob: this.userData.dob ? new Date(this.userData.dob).toISOString().split('T')[0] : '',
      });
    }
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.save.emit(this.userForm.value);
    } else {
      this.userForm.markAllAsTouched();
    }
  }
}
