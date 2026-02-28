import { jwtDecode } from 'jwt-decode';
import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Auth } from '../../core/services/auth';
import { Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      // Note: Added ': any' to response to prevent TypeScript errors
      this.authService.login(this.loginForm.value).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.successMessage = 'Welcome back! Redirecting...';

          // 1. Get the token (adjust 'response.token' if your backend names it differently!)
          const token = response.token;

          try {
            // 2. Decode the token to see who is logging in
            const decodedToken: any = jwtDecode(token);

            // 3. Traffic Cop: Route based on the role
            setTimeout(() => {
              if (decodedToken.role === 'Admin') {
                this.router.navigate(['/admin/dashboard']);
              } else {
                this.router.navigate(['/books']);
              }
            }, 1000);
          } catch (error) {
            console.error('Could not decode token:', error);
            // Safe fallback just in case something breaks
            setTimeout(() => this.router.navigate(['/books']), 1000);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Login failed. Please check your credentials.';
          this.cdr.detectChanges();
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
