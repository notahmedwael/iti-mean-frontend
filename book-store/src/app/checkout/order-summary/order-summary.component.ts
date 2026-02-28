import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface OrderSummary {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.css',
})
export class OrderSummaryComponent implements OnInit {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);

  orderForm!: FormGroup;
  orderSummary: OrderSummary | null = null;
  isProcessing = signal(false);
  orderPlaced = signal(false);
  orderError = signal<string | null>(null);
  shippingCost = 0;
  taxRate = 0.08; // 8% tax

  ngOnInit() {
    this.initializeForm();
    this.calculateOrderSummary();
  }

  private initializeForm() {
    this.orderForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required],
      paymentMethod: ['', Validators.required],
      agreeTerms: [false, Validators.requiredTrue],
    });
  }

  private calculateOrderSummary() {
    this.cartService.items$.subscribe((items) => {
      if (items.length === 0) {
        this.router.navigate(['/books']);
        return;
      }

      const subtotal = this.cartService.getTotalPrice();
      this.shippingCost = subtotal > 35 ? 0 : 5.99;
      const tax = subtotal * this.taxRate;
      const total = subtotal + tax + this.shippingCost;

      this.orderSummary = {
        items,
        subtotal,
        tax,
        shipping: this.shippingCost,
        total,
      };
    });
  }

  get cartItems(): CartItem[] {
    return this.orderSummary?.items || [];
  }

  async placeOrder() {
    if (this.orderForm.invalid) {
      Object.keys(this.orderForm.controls).forEach((key) => {
        this.orderForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (!this.orderSummary) {
      this.orderError.set('Order summary not found. Please refresh and try again.');
      return;
    }

    this.isProcessing.set(true);
    this.orderError.set(null);

    const orderData = {
      items: this.orderSummary.items.map((item) => ({
        book: item.book._id,
        quantity: item.quantity,
      })),
      paymentMethod: this.orderForm.get('paymentMethod')?.value,
      shippingDetails: {
        firstName: this.orderForm.get('firstName')?.value,
        lastName: this.orderForm.get('lastName')?.value,
        email: this.orderForm.get('email')?.value,
        phone: this.orderForm.get('phone')?.value,
        address: this.orderForm.get('address')?.value,
        city: this.orderForm.get('city')?.value,
        state: this.orderForm.get('state')?.value,
        postalCode: this.orderForm.get('postalCode')?.value,
        country: this.orderForm.get('country')?.value,
      },
    };

    this.orderService.createOrder(orderData).subscribe({
      next: () => {
        this.isProcessing.set(false);
        this.orderPlaced.set(true);
        this.cartService.clear();

        // Redirect to orders page after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/orders']);
        }, 3000);
      },
      error: (error) => {
        this.isProcessing.set(false);
        console.error('Order placement failed:', error);
        this.orderError.set(
          error?.error?.message || 'Failed to place order. Please try again later.'
        );
      },
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.orderForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${this.formatFieldName(fieldName)} is required`;
    }
    if (field?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    return null;
  }

  private formatFieldName(name: string): string {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }
}
