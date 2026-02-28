import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { BookService, Book } from '../../services/book.service';
import { bookHover, cartAdded } from '../../animations';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section
      class="relative overflow-hidden bg-[#FAF6F0] min-h-[600px] flex items-center pt-20"
      style="background-image: url('https://images.unsplash.com/photo-1727342681676-b7b32b273add?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920');
              background-size: cover; background-position: center right; background-attachment: fixed;"
    >
      <!-- Gradient Overlay -->
      <div
        class="absolute inset-0 bg-gradient-to-r from-[#FAF6F0] via-[#FAF6F0]/90 to-[#FAF6F0]/30"
      ></div>

      <!-- Decorative Blobs -->
      <div
        class="absolute top-20 left-1/3 w-96 h-96 bg-[#DD9047]/10 rounded-full blur-3xl"
      ></div>
      <div
        class="absolute bottom-0 right-0 w-96 h-96 bg-[#BC552A]/5 rounded-full blur-3xl"
      ></div>

      <!-- Content -->
      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <!-- Left Content -->
          <div>
            <h1
              class="text-5xl lg:text-6xl font-black text-[#602314] mb-6 leading-tight"
            >
              Discover Your Next Favourite
              <span class="text-[#BC552A]">Book</span>
            </h1>

            <p class="text-lg text-[#7A5C4A] mb-8 max-w-md leading-relaxed">
              Explore thousands of bestsellers, classics, and hidden gems. Find your
              perfect read today at unbeatable prices.
            </p>

            <div class="flex flex-col sm:flex-row gap-4 mb-8">
              <a
                routerLink="/books"
                class="px-8 py-4 bg-[#BC552A] text-white font-bold rounded-xl
                       hover:bg-[#A04820] transition-all duration-300 shadow-lg
                       hover:shadow-xl hover:scale-105 inline-block text-center"
              >
                Browse Collection
              </a>
              <button
                (click)="scrollToServices()"
                class="px-8 py-4 border-2 border-[#BC552A] text-[#BC552A] font-bold
                       rounded-xl hover:bg-[#BC552A] hover:text-white
                       transition-all duration-300"
              >
                Learn More
              </button>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-3 gap-6">
              <div>
                <div class="text-3xl font-black text-[#BC552A]">50K+</div>
                <div class="text-sm text-[#8A7260]">Books</div>
              </div>
              <div>
                <div class="text-3xl font-black text-[#BC552A]">100K+</div>
                <div class="text-sm text-[#8A7260]">Readers</div>
              </div>
              <div>
                <div class="text-3xl font-black text-[#BC552A]">4.8★</div>
                <div class="text-sm text-[#8A7260]">Rating</div>
              </div>
            </div>
          </div>

          <!-- Right: Featured Book -->
          <div class="relative flex justify-center">
            <!-- Decorative Ring -->
            <div
              class="absolute inset-0 border-2 border-dashed border-[#DD9047]/30 rounded-full
                     animate-spin-slow"
              style="animation: spin 30s linear infinite; width: 100%; height: 100%;"
            ></div>

            <!-- Glow Background -->
            <div
              class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                     w-64 h-64 bg-[#DD9047]/10 rounded-full blur-3xl"
            ></div>

            <!-- Book Cover -->
            <div
              [@bookHover]="bookHoverState()"
              (mouseenter)="bookHoverState.set('hovered')"
              (mouseleave)="bookHoverState.set('default')"
              class="relative z-10 w-48 lg:w-56 aspect-[2/3]"
            >
              <img
                src="https://images.unsplash.com/photo-1714146996489-38849def0849?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400"
                alt="Featured Book"
                class="w-full h-full object-cover rounded-2xl shadow-2xl"
              />

              <!-- Shine Overlay on Hover -->
              <div
                class="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent
                       rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500"
              ></div>

              <!-- Bestseller Badge -->
              <div
                class="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-[#DD9047]
                       text-white flex items-center justify-center font-bold shadow-lg
                       transform rotate-12"
              >
                <div class="text-center">
                  <div class="text-2xl">🏆</div>
                  <div class="text-xs font-bold">BEST</div>
                </div>
              </div>

              <!-- Stats Card Float -->
              <div
                class="absolute -bottom-8 -left-8 bg-white rounded-xl shadow-2xl p-4
                       max-w-xs transform hover:scale-105 transition-transform"
              >
                <div class="text-sm font-bold text-[#602314] mb-2">The Great Gatsby</div>
                <div class="flex items-center gap-2 mb-2">
                  <div class="flex gap-0.5">
                    @for (i of [1, 2, 3, 4, 5]; track i) {
                      <svg class="w-4 h-4 fill-[#DD9047]" viewBox="0 0 24 24">
                        <path
                          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        />
                      </svg>
                    }
                  </div>
                  <span class="text-xs text-[#8A7260]">(328 reviews)</span>
                </div>
                <button
                  (click)="addToCart()"
                  [@cartAdded]="addedState()"
                  [class]="
                    'w-full text-xs font-bold py-2 rounded-lg transition-all ' +
                    (addedState() === 'added'
                      ? 'bg-green-500 text-white'
                      : 'bg-[#BC552A] text-white hover:bg-[#A04820]')
                  "
                >
                  {{ addedState() === 'added' ? '✓ Added to Cart' : 'Add to Cart' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  animations: [bookHover, cartAdded],
  styles: [
    `
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      ::ng-deep .animate-spin-slow {
        animation: spin 30s linear infinite;
      }
    `,
  ],
})
export class HeroSectionComponent {
  bookHoverState = signal<'default' | 'hovered'>('default');
  addedState = signal<'idle' | 'added'>('idle');

  constructor(private cartService: CartService) {}

  addToCart(): void {
    // Create a sample book matching the backend Book interface
    const sampleBook: Book = {
      _id: '0',
      name: 'The Great Gatsby',
      author: { _id: 'author-1', name: 'F. Scott Fitzgerald' },
      category: { _id: 'cat-1', name: 'Classic Fiction' },
      price: 14.99,
      stock: 100,
      cover: 'https://images.unsplash.com/photo-1714146996489-38849def0849?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    };
    this.cartService.addItem(sampleBook, 1);
    this.addedState.set('added');
    setTimeout(() => this.addedState.set('idle'), 2000);
  }

  scrollToServices(): void {
    const element = document.querySelector('[data-services]');
    element?.scrollIntoView({ behavior: 'smooth' });
  }
}
