import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  isEditMode = false;
  message = '';
  isLoading = false;
  isSuccess = false;

  profileForm = this.fb.group({
    firstName: [{ value: '', disabled: true }, Validators.required],
    lastName: [{ value: '', disabled: true }, Validators.required],
    dob: [{ value: '', disabled: true }],
    email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
  });

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.http.get<any>(`${environment.apiUrl}/users/profile`).subscribe({
      next: (response) => {
        if (response && response.data) {
          const user = response.data;

          if (user.dob) {
            user.dob = user.dob.substring(0, 10);
          }
          this.profileForm.patchValue(user);
        }
      },
      error: (err) => {
        this.isSuccess = false;
        this.message = 'Failed to load profile.';
      },
    });
  }

  toggleEdit() {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.message = '';
      this.profileForm.enable();
    } else {
      this.profileForm.disable();
      this.loadProfile();
    }
  }

  onUpdate() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    if (this.profileForm.valid) {
      this.isLoading = true;
      this.http
        .patch(`${environment.apiUrl}/users/profile`, this.profileForm.getRawValue())
        .subscribe({
          next: (res: any) => {
            this.isLoading = false;
            this.isEditMode = false;
            this.isSuccess = true;
            this.profileForm.disable();
            this.message = res.emailChanged
              ? 'Profile updated. Please check your new email for verification.'
              : 'Profile updated successfully!';
          },
          error: () => {
            this.isLoading = false;
            this.isSuccess = false;
            this.message = 'Update failed.';
          },
        });
    }
  }

  get isFormInvalidAndTouched(): boolean {
    return this.profileForm.invalid && this.profileForm.touched;
  }
}
