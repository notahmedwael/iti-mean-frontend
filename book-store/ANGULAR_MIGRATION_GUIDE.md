# Folio&Co — Angular Migration Guide
> Complete design, theme, animation & component documentation for recreating the Bookstore E-Commerce UI in Angular 17+

---

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [Design System — Colors, Typography & Spacing](#2-design-system)
3. [Global Styles & CSS Variables](#3-global-styles--css-variables)
4. [Animations & Transitions Reference](#4-animations--transitions-reference)
5. [Data Models & Interfaces](#5-data-models--interfaces)
6. [Mock Data — Books Catalog](#6-mock-data--books-catalog)
7. [Component Architecture](#7-component-architecture)
8. [Component: Announcement Bar](#8-component-announcement-bar)
9. [Component: Header / Navbar](#9-component-header--navbar)
10. [Component: Hero Section](#10-component-hero-section)
11. [Component: Category Tabs Bar](#11-component-category-tabs-bar)
12. [Component: Filter Sidebar](#12-component-filter-sidebar)
13. [Component: Star Rating](#13-component-star-rating)
14. [Component: Product Card (Grid View)](#14-component-product-card-grid-view)
15. [Component: Product List Item (List View)](#15-component-product-list-item-list-view)
16. [Component: Product Grid (Container)](#16-component-product-grid-container)
17. [Component: Quick View Modal](#17-component-quick-view-modal)
18. [Component: Footer](#18-component-footer)
19. [Page Layout — app.component](#19-page-layout--appcomponent)
20. [Angular Services](#20-angular-services)
21. [Angular Routing](#21-angular-routing)
22. [Image Assets & URLs](#22-image-assets--urls)

---

## 1. Project Setup

### Angular CLI Bootstrap

```bash
npm install -g @angular/cli
ng new folio-bookstore --routing=true --style=scss --standalone=false
cd folio-bookstore
```

### Install Tailwind CSS v3

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

**tailwind.config.js:**
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        rust:    '#BC552A',
        gold:    '#DD9047',
        maroon:  '#602314',
        cream:   '#FAF6F0',
        'cream-dark': '#F0E8DC',
        'rust-dark':  '#A04820',
        'rust-deep':  '#8A3A15',
        'text-muted': '#8A7260',
        'text-warm':  '#7A5C4A',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 30s linear infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'), // for line-clamp-2 support
  ],
};
```

**src/styles.scss:**
```scss
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

* { box-sizing: border-box; }

body {
  font-family: 'Inter', sans-serif;
  background-color: #FAF6F0;
  color: #602314;
}

/* Hide scrollbar */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}

/* Modal animation */
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(8px); }
  to   { opacity: 1; transform: scale(1)    translateY(0);   }
}
.modal-enter { animation: modalIn 0.2s ease-out forwards; }
```

### Install Angular Material (optional, for CDK overlay/dialog)

```bash
ng add @angular/material
```

Or use a plain `*ngIf`-driven modal without CDK.

---

## 2. Design System

### Color Palette

| Token           | Hex       | Usage                                              |
|-----------------|-----------|----------------------------------------------------|
| **Primary**     | `#BC552A` | CTA buttons, active states, borders, Add-to-Cart   |
| **Secondary**   | `#DD9047` | Star ratings, badges, hover effects, notification bubble |
| **Accent**      | `#602314` | Headings, nav bar background, borders, body text   |
| **Background**  | `#FAF6F0` | Page background, sidebar backgrounds               |
| `#F0E8DC`       |           | Card image area gradient end, slightly darker cream |
| `#A04820`       |           | Primary button hover (darker rust)                 |
| `#8A7260`       |           | Muted body text, placeholders, secondary labels    |
| `#7A5C4A`       |           | Description text, warm muted paragraphs            |
| `#D4C5B0`       |           | Empty/unfilled star color                          |
| `#2A1208`       |           | Modal backdrop color (deep dark brown)             |

### Typography

- **Font Family:** `Inter` (Google Fonts), fallback `sans-serif`
- **Heading Color:** `#602314` (Deep Maroon)
- **Body Color:** `#7A5C4A` (Warm Muted Brown)
- **Muted Color:** `#8A7260`
- **Accent Headings:** `#BC552A` (Rust) for subtitles, genre tags

| Element        | Size              | Weight | Color     |
|----------------|-------------------|--------|-----------|
| H1 (Hero)      | `clamp(2.5rem, 5vw, 3.75rem)` | 900 | `#602314` |
| H2 (Modal)     | `1.5rem`          | 900    | `#602314` |
| H3 (Card)      | `0.875rem`        | 700    | `#602314` |
| Logo           | `1.25rem`         | 900    | `#602314` / `#BC552A` |
| Nav Link       | `0.875rem`        | 500    | `#602314` |
| Genre Tag      | `0.625rem`        | 600    | `#BC552A` |
| Price          | `0.875rem`–`2rem` | 900    | `#602314` |
| Muted Text     | `0.75rem`         | 400    | `#8A7260` |

### Spacing & Border Radius

| Component             | Border Radius    |
|-----------------------|------------------|
| Buttons (primary)     | `0.75rem` (xl)   |
| Cards                 | `1rem` (2xl)     |
| Search bar            | `0.75rem` (xl)   |
| Logo icon box         | `0.5rem` (lg)    |
| Input fields          | `0.75rem` (xl)   |
| Filter tags           | `9999px` (full)  |
| Modal                 | `1rem` (2xl)     |
| Notification bubble   | `9999px` (full)  |

---

## 3. Global Styles & CSS Variables

Add to `src/styles.scss`:

```scss
:root {
  --color-primary:    #BC552A;
  --color-secondary:  #DD9047;
  --color-accent:     #602314;
  --color-bg:         #FAF6F0;
  --color-bg-dark:    #F0E8DC;
  --color-text-muted: #8A7260;
  --color-text-warm:  #7A5C4A;
  --shadow-book:      0 25px 50px -12px rgba(96, 35, 20, 0.25);
  --shadow-card:      0 10px 15px -3px rgba(96, 35, 20, 0.08);
  --shadow-modal:     0 25px 50px -12px rgba(42, 18, 8, 0.4);
  --transition-std:   all 0.2s ease;
  --transition-med:   all 0.3s ease;
  --transition-slow:  all 0.5s ease;
}
```

---

## 4. Animations & Transitions Reference

### CSS Keyframe Animations

```scss
// Spinning decorative ring around hero book cover
// Applied via: animation: spin 30s linear infinite
// Angular: [@spinRing] or plain CSS class .animate-spin-slow

// Modal entrance animation
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(8px); }
  to   { opacity: 1; transform: scale(1)    translateY(0);   }
}

// Book cover hover — 3D lift effect
// Applied via CSS: transition: transform 0.5s, box-shadow 0.5s
// On hover: translateY(-8px) rotate(1deg), shadow intensifies
```

### Angular Animations (animations.ts)

```typescript
// src/app/animations.ts
import {
  trigger, state, style, transition, animate, keyframes
} from '@angular/animations';

export const slideDown = trigger('slideDown', [
  state('open',   style({ maxHeight: '24rem', opacity: 1 })),
  state('closed', style({ maxHeight: '0',     opacity: 0 })),
  transition('closed <=> open', animate('300ms ease-in-out')),
]);

export const fadeInModal = trigger('fadeInModal', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.95) translateY(8px)' }),
    animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
  ]),
  transition(':leave', [
    animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.95) translateY(4px)' })),
  ]),
]);

export const fadeInBackdrop = trigger('fadeInBackdrop', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('200ms ease-out', style({ opacity: 1 })),
  ]),
  transition(':leave', [
    animate('150ms ease-in', style({ opacity: 0 })),
  ]),
]);

export const mobileMenuSlide = trigger('mobileMenuSlide', [
  state('open',   style({ maxHeight: '20rem', opacity: 1 })),
  state('closed', style({ maxHeight: '0',     opacity: 0 })),
  transition('closed <=> open', animate('300ms ease-in-out')),
]);

export const mobileSidebarSlide = trigger('mobileSidebarSlide', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)' }),
    animate('300ms ease-out', style({ transform: 'translateX(0)' })),
  ]),
  transition(':leave', [
    animate('300ms ease-in', style({ transform: 'translateX(-100%)' })),
  ]),
]);

export const bookHover = trigger('bookHover', [
  state('default', style({ transform: 'translateY(0) rotate(0deg)' })),
  state('hovered', style({ transform: 'translateY(-8px) rotate(1deg)' })),
  transition('default <=> hovered', animate('500ms ease')),
]);

export const cartAdded = trigger('cartAdded', [
  state('idle',  style({ backgroundColor: '#BC552A' })),
  state('added', style({ backgroundColor: '#16a34a' })),
  transition('idle <=> added', animate('300ms ease')),
]);
```

### Transition Durations at a Glance

| Interaction                     | Duration   | Easing        |
|---------------------------------|------------|---------------|
| Accordion open/close            | `300ms`    | `ease-in-out` |
| Modal enter                     | `200ms`    | `ease-out`    |
| Modal leave                     | `150ms`    | `ease-in`     |
| Mobile nav slide                | `300ms`    | `ease-in-out` |
| Mobile sidebar slide            | `300ms`    | `ease-out`    |
| Button hover color              | `200ms`    | `ease`        |
| Card hover shadow/border        | `300ms`    | `ease`        |
| Book cover 3D lift              | `500ms`    | `ease`        |
| Search bar expand               | `300ms`    | `ease`        |
| Search icon color change        | `200ms`    | `ease`        |
| Decorative ring spin            | `30s`      | `linear`      |
| Shine overlay on book hover     | `500ms`    | `ease`        |
| Header scroll shadow transition | `300ms`    | `ease`        |
| Wishlist heart fill toggle      | `200ms`    | `ease`        |

---

## 5. Data Models & Interfaces

```typescript
// src/app/models/book.model.ts

export type BadgeColor = 'rust' | 'gold' | 'maroon';

export interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  rating: number;       // 0.0 – 5.0
  reviews: number;
  image: string;        // Unsplash URL
  genre: string;
  pages?: number;
  year?: number;
  description?: string;
  badge?: string;       // e.g. "Bestseller", "Staff Pick"
  badgeColor?: BadgeColor;
}

export interface Category {
  id: string;
  label: string;
  count: number;
}

export interface Author {
  id: string;
  label: string;
}

export interface FilterState {
  selectedCategories: string[];
  selectedAuthors: string[];
  selectedRating: number | null;
  selectedFormats: string[];
  priceRange: [number, number];
}

export interface NavLink {
  label: string;
  hasDropdown: boolean;
  route?: string;
}
```

---

## 6. Mock Data — Books Catalog

```typescript
// src/app/data/books.data.ts
import { Book } from '../models/book.model';

export const BOOKS: Book[] = [
  {
    id: 1,
    title: '1984',
    author: 'George Orwell',
    price: 12.99,
    originalPrice: 18.99,
    rating: 4.8,
    reviews: 24530,
    image: 'https://images.unsplash.com/photo-1572091574819-ea8bb5394b1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    genre: 'Classic Fiction',
    pages: 328,
    year: 1949,
    badge: 'Bestseller',
    badgeColor: 'rust',
    description: 'A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism. Written in 1948, the book is set in an imagined future where much of the world has fallen victim to perpetual war, omnipresent government surveillance, and propaganda.',
  },
  {
    id: 2,
    title: 'The Shadow of the Wind',
    author: 'Carlos Ruiz Zafón',
    price: 15.49,
    originalPrice: 21.99,
    rating: 4.7,
    reviews: 8201,
    image: 'https://images.unsplash.com/photo-1528459061998-56fd57ad86e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    genre: 'Mystery',
    pages: 487,
    year: 2001,
    badge: 'Staff Pick',
    badgeColor: 'gold',
    description: 'A young boy discovers a book in the Cemetery of Forgotten Books in post-Civil War Barcelona, beginning an unforgettable journey through the labyrinthine literary world of a city lost in time.',
  },
  {
    id: 3,
    title: 'Dune',
    author: 'Frank Herbert',
    price: 16.99,
    originalPrice: 24.99,
    rating: 4.9,
    reviews: 42100,
    image: 'https://images.unsplash.com/photo-1633680842723-2a0d770f2b74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    genre: 'Science Fiction',
    pages: 688,
    year: 1965,
    badge: 'New Edition',
    badgeColor: 'maroon',
    description: 'Set in the distant future amidst a feudal interstellar society, Dune tells the story of young Paul Atreides as he navigates the political intrigue of the desert planet Arrakis.',
  },
  {
    id: 4,
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    price: 9.99,
    rating: 4.6,
    reviews: 31720,
    image: 'https://images.unsplash.com/photo-1723532172898-16ec15026bbd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    genre: 'Romance',
    pages: 432,
    year: 1813,
    description: 'The story follows the main character, Elizabeth Bennet, as she deals with issues of manners, upbringing, morality, education, and marriage in Regency-era England.',
  },
  {
    id: 5,
    title: 'Meditations',
    author: 'Marcus Aurelius',
    price: 11.49,
    originalPrice: 15.99,
    rating: 4.7,
    reviews: 18430,
    image: 'https://images.unsplash.com/photo-1675289678562-18174b2c2d03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    genre: 'Philosophy',
    pages: 254,
    year: 180,
    badge: 'Timeless',
    badgeColor: 'gold',
    description: 'A series of personal writings by Marcus Aurelius, Roman Emperor from 161 to 180 AD, recording his private notes and ideas on Stoic philosophy.',
  },
  {
    id: 6,
    title: 'Educated',
    author: 'Tara Westover',
    price: 14.99,
    originalPrice: 20.00,
    rating: 4.8,
    reviews: 29840,
    image: 'https://images.unsplash.com/photo-1591778967891-4c44dbb3e636?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    genre: 'Biography',
    pages: 334,
    year: 2018,
    badge: 'Award Winner',
    badgeColor: 'rust',
    description: 'A memoir about a young girl who leaves her survivalist family and goes on to earn a PhD from Cambridge University — an account of the struggle for self-invention.',
  },
  {
    id: 7,
    title: 'Leaves of Grass',
    author: 'Walt Whitman',
    price: 8.99,
    rating: 4.5,
    reviews: 7230,
    image: 'https://images.unsplash.com/photo-1619038766935-51e0c074f5e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    genre: 'Poetry',
    pages: 462,
    year: 1855,
    description: 'A poetry collection by Walt Whitman. Though a radical departure from conventional poetry, it has become one of the most important works of American literature.',
  },
  {
    id: 8,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    price: 14.99,
    originalPrice: 22.00,
    rating: 4.5,
    reviews: 12840,
    image: 'https://images.unsplash.com/photo-1714146996489-38849def0849?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    genre: 'Classic Fiction',
    pages: 180,
    year: 1925,
    badge: 'Featured',
    badgeColor: 'gold',
    description: 'A novel exploring decadence, idealism, and the elusive American Dream, creating a portrait of the Jazz Age that has been described as a cautionary tale.',
  },
];

export const CATEGORIES = [
  { id: 'classic',  label: 'Classic Fiction',    count: 142 },
  { id: 'mystery',  label: 'Mystery & Thriller',  count: 89  },
  { id: 'scifi',    label: 'Science Fiction',     count: 67  },
  { id: 'romance',  label: 'Romance',             count: 204 },
  { id: 'biography',label: 'Biography',           count: 53  },
  { id: 'selfhelp', label: 'Self-Help',           count: 118 },
  { id: 'history',  label: 'History',             count: 74  },
  { id: 'poetry',   label: 'Poetry',              count: 31  },
];

export const AUTHORS = [
  { id: 'fitzgerald',  label: 'F. Scott Fitzgerald' },
  { id: 'hemingway',   label: 'Ernest Hemingway'    },
  { id: 'orwell',      label: 'George Orwell'       },
  { id: 'tolkien',     label: 'J.R.R. Tolkien'      },
  { id: 'austen',      label: 'Jane Austen'         },
  { id: 'dostoevsky',  label: 'Fyodor Dostoevsky'  },
];

export const FORMATS = ['Hardcover', 'Paperback', 'E-Book', 'Audiobook'];

export const GENRE_TABS = [
  'All Books', 'Classic Fiction', 'Mystery', 'Science Fiction',
  'Romance', 'Philosophy', 'Biography', 'Poetry', 'Self-Help', 'History',
];

export const NAV_LINKS = [
  { label: 'Browse',       hasDropdown: true  },
  { label: 'New Arrivals', hasDropdown: false },
  { label: 'Best Sellers', hasDropdown: false },
  { label: 'Authors',      hasDropdown: false },
  { label: 'About',        hasDropdown: false },
];

export const SORT_OPTIONS = [
  'Most Popular', 'Newest', 'Price: Low to High', 'Price: High to Low', 'Top Rated',
];
```

---

## 7. Component Architecture

```
AppComponent
├── AnnouncementBarComponent
├── HeaderComponent
│   └── (search state, scroll state, mobile menu state)
├── HeroSectionComponent
├── CategoryTabsComponent
└── MainLayoutComponent (flex container)
    ├── FilterSidebarComponent
    │   └── FilterAccordionComponent (×5)
    └── ProductGridComponent
        ├── ProductCardComponent (×N)
        ├── ProductListItemComponent (×N)
        └── QuickViewModalComponent
FooterComponent
```

### Angular Module (AppModule)

```typescript
// src/app/app.module.ts
import { NgModule }         from '@angular/core';
import { BrowserModule }    from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule }      from '@angular/forms';
import { CommonModule }     from '@angular/common';

import { AppComponent }             from './app.component';
import { HeaderComponent }          from './components/header/header.component';
import { HeroSectionComponent }     from './components/hero-section/hero-section.component';
import { CategoryTabsComponent }    from './components/category-tabs/category-tabs.component';
import { FilterSidebarComponent }   from './components/filter-sidebar/filter-sidebar.component';
import { FilterAccordionComponent } from './components/filter-accordion/filter-accordion.component';
import { ProductGridComponent }     from './components/product-grid/product-grid.component';
import { ProductCardComponent }     from './components/product-card/product-card.component';
import { ProductListItemComponent } from './components/product-list-item/product-list-item.component';
import { StarRatingComponent }      from './components/star-rating/star-rating.component';
import { QuickViewModalComponent }  from './components/quick-view-modal/quick-view-modal.component';
import { FooterComponent }          from './components/footer/footer.component';
import { CartService }              from './services/cart.service';
import { WishlistService }          from './services/wishlist.service';

@NgModule({
  declarations: [
    AppComponent, HeaderComponent, HeroSectionComponent,
    CategoryTabsComponent, FilterSidebarComponent,
    FilterAccordionComponent, ProductGridComponent,
    ProductCardComponent, ProductListItemComponent,
    StarRatingComponent, QuickViewModalComponent, FooterComponent,
  ],
  imports: [BrowserModule, BrowserAnimationsModule, FormsModule, CommonModule],
  providers: [CartService, WishlistService],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

---

## 8. Component: Announcement Bar

### Purpose
A fixed-top banner with the promo code. Part of the `HeaderComponent` or standalone.

### HTML Template

```html
<!-- announcement-bar.component.html -->
<div class="w-full bg-[#602314] text-white text-center py-2 text-sm tracking-wide">
  📚 Free shipping on orders over <strong>$35</strong> — Use code
  <span class="text-[#DD9047] font-semibold">BOOKWORM</span>
</div>
```

---

## 9. Component: Header / Navbar

### TypeScript

```typescript
// header.component.ts
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CartService }     from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { mobileMenuSlide } from '../../animations';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  animations: [mobileMenuSlide],
})
export class HeaderComponent implements OnInit, OnDestroy {
  scrolled      = false;
  mobileOpen    = false;
  searchFocused = false;
  searchValue   = '';
  cartCount     = 3;
  wishlistCount = 2;

  navLinks = [
    { label: 'Browse',       hasDropdown: true  },
    { label: 'New Arrivals', hasDropdown: false },
    { label: 'Best Sellers', hasDropdown: false },
    { label: 'Authors',      hasDropdown: false },
    { label: 'About',        hasDropdown: false },
  ];

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled = window.scrollY > 20;
  }

  clearSearch() { this.searchValue = ''; }
  toggleMobile() { this.mobileOpen = !this.mobileOpen; }
}
```

### HTML Template

```html
<!-- header.component.html -->
<!-- Announcement Bar -->
<div class="w-full bg-[#602314] text-white text-center py-2 text-sm tracking-wide">
  📚 Free shipping on orders over <strong>$35</strong> — Use code
  <span class="text-[#DD9047] font-semibold">BOOKWORM</span>
</div>

<!-- Main Header -->
<header
  class="sticky top-0 z-50 w-full border-b border-[#602314]/15 transition-all duration-300"
  [ngClass]="{
    'bg-white/95 backdrop-blur-md shadow-md': scrolled,
    'bg-[#FAF6F0]': !scrolled
  }">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16 gap-4">

      <!-- Logo -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <div class="w-9 h-9 bg-[#BC552A] rounded-lg flex items-center justify-center shadow-md">
          <!-- SVG: BookOpen icon -->
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
        </div>
        <div class="hidden sm:block">
          <span class="text-[#602314] font-black tracking-tight text-xl">Folio</span>
          <span class="text-[#BC552A] font-black tracking-tight text-xl">&amp;Co</span>
        </div>
      </div>

      <!-- Desktop Nav -->
      <nav class="hidden lg:flex items-center gap-1">
        <button *ngFor="let link of navLinks"
          class="flex items-center gap-1 px-3 py-2 text-[#602314] text-sm font-medium rounded-lg
                 hover:bg-[#BC552A]/10 hover:text-[#BC552A] transition-colors duration-200">
          {{ link.label }}
          <svg *ngIf="link.hasDropdown" class="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
      </nav>

      <!-- Search Bar -->
      <div class="flex-1 max-w-sm lg:max-w-md relative transition-all duration-300"
           [ngClass]="{'max-w-lg': searchFocused}">
        <div class="flex items-center rounded-xl border-2 transition-all duration-200 overflow-hidden"
             [ngClass]="{
               'border-[#BC552A] bg-white shadow-lg': searchFocused,
               'border-[#602314]/20 bg-white/70 hover:border-[#BC552A]/50': !searchFocused
             }">
          <svg class="w-4 h-4 ml-3.5 flex-shrink-0 transition-colors duration-200"
               [ngClass]="searchFocused ? 'text-[#BC552A]' : 'text-[#8A7260]'"
               fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
          </svg>
          <input type="text"
                 placeholder="Search books, authors, genres..."
                 [(ngModel)]="searchValue"
                 (focus)="searchFocused = true"
                 (blur)="searchFocused = false"
                 class="flex-1 px-3 py-2.5 text-sm bg-transparent text-[#602314]
                        placeholder:text-[#A08C7A] outline-none"/>
          <button *ngIf="searchValue" (click)="clearSearch()"
                  class="mr-2 text-[#8A7260] hover:text-[#BC552A] transition-colors">
            <!-- X icon SVG -->
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          <button class="bg-[#BC552A] hover:bg-[#A04820] text-white px-4 py-2.5 text-sm
                         font-medium transition-colors duration-200 flex-shrink-0">
            Search
          </button>
        </div>
      </div>

      <!-- Right Icons -->
      <div class="flex items-center gap-1">
        <!-- Wishlist -->
        <button class="relative p-2.5 rounded-xl text-[#602314] hover:bg-[#BC552A]/10
                       hover:text-[#BC552A] transition-all duration-200 hidden sm:flex items-center">
          <!-- Heart SVG -->
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
          <span *ngIf="wishlistCount > 0"
                class="absolute top-1 right-1 w-4 h-4 bg-[#DD9047] text-white text-[9px]
                       font-bold rounded-full flex items-center justify-center shadow-sm">
            {{ wishlistCount }}
          </span>
        </button>

        <!-- Cart -->
        <button class="relative p-2.5 rounded-xl text-[#602314] hover:bg-[#BC552A]/10
                       hover:text-[#BC552A] transition-all duration-200 flex items-center">
          <!-- ShoppingCart SVG -->
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <span *ngIf="cartCount > 0"
                class="absolute top-1 right-1 min-w-[1.1rem] px-0.5 h-4 bg-[#DD9047] text-white
                       text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
            {{ cartCount }}
          </span>
        </button>

        <!-- Sign In -->
        <button class="hidden md:flex items-center gap-1.5 ml-1 px-4 py-2 rounded-xl
                       bg-[#602314] hover:bg-[#BC552A] text-white text-sm font-medium
                       transition-all duration-200 shadow-sm">
          Sign In
        </button>

        <!-- Mobile Hamburger -->
        <button (click)="toggleMobile()"
                class="lg:hidden p-2.5 rounded-xl text-[#602314] hover:bg-[#BC552A]/10 transition-colors">
          <!-- Menu / X toggle -->
          <svg *ngIf="!mobileOpen" class="w-5 h-5" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
          <svg *ngIf="mobileOpen" class="w-5 h-5" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

    </div>
  </div>

  <!-- Mobile Menu -->
  <div [@mobileMenuSlide]="mobileOpen ? 'open' : 'closed'"
       class="lg:hidden overflow-hidden bg-white border-t border-[#602314]/10">
    <div class="px-4 py-3 space-y-1">
      <button *ngFor="let link of navLinks"
              class="w-full text-left px-3 py-2.5 text-[#602314] text-sm font-medium rounded-lg
                     hover:bg-[#BC552A]/10 hover:text-[#BC552A] transition-colors">
        {{ link.label }}
      </button>
      <div class="pt-2 border-t border-[#602314]/10">
        <button class="w-full px-3 py-2.5 bg-[#602314] text-white rounded-lg text-sm font-medium">
          Sign In
        </button>
      </div>
    </div>
  </div>
</header>
```

---

## 10. Component: Hero Section

### Key Visual Elements

| Element              | Description                                                                  |
|----------------------|------------------------------------------------------------------------------|
| Background image     | Full-width bookstore photo with a left-to-right gradient overlay             |
| Gradient overlay     | `from-[#FAF6F0] via-[#FAF6F0]/90 to-[#FAF6F0]/30` (left-heavy)             |
| Decorative blobs     | Two blurred circles: gold at top-center, rust at bottom-right               |
| Decorative ring      | Dashed gold border circle, rotates infinitely at 30s duration               |
| Gold glow behind book| Blurred circle `bg-[#DD9047]/10` blur-2xl                                   |
| Book cover           | Aspect ratio 2:3. On hover: `translateY(-8px) rotate(1deg)`, shine overlay  |
| Book spine           | Thin gradient overlay on left edge of book cover                             |
| Bestseller badge     | Gold circle, 56px, `rotate(12deg)`, top-right of book                       |
| Floating stat card   | White card with shadow, positioned bottom-left of book                      |

### TypeScript

```typescript
// hero-section.component.ts
import { Component } from '@angular/core';
import { bookHover, cartAdded } from '../../animations';

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.component.html',
  animations: [bookHover, cartAdded],
})
export class HeroSectionComponent {
  added       = false;
  bookHovered = false;

  readonly GATSBY_IMAGE = 'https://images.unsplash.com/photo-1714146996489-38849def0849?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';
  readonly BOOKSTORE_BG = 'https://images.unsplash.com/photo-1727342681676-b7b32b273add?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';

  readonly stats = [
    { label: 'Genre',     value: 'Classic Fiction' },
    { label: 'Pages',     value: '180'             },
    { label: 'Published', value: '1925'            },
  ];

  readonly stars = [1, 2, 3, 4, 5];
  readonly trustPills = ['Free Returns', 'Secure Checkout', 'In Stock'];

  addToCart() {
    this.added = true;
    setTimeout(() => this.added = false, 2000);
  }
}
```

### HTML Template (structure outline)

```html
<!-- hero-section.component.html -->
<section class="relative overflow-hidden bg-[#FAF6F0] min-h-[580px] flex items-center">

  <!-- Background image + gradient overlay -->
  <div class="absolute inset-0">
    <img [src]="BOOKSTORE_BG" alt="Bookstore" class="w-full h-full object-cover object-center"/>
    <div class="absolute inset-0 bg-gradient-to-r from-[#FAF6F0] via-[#FAF6F0]/90 to-[#FAF6F0]/30"></div>
  </div>

  <!-- Decorative blobs (pointer-events-none) -->
  <div class="absolute top-10 right-[35%] w-64 h-64 bg-[#DD9047]/10 rounded-full blur-3xl pointer-events-none"></div>
  <div class="absolute bottom-0 right-[20%] w-80 h-80 bg-[#BC552A]/[0.08] rounded-full blur-3xl pointer-events-none"></div>

  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 lg:py-20">
    <div class="grid lg:grid-cols-2 gap-12 items-center">

      <!-- LEFT: Content -->
      <div class="space-y-6 max-w-lg">

        <!-- Featured Badge -->
        <div class="inline-flex items-center gap-2 bg-[#DD9047]/15 border border-[#DD9047]/30
                    text-[#602314] px-4 py-1.5 rounded-full text-sm font-semibold">
          <!-- Award icon SVG -->
          Featured Pick of the Month
        </div>

        <!-- Title Block -->
        <div>
          <p class="text-[#BC552A] text-sm font-semibold tracking-widest uppercase mb-2">
            F. Scott Fitzgerald · Classic Fiction
          </p>
          <h1 class="text-[#602314] font-black leading-tight mb-3"
              style="font-size: clamp(2.5rem, 5vw, 3.75rem); line-height: 1.1">
            The Great<br>
            <span class="text-[#BC552A] italic">Gatsby</span>
          </h1>
          <p class="text-[#7A5C4A] text-base leading-relaxed">
            A dazzling 1920s novel about ambition, obsession, and the elusive American Dream.
          </p>
        </div>

        <!-- Star Rating Row -->
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-1">
            <!-- 5 stars, first 4 filled gold, last one outlined -->
            <svg *ngFor="let s of stars" class="w-5 h-5" viewBox="0 0 20 20">
              <!-- star path -->
            </svg>
          </div>
          <span class="text-[#602314] font-semibold text-sm">4.5</span>
          <span class="text-[#8A7260] text-sm">· 12,840 reviews</span>
        </div>

        <!-- Stats Row (Genre, Pages, Published) -->
        <div class="flex items-center gap-6 py-4 border-y border-[#602314]/10">
          <div *ngFor="let stat of stats" class="text-center">
            <div class="text-[#602314] font-bold text-sm">{{ stat.value }}</div>
            <div class="text-[#8A7260] text-xs">{{ stat.label }}</div>
          </div>
        </div>

        <!-- Price -->
        <div class="flex items-baseline gap-3">
          <span class="text-[#602314] font-black" style="font-size: 2rem">$14.99</span>
          <span class="text-[#8A7260] text-base line-through">$22.00</span>
          <span class="bg-[#BC552A] text-white text-xs font-bold px-2 py-0.5 rounded-md">32% OFF</span>
        </div>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button (click)="addToCart()"
                  class="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm
                         transition-all duration-300 shadow-md active:scale-95"
                  [ngClass]="added
                    ? 'bg-green-600 text-white'
                    : 'bg-[#BC552A] hover:bg-[#A04820] text-white hover:shadow-[#BC552A]/25'">
            {{ added ? 'Added to Cart!' : 'Add to Cart' }}
          </button>
          <button class="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm
                         border-2 border-[#602314] text-[#602314] hover:bg-[#602314]
                         hover:text-white transition-all duration-300 active:scale-95">
            Preview Book
          </button>
        </div>

        <!-- Trust Pills -->
        <div class="flex flex-wrap gap-2">
          <span *ngFor="let pill of trustPills"
                class="flex items-center gap-1.5 text-xs text-[#602314] bg-[#602314]/[0.08]
                       px-3 py-1 rounded-full font-medium">
            <span class="w-1.5 h-1.5 rounded-full bg-[#DD9047] inline-block"></span>
            {{ pill }}
          </span>
        </div>
      </div>

      <!-- RIGHT: Book Cover -->
      <div class="flex justify-center lg:justify-end items-center relative">

        <!-- Spinning dashed ring (CSS animation) -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="w-72 h-72 lg:w-96 lg:h-96 rounded-full border-2 border-dashed
                      border-[#DD9047]/25 animate-spin-slow"></div>
        </div>

        <!-- Gold glow blob -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="w-52 h-52 lg:w-72 lg:h-72 rounded-full bg-[#DD9047]/10 blur-2xl"></div>
        </div>

        <!-- Book -->
        <div class="relative z-10" (mouseenter)="bookHovered=true" (mouseleave)="bookHovered=false">
          <div class="relative w-52 sm:w-64 lg:w-72">
            <!-- Drop shadow beneath book -->
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 w-44 h-8
                        bg-[#602314]/25 blur-xl rounded-full"></div>

            <!-- Book image wrapper -->
            <div class="relative rounded-xl overflow-hidden shadow-2xl shadow-[#602314]/30
                        transition-all duration-500"
                 [ngStyle]="bookHovered ? {transform:'translateY(-8px) rotate(1deg)'} : {}">
              <img [src]="GATSBY_IMAGE" alt="The Great Gatsby"
                   class="w-full object-cover" style="aspect-ratio: 2/3"/>
              <!-- Shine overlay on hover -->
              <div class="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent
                          transition-opacity duration-500"
                   [ngClass]="bookHovered ? 'opacity-100' : 'opacity-0'"></div>
              <!-- Spine gradient -->
              <div class="absolute left-0 top-0 bottom-0 w-4
                          bg-gradient-to-r from-[#602314]/40 to-transparent"></div>
            </div>

            <!-- Bestseller Badge -->
            <div class="absolute -top-3 -right-3 w-14 h-14 bg-[#DD9047] rounded-full
                        flex flex-col items-center justify-center shadow-lg rotate-12 border-2 border-white">
              <span class="text-white text-[8px] font-black leading-none text-center">BEST</span>
              <span class="text-white text-[8px] font-black leading-none text-center">SELLER</span>
            </div>
          </div>
        </div>

        <!-- Floating stat card -->
        <div class="absolute bottom-4 -left-4 lg:bottom-10 lg:-left-8 bg-white rounded-xl
                    shadow-lg shadow-[#602314]/10 px-4 py-3 border border-[#602314]/10 z-20 hidden sm:block">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-[#BC552A]/10 rounded-lg flex items-center justify-center">
              <!-- BookOpen icon -->
            </div>
            <div>
              <p class="text-[#602314] text-xs font-bold">2,400+ sold</p>
              <p class="text-[#8A7260] text-[10px]">this month</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>
```

---

## 11. Component: Category Tabs Bar

### HTML Template

```html
<!-- category-tabs.component.html -->
<div class="bg-white border-y border-[#602314]/10 shadow-sm">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center gap-0 overflow-x-auto scrollbar-hide py-1">
      <button
        *ngFor="let tab of tabs; let i = index"
        (click)="activeTab = i"
        class="flex-shrink-0 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2"
        [ngClass]="{
          'border-[#BC552A] text-[#BC552A]':          activeTab === i,
          'border-transparent text-[#602314] hover:text-[#BC552A] hover:border-[#BC552A]/40': activeTab !== i
        }">
        {{ tab }}
      </button>
    </div>
  </div>
</div>
```

### TypeScript

```typescript
import { Component } from '@angular/core';
import { GENRE_TABS } from '../../data/books.data';

@Component({ selector: 'app-category-tabs', templateUrl: './category-tabs.component.html' })
export class CategoryTabsComponent {
  tabs      = GENRE_TABS;
  activeTab = 0;
}
```

---

## 12. Component: Filter Sidebar

### FilterAccordion Sub-Component

```typescript
// filter-accordion.component.ts
import { Component, Input } from '@angular/core';
import { slideDown } from '../../animations';

@Component({
  selector: 'app-filter-accordion',
  template: `
    <div class="border-b border-[#602314]/10 last:border-b-0">
      <button (click)="open = !open"
              class="w-full flex items-center justify-between py-3.5 text-left group">
        <span class="text-[#602314] font-semibold text-sm
                     group-hover:text-[#BC552A] transition-colors">{{ title }}</span>
        <svg class="w-4 h-4 text-[#8A7260] transition-transform duration-300"
             [ngClass]="{'rotate-180': open}"
             fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      <div [@slideDown]="open ? 'open' : 'closed'" class="overflow-hidden">
        <ng-content></ng-content>
      </div>
    </div>`,
  animations: [slideDown],
})
export class FilterAccordionComponent {
  @Input() title = '';
  @Input() defaultOpen = true;
  open = this.defaultOpen;
  ngOnInit() { this.open = this.defaultOpen; }
}
```

### FilterSidebar State

```typescript
// filter-sidebar.component.ts
import { Component } from '@angular/core';
import { CATEGORIES, AUTHORS, FORMATS } from '../../data/books.data';

@Component({
  selector: 'app-filter-sidebar',
  templateUrl: './filter-sidebar.component.html',
})
export class FilterSidebarComponent {
  categories = CATEGORIES;
  authors    = AUTHORS;
  formats    = FORMATS;
  ratings    = [5, 4, 3, 2, 1];

  selectedCategories: string[]  = ['classic'];
  selectedAuthors:    string[]  = [];
  selectedRating:     number | null = null;
  selectedFormats:    string[]  = [];
  priceMin = 5;
  priceMax = 50;

  get activeFiltersCount() {
    return this.selectedCategories.length + this.selectedAuthors.length +
           (this.selectedRating ? 1 : 0) + this.selectedFormats.length;
  }

  get trackFillLeft()  { return `${((this.priceMin - 5) / 95) * 100}%`; }
  get trackFillRight() { return `${100 - ((this.priceMax - 5) / 95) * 100}%`; }

  toggleCategory(id: string) {
    this.selectedCategories = this.selectedCategories.includes(id)
      ? this.selectedCategories.filter(c => c !== id)
      : [...this.selectedCategories, id];
  }

  toggleAuthor(id: string) {
    this.selectedAuthors = this.selectedAuthors.includes(id)
      ? this.selectedAuthors.filter(a => a !== id)
      : [...this.selectedAuthors, id];
  }

  toggleFormat(fmt: string) {
    this.selectedFormats = this.selectedFormats.includes(fmt)
      ? this.selectedFormats.filter(f => f !== fmt)
      : [...this.selectedFormats, fmt];
  }

  setRating(r: number) {
    this.selectedRating = this.selectedRating === r ? null : r;
  }

  clearAll() {
    this.selectedCategories = [];
    this.selectedAuthors    = [];
    this.selectedRating     = null;
    this.selectedFormats    = [];
    this.priceMin = 5;
    this.priceMax = 50;
  }

  isSelected(arr: string[], id: string) { return arr.includes(id); }
  starsArray(n: number) { return Array(5).fill(0).map((_, i) => i < n); }
}
```

### Price Range Slider CSS

```scss
// For the dual-thumb price slider, use two overlapping range inputs
// stacked with position:absolute and opacity:0, plus visual thumb divs

.price-track {
  position: relative;
  height: 6px;
  background: rgba(96, 35, 20, 0.1);
  border-radius: 9999px;
}
.price-fill {
  position: absolute;
  height: 6px;
  background: linear-gradient(to right, #BC552A, #DD9047);
  border-radius: 9999px;
}
.price-thumb {
  position: absolute;
  width: 16px; height: 16px;
  background: white;
  border: 2px solid var(--border-color); // #BC552A for min, #DD9047 for max
  border-radius: 9999px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  transform: translateX(-50%);
  cursor: pointer;
}
```

---

## 13. Component: Star Rating

### TypeScript

```typescript
// star-rating.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  template: `
    <div class="flex items-center gap-1.5">
      <div class="flex items-center gap-0.5">
        <svg *ngFor="let s of starsConfig" [ngClass]="sizeClass"
             viewBox="0 0 20 20" fill="none">
          <defs *ngIf="s.type === 'partial'">
            <linearGradient [id]="'pg-'+s.index" x1="0" x2="1" y1="0" y2="0">
              <stop [attr.offset]="s.percent+'%'" stop-color="#DD9047"/>
              <stop [attr.offset]="s.percent+'%'" stop-color="#D4C5B0"/>
            </linearGradient>
          </defs>
          <path [attr.fill]="s.fill" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0
            00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755
            1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1
            1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      </div>
      <span *ngIf="reviewCount !== undefined" [ngClass]="textSizeClass" class="text-[#8A7260]">
        ({{ reviewCount | number }})
      </span>
    </div>`,
})
export class StarRatingComponent {
  @Input() rating     = 0;
  @Input() maxStars   = 5;
  @Input() reviewCount?: number;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get sizeClass()     { return { sm:'w-3 h-3', md:'w-4 h-4', lg:'w-5 h-5' }[this.size]; }
  get textSizeClass() { return { sm:'text-xs', md:'text-sm', lg:'text-base' }[this.size]; }

  get starsConfig() {
    return Array.from({ length: this.maxStars }, (_, i) => {
      const filled   = i < Math.floor(this.rating);
      const partial  = !filled && i < this.rating;
      const pct      = Math.round((this.rating % 1) * 100);
      const fill     = filled  ? '#DD9047'
                     : partial ? `url(#pg-${i})`
                     : '#D4C5B0';
      return { type: filled ? 'full' : partial ? 'partial' : 'empty', fill, percent: pct, index: i };
    });
  }
}
```

---

## 14. Component: Product Card (Grid View)

### Behavior Specifications

| Interaction                 | Effect                                                      |
|-----------------------------|-------------------------------------------------------------|
| Card hover                  | `shadow-xl`, border color darkens to `border-[#602314]/20` |
| Book image hover            | `translateY(-4px)` (lift up 4px)                           |
| Wishlist btn (not active)   | Hidden (`opacity-0`), shows on card hover (`opacity-100`)   |
| Wishlist btn (active)       | Always visible, `bg-[#BC552A]` filled heart                 |
| Quick View overlay on image | Dark overlay + Eye icon + "Quick View" text on hover        |
| Add to Cart button          | On click: turns green for 2s, then reverts to rust          |
| Badge top-left              | rust=`#BC552A`, gold=`#DD9047`, maroon=`#602314`            |
| Discount badge bottom-right | `bg-[#DD9047]` gold, shows `-X%`                            |

### TypeScript

```typescript
// product-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
})
export class ProductCardComponent {
  @Input() book!: Book;
  @Input() isWishlisted = false;
  @Input() isAdded      = false;
  @Output() quickView  = new EventEmitter<void>();
  @Output() addToCart  = new EventEmitter<MouseEvent>();
  @Output() wishlist   = new EventEmitter<MouseEvent>();

  hovered = false;

  get discount(): number | null {
    if (!this.book.originalPrice) return null;
    return Math.round(((this.book.originalPrice - this.book.price) / this.book.originalPrice) * 100);
  }

  get badgeBg(): string {
    return { rust:'bg-[#BC552A]', gold:'bg-[#DD9047]', maroon:'bg-[#602314]' }[this.book.badgeColor ?? 'rust'];
  }
}
```

### HTML Template

```html
<!-- product-card.component.html -->
<div class="group bg-white rounded-2xl border border-[#602314]/10 overflow-hidden
            hover:shadow-xl hover:shadow-[#602314]/10 hover:border-[#602314]/20
            transition-all duration-300 cursor-pointer flex flex-col"
     (click)="quickView.emit()">

  <!-- Image Area -->
  <div class="relative bg-gradient-to-b from-[#FAF6F0] to-[#F0E8DC] pt-5 pb-2 px-5 flex justify-center overflow-hidden">

    <!-- Badge -->
    <div *ngIf="book.badge"
         class="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm"
         [ngClass]="badgeBg">
      {{ book.badge }}
    </div>

    <!-- Wishlist Button -->
    <button (click)="$event.stopPropagation(); wishlist.emit($event)"
            class="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full flex items-center
                   justify-center transition-all duration-200"
            [ngClass]="isWishlisted
              ? 'bg-[#BC552A] text-white shadow-md'
              : 'bg-white/80 text-[#8A7260] hover:bg-[#BC552A] hover:text-white opacity-0 group-hover:opacity-100'">
      <!-- Heart SVG - use fill="currentColor" when wishlisted, fill="none" otherwise -->
      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
           [attr.fill]="isWishlisted ? 'currentColor' : 'none'">
        <path stroke-linecap="round" stroke-linejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
      </svg>
    </button>

    <!-- Book Image with hover lift -->
    <div class="relative w-24 sm:w-28 group-hover:-translate-y-1 transition-transform duration-300">
      <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-3
                  bg-[#602314]/15 blur-md rounded-full"></div>
      <img [src]="book.image" [alt]="book.title"
           class="w-full rounded-lg shadow-lg shadow-[#602314]/20"
           style="aspect-ratio: 2/3; object-fit: cover"/>
      <!-- Quick View overlay -->
      <div class="absolute inset-0 bg-[#2A1208]/50 opacity-0 group-hover:opacity-100
                  transition-opacity duration-300 rounded-lg flex items-center justify-center">
        <div class="flex flex-col items-center gap-1.5">
          <!-- Eye icon SVG -->
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
          <span class="text-white text-[10px] font-semibold">Quick View</span>
        </div>
      </div>
    </div>

    <!-- Discount Badge -->
    <div *ngIf="discount"
         class="absolute bottom-2 right-2.5 bg-[#DD9047] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
      -{{ discount }}%
    </div>
  </div>

  <!-- Card Body -->
  <div class="flex flex-col gap-2 p-3.5 flex-1">
    <div>
      <p class="text-[#BC552A] text-[10px] font-semibold uppercase tracking-wide truncate">{{ book.genre }}</p>
      <h3 class="text-[#602314] font-bold text-sm leading-tight mt-0.5 line-clamp-2">{{ book.title }}</h3>
      <p class="text-[#8A7260] text-xs mt-0.5 truncate">{{ book.author }}</p>
    </div>

    <app-star-rating [rating]="book.rating" [reviewCount]="book.reviews" size="sm"></app-star-rating>

    <div class="flex items-center gap-2 mt-auto">
      <span class="text-[#602314] font-black text-sm">${{ book.price.toFixed(2) }}</span>
      <span *ngIf="book.originalPrice" class="text-[#8A7260] text-xs line-through">
        ${{ book.originalPrice.toFixed(2) }}
      </span>
    </div>

    <button (click)="$event.stopPropagation(); addToCart.emit($event)"
            class="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs
                   font-semibold transition-all duration-200 active:scale-95"
            [ngClass]="isAdded
              ? 'bg-green-600 text-white'
              : 'bg-[#BC552A] hover:bg-[#A04820] text-white shadow-sm'">
      {{ isAdded ? 'Added!' : 'Add to Cart' }}
    </button>
  </div>
</div>
```

---

## 15. Component: Product List Item (List View)

Same `@Input()` / `@Output()` interface as Product Card, but horizontal layout:

```
[thumbnail 64–80px] [content flex-1] [price+actions right-aligned]
```

Key differences from grid card:
- Container: `flex gap-4 p-4` (horizontal)
- Image: `w-16 sm:w-20`, no hover lift
- Badge becomes a small circle with ★ at top-right of image
- Description shows first 100 chars
- Actions: Eye icon button + smaller Add button side by side
- Price shown with discount pill inline

---

## 16. Component: Product Grid (Container)

### TypeScript

```typescript
// product-grid.component.ts
import { Component } from '@angular/core';
import { BOOKS, SORT_OPTIONS } from '../../data/books.data';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-product-grid',
  templateUrl: './product-grid.component.html',
})
export class ProductGridComponent {
  books        = BOOKS;
  sortOptions  = SORT_OPTIONS;
  activeSort   = SORT_OPTIONS[0];
  view: 'grid' | 'list' = 'grid';
  selectedBook: Book | null = null;
  wishlist     = [4, 7];  // initial wishlisted IDs
  addedToCart: number[] = [];

  isWishlisted(id: number) { return this.wishlist.includes(id); }
  isAdded(id: number)      { return this.addedToCart.includes(id); }

  toggleWishlist(id: number) {
    this.wishlist = this.wishlist.includes(id)
      ? this.wishlist.filter(w => w !== id)
      : [...this.wishlist, id];
  }

  handleAddToCart(id: number) {
    this.addedToCart = [...this.addedToCart, id];
    setTimeout(() => {
      this.addedToCart = this.addedToCart.filter(c => c !== id);
    }, 2000);
  }

  openQuickView(book: Book)  { this.selectedBook = book; }
  closeQuickView()           { this.selectedBook = null; }
}
```

### Toolbar Layout

```html
<!-- Toolbar: count + sort + view toggle -->
<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
  <div>
    <p class="text-[#602314] font-semibold text-sm">
      Showing <span class="text-[#BC552A]">{{ books.length }}</span> books
    </p>
    <p class="text-[#8A7260] text-xs">in all categories</p>
  </div>
  <div class="flex items-center gap-3">
    <!-- Sort Select -->
    <select [(ngModel)]="activeSort"
            class="text-sm border-2 border-[#602314]/15 rounded-xl px-3 py-2 text-[#602314]
                   bg-white hover:border-[#BC552A]/40 focus:border-[#BC552A] outline-none cursor-pointer">
      <option *ngFor="let o of sortOptions" [value]="o">{{ o }}</option>
    </select>

    <!-- Grid/List Toggle -->
    <div class="flex items-center bg-white border-2 border-[#602314]/15 rounded-xl overflow-hidden">
      <button (click)="view='grid'" class="p-2 transition-colors"
              [ngClass]="view==='grid' ? 'bg-[#BC552A] text-white' : 'text-[#8A7260] hover:text-[#602314]'">
        <!-- Grid icon SVG -->
      </button>
      <button (click)="view='list'" class="p-2 transition-colors"
              [ngClass]="view==='list' ? 'bg-[#BC552A] text-white' : 'text-[#8A7260] hover:text-[#602314]'">
        <!-- List icon SVG -->
      </button>
    </div>
  </div>
</div>

<!-- Trending header row -->
<div class="flex items-center gap-2 mb-5">
  <!-- TrendingUp icon -->
  <span class="text-[#602314] font-bold text-sm">Trending Now</span>
  <div class="flex-1 h-px bg-[#602314]/10"></div>
  <!-- Sparkles icon -->
</div>

<!-- Book Grid -->
<div [ngClass]="view === 'grid'
  ? 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
  : 'flex flex-col gap-4'">
  <ng-container *ngFor="let book of books">
    <app-product-card *ngIf="view === 'grid'"
      [book]="book"
      [isWishlisted]="isWishlisted(book.id)"
      [isAdded]="isAdded(book.id)"
      (quickView)="openQuickView(book)"
      (addToCart)="handleAddToCart(book.id)"
      (wishlist)="toggleWishlist(book.id)">
    </app-product-card>
    <app-product-list-item *ngIf="view === 'list'"
      [book]="book"
      [isWishlisted]="isWishlisted(book.id)"
      [isAdded]="isAdded(book.id)"
      (quickView)="openQuickView(book)"
      (addToCart)="handleAddToCart(book.id)"
      (wishlist)="toggleWishlist(book.id)">
    </app-product-list-item>
  </ng-container>
</div>

<!-- Quick View Modal -->
<app-quick-view-modal
  *ngIf="selectedBook"
  [book]="selectedBook"
  (close)="closeQuickView()">
</app-quick-view-modal>
```

---

## 17. Component: Quick View Modal

### Layout

The modal is a two-column layout (on md+):
- **Left** (40% width): Warm gradient background (`from-[#FAF6F0] to-[#F0E8DC]`), centered book cover image
- **Right** (60% width): Scrollable detail pane with tabs

### Angular Implementation

```typescript
// quick-view-modal.component.ts
import { Component, Input, Output, EventEmitter, OnChanges, HostListener } from '@angular/core';
import { Book } from '../../models/book.model';
import { fadeInModal, fadeInBackdrop } from '../../animations';

@Component({
  selector: 'app-quick-view-modal',
  templateUrl: './quick-view-modal.component.html',
  animations: [fadeInModal, fadeInBackdrop],
})
export class QuickViewModalComponent implements OnChanges {
  @Input()  book!: Book;
  @Output() close = new EventEmitter<void>();

  quantity  = 1;
  activeTab: 'overview' | 'details' = 'overview';
  added     = false;

  ngOnChanges() {
    if (this.book) {
      document.body.style.overflow = 'hidden';
      this.quantity  = 1;
      this.added     = false;
      this.activeTab = 'overview';
    }
  }

  @HostListener('document:keydown.escape')
  onEsc() { this.dismiss(); }

  dismiss() {
    document.body.style.overflow = '';
    this.close.emit();
  }

  addToCart() {
    this.added = true;
    setTimeout(() => this.added = false, 2000);
  }

  get discount(): number | null {
    if (!this.book?.originalPrice) return null;
    return Math.round(((this.book.originalPrice - this.book.price) / this.book.originalPrice) * 100);
  }

  get badgeBg(): string {
    return { rust:'bg-[#BC552A]', gold:'bg-[#DD9047]', maroon:'bg-[#602314]' }
      [this.book?.badgeColor ?? 'rust'];
  }

  get detailItems() {
    return [
      { label: 'Pages',     value: this.book.pages ? `${this.book.pages} pages` : 'N/A' },
      { label: 'Published', value: this.book.year || 'N/A' },
      { label: 'Format',    value: 'Hardcover' },
      { label: 'Language',  value: 'English'   },
      { label: 'Genre',     value: this.book.genre },
      { label: 'ISBN',      value: '978-0-7432-7356-5' },
    ];
  }
}
```

### HTML Template

```html
<!-- quick-view-modal.component.html -->
<div class="fixed inset-0 z-50 flex items-center justify-center p-4">

  <!-- Backdrop -->
  <div [@fadeInBackdrop]
       class="absolute inset-0 bg-[#2A1208]/60 backdrop-blur-sm"
       (click)="dismiss()"></div>

  <!-- Modal Panel -->
  <div [@fadeInModal]
       class="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl
              max-h-[90vh] overflow-hidden flex flex-col">

    <!-- Close Button -->
    <button (click)="dismiss()"
            class="absolute top-4 right-4 z-10 w-8 h-8 bg-[#FAF6F0] hover:bg-[#BC552A]
                   text-[#602314] hover:text-white rounded-full flex items-center
                   justify-center transition-all duration-200 shadow-sm">
      <!-- X icon -->
    </button>

    <div class="flex flex-col md:flex-row overflow-y-auto md:overflow-hidden flex-1">

      <!-- Left: Image Panel -->
      <div class="md:w-2/5 bg-gradient-to-br from-[#FAF6F0] to-[#F0E8DC]
                  flex items-center justify-center p-8 relative flex-shrink-0">
        <div *ngIf="book.badge"
             class="absolute top-4 left-4 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-sm"
             [ngClass]="badgeBg">{{ book.badge }}</div>
        <div class="relative">
          <div class="absolute -bottom-4 left-1/2 -translate-x-1/2
                      w-32 h-6 bg-[#602314]/20 blur-lg rounded-full"></div>
          <img [src]="book.image" [alt]="book.title"
               class="w-44 object-cover rounded-xl shadow-xl shadow-[#602314]/25
                      transition-all duration-500 hover:-translate-y-1"
               style="aspect-ratio: 2/3"/>
        </div>
      </div>

      <!-- Right: Detail Panel -->
      <div class="flex-1 flex flex-col overflow-y-auto">
        <div class="p-6 flex flex-col gap-4 flex-1">

          <!-- Genre + Title -->
          <div>
            <span class="text-[#BC552A] text-xs font-semibold tracking-wider uppercase">
              {{ book.genre }}
            </span>
            <h2 class="text-[#602314] font-black mt-1" style="font-size:1.5rem; line-height:1.2">
              {{ book.title }}
            </h2>
            <p class="text-[#8A7260] text-sm mt-0.5">
              by <span class="text-[#602314] font-medium">{{ book.author }}</span>
            </p>
          </div>

          <!-- Rating -->
          <div class="flex items-center gap-3">
            <app-star-rating [rating]="book.rating" [reviewCount]="book.reviews" size="md">
            </app-star-rating>
            <span class="text-[#602314] font-bold text-sm">{{ book.rating.toFixed(1) }}</span>
          </div>

          <!-- Price -->
          <div class="flex items-baseline gap-3">
            <span class="text-[#602314] font-black text-2xl">${{ book.price.toFixed(2) }}</span>
            <ng-container *ngIf="book.originalPrice">
              <span class="text-[#8A7260] text-base line-through">
                ${{ book.originalPrice.toFixed(2) }}
              </span>
              <span *ngIf="discount"
                    class="bg-[#BC552A] text-white text-xs font-bold px-2 py-0.5 rounded-md">
                {{ discount }}% OFF
              </span>
            </ng-container>
          </div>

          <!-- Tabs -->
          <div class="border-b border-[#602314]/10">
            <div class="flex gap-4">
              <button *ngFor="let tab of ['overview','details']"
                      (click)="activeTab = tab"
                      class="pb-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px"
                      [ngClass]="activeTab === tab
                        ? 'border-[#BC552A] text-[#BC552A]'
                        : 'border-transparent text-[#8A7260] hover:text-[#602314]'">
                {{ tab }}
              </button>
            </div>
          </div>

          <!-- Tab Content -->
          <p *ngIf="activeTab === 'overview'" class="text-[#7A5C4A] text-sm leading-relaxed">
            {{ book.description }}
          </p>
          <div *ngIf="activeTab === 'details'" class="grid grid-cols-2 gap-2 text-sm">
            <div *ngFor="let item of detailItems" class="bg-[#FAF6F0] rounded-lg px-3 py-2">
              <div class="text-[#8A7260] text-[10px] uppercase tracking-wide">{{ item.label }}</div>
              <div class="text-[#602314] font-medium text-xs mt-0.5">{{ item.value }}</div>
            </div>
          </div>

          <!-- Quantity + Add to Cart -->
          <div class="flex items-center gap-3 mt-auto">
            <div class="flex items-center border-2 border-[#602314]/20 rounded-xl overflow-hidden">
              <button (click)="quantity = quantity > 1 ? quantity - 1 : 1"
                      class="px-3 py-2 text-[#602314] hover:bg-[#BC552A]/10 transition-colors font-bold">
                −
              </button>
              <span class="px-3 py-2 text-[#602314] font-semibold min-w-[2rem] text-center text-sm">
                {{ quantity }}
              </span>
              <button (click)="quantity = quantity + 1"
                      class="px-3 py-2 text-[#602314] hover:bg-[#BC552A]/10 transition-colors font-bold">
                +
              </button>
            </div>
            <button (click)="addToCart()"
                    class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                           text-sm font-semibold transition-all duration-300 active:scale-95"
                    [ngClass]="added
                      ? 'bg-green-600 text-white'
                      : 'bg-[#BC552A] hover:bg-[#A04820] text-white shadow-md'">
              {{ added ? 'Added!' : 'Add to Cart' }}
            </button>
            <!-- Wishlist + Share icon buttons -->
          </div>

          <!-- Delivery note -->
          <div class="flex items-center gap-2 text-xs text-[#8A7260] bg-[#FAF6F0] rounded-lg px-3 py-2">
            <!-- Truck icon SVG -->
            Free delivery on orders over $35 · Ships within 2–3 business days
          </div>

        </div>
      </div>
    </div>
  </div>
</div>
```

---

## 18. Component: Footer

### Structure

```
[Newsletter Band — bg-[#BC552A]]
  [Max-width container]
    [Left: heading + subtitle]
    [Right: email input + subscribe button]

[Main Footer — bg-[#602314]]
  [Max-width container]
    [Grid: 4 columns on md+, 2 on sm]
      [Col 1: Brand logo + tagline + social icons]
      [Col 2: Browse links]
      [Col 3: Account links]
      [Col 4: Help links]
    [Bottom bar: copyright + policy links]
```

### Footer Link Groups

```typescript
footerCols = [
  {
    title: 'Browse',
    links: ['New Arrivals', 'Best Sellers', 'Award Winners', 'Staff Picks', 'Sale'],
  },
  {
    title: 'Account',
    links: ['Sign In', 'Create Account', 'Wishlist', 'Order History', 'Reading List'],
  },
  {
    title: 'Help',
    links: ['Shipping Info', 'Returns', 'FAQ', 'Contact Us', 'Store Locator'],
  },
];
```

### Key Styles

```
Newsletter band:    bg-[#BC552A]
Footer body:        bg-[#602314]
Text default:       text-white/55 (links), text-white (headings)
Link hover:         text-[#DD9047]
Social icons:       bg-white/10 rounded-lg, hover:bg-[#DD9047]
Subscribe button:   bg-[#602314] hover:bg-[#4A1A0D] text-white
Border top:         border-white/10
```

---

## 19. Page Layout — app.component

### HTML

```html
<!-- app.component.html -->
<div class="min-h-screen bg-[#FAF6F0]" style="font-family:'Inter',sans-serif">

  <app-header></app-header>
  <app-hero-section></app-hero-section>
  <app-category-tabs></app-category-tabs>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

    <!-- Mobile Filter Button -->
    <div class="lg:hidden mb-4">
      <button (click)="mobileSidebarOpen = true"
              class="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-[#602314]/15
                     rounded-xl text-[#602314] text-sm font-medium hover:border-[#BC552A]/40 transition-all">
        <!-- SlidersHorizontal icon --> Filters &amp; Sort
      </button>
    </div>

    <div class="flex gap-6 items-start">

      <!-- Desktop Sidebar -->
      <div class="hidden lg:block w-64 flex-shrink-0 sticky top-20">
        <app-filter-sidebar></app-filter-sidebar>
      </div>

      <!-- Mobile Sidebar Drawer -->
      <ng-container *ngIf="mobileSidebarOpen">
        <div class="fixed inset-0 z-40 lg:hidden">
          <div class="absolute inset-0 bg-[#2A1208]/50 backdrop-blur-sm"
               (click)="mobileSidebarOpen = false"></div>
          <div [@mobileSidebarSlide]
               class="absolute left-0 top-0 bottom-0 w-72 bg-[#FAF6F0] shadow-2xl overflow-y-auto">
            <div class="flex items-center justify-between px-4 py-4 border-b border-[#602314]/10">
              <span class="text-[#602314] font-bold">Filters</span>
              <button (click)="mobileSidebarOpen = false"
                      class="w-7 h-7 rounded-full bg-[#602314]/10 flex items-center justify-center
                             text-[#602314] hover:bg-[#BC552A] hover:text-white transition-all">
                <!-- X icon -->
              </button>
            </div>
            <div class="p-4">
              <app-filter-sidebar></app-filter-sidebar>
            </div>
          </div>
        </div>
      </ng-container>

      <app-product-grid></app-product-grid>
    </div>
  </main>

  <app-footer></app-footer>
</div>
```

### TypeScript

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { mobileSidebarSlide } from './animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  animations: [mobileSidebarSlide],
})
export class AppComponent {
  mobileSidebarOpen = false;
}
```

---

## 20. Angular Services

### CartService

```typescript
// src/app/services/cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Book } from '../models/book.model';

export interface CartItem { book: Book; quantity: number; }

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = new BehaviorSubject<CartItem[]>([]);
  items$ = this._items.asObservable();

  get count() {
    return this._items.value.reduce((acc, i) => acc + i.quantity, 0);
  }

  add(book: Book, qty = 1) {
    const items = this._items.value;
    const existing = items.find(i => i.book.id === book.id);
    if (existing) {
      this._items.next(items.map(i =>
        i.book.id === book.id ? { ...i, quantity: i.quantity + qty } : i
      ));
    } else {
      this._items.next([...items, { book, quantity: qty }]);
    }
  }

  remove(bookId: number) {
    this._items.next(this._items.value.filter(i => i.book.id !== bookId));
  }
}
```

### WishlistService

```typescript
// src/app/services/wishlist.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private _ids = new BehaviorSubject<number[]>([4, 7]);
  ids$ = this._ids.asObservable();

  get count() { return this._ids.value.length; }

  toggle(id: number) {
    const ids = this._ids.value;
    this._ids.next(ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  }

  isWishlisted(id: number) { return this._ids.value.includes(id); }
}
```

---

## 21. Angular Routing

```typescript
// src/app/app-routing.module.ts
import { NgModule }              from '@angular/core';
import { RouterModule, Routes }  from '@angular/router';
import { HomePageComponent }     from './pages/home/home-page.component';
import { BookDetailComponent }   from './pages/book-detail/book-detail.component';
import { SearchResultsComponent} from './pages/search/search-results.component';

const routes: Routes = [
  { path: '',          component: HomePageComponent,      title: 'Folio&Co — Bookstore' },
  { path: 'book/:id',  component: BookDetailComponent,    title: 'Book Detail' },
  { path: 'search',    component: SearchResultsComponent, title: 'Search Results' },
  { path: '**',        redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
```

---

## 22. Image Assets & URLs

All images are hosted on Unsplash (no API key required for direct linking):

| Book / Scene         | URL |
|----------------------|-----|
| The Great Gatsby     | `https://images.unsplash.com/photo-1714146996489-38849def0849?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080` |
| Bookstore BG (hero)  | `https://images.unsplash.com/photo-1727342681676-b7b32b273add?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080` |
| 1984 / Classic       | `https://images.unsplash.com/photo-1572091574819-ea8bb5394b1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400` |
| Mystery / Thriller   | `https://images.unsplash.com/photo-1528459061998-56fd57ad86e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400` |
| Dune / Sci-Fi        | `https://images.unsplash.com/photo-1633680842723-2a0d770f2b74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400` |
| Pride & Prejudice    | `https://images.unsplash.com/photo-1723532172898-16ec15026bbd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400` |
| Meditations          | `https://images.unsplash.com/photo-1675289678562-18174b2c2d03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400` |
| Educated / Biography | `https://images.unsplash.com/photo-1591778967891-4c44dbb3e636?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400` |
| Leaves of Grass      | `https://images.unsplash.com/photo-1619038766935-51e0c074f5e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400` |

---

## Quick-Start Checklist

- [ ] `ng new folio-bookstore --routing --style=scss`
- [ ] Install and configure Tailwind CSS v3 + `@tailwindcss/line-clamp`
- [ ] Add Inter font to `styles.scss` via Google Fonts import
- [ ] Copy color tokens and keyframe animations into `styles.scss`
- [ ] Create `src/app/animations.ts` with all Angular Animation triggers
- [ ] Create `src/app/models/book.model.ts`
- [ ] Create `src/app/data/books.data.ts` with mock data
- [ ] Create `CartService` and `WishlistService`
- [ ] Generate components in order: StarRating → Header → HeroSection → CategoryTabs → FilterAccordion → FilterSidebar → ProductCard → ProductListItem → ProductGrid → QuickViewModal → Footer
- [ ] Wire routing in `AppRoutingModule`
- [ ] Add `BrowserAnimationsModule` to `AppModule`
- [ ] Add `FormsModule` for `[(ngModel)]` on search input and sort select

---

*Document generated from Folio&Co React source — Figma Make · February 2026*
