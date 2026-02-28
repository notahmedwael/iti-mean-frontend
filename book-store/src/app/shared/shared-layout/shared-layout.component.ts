import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar';
import { FooterComponent } from '../footer/footer';

@Component({
  selector: 'app-shared-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <div class="min-h-screen bg-[#FAF6F0] flex flex-col">
      <!-- Navbar -->
      <app-navbar></app-navbar>

      <!-- Main Content -->
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <app-footer></app-footer>
    </div>
  `,
  styles: [],
})
export class SharedLayoutComponent {}
