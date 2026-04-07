# 📖 Folio&Co — Online Bookstore Frontend

> An Angular 21 e-commerce bookstore application built as part of an ITI MEAN Stack course project.
> This README explains **everything** from scratch — including how Angular itself works — so you can pick it right back up after any break.

---

## 📋 Table of Contents

1. [What is This Project?](#-what-is-this-project)
2. [The Tech Stack — What Tools Are Used?](#-the-tech-stack--what-tools-are-used)
3. [How to Run the Project](#-how-to-run-the-project)
4. [Angular Basics — A Plain-English Refresher](#-angular-basics--a-plain-english-refresher)
5. [Project Architecture — The Big Picture](#-project-architecture--the-big-picture)
6. [The File/Folder Map](#-the-filefolder-map)
7. [Routing — Page Navigation](#-routing--page-navigation)
8. [Authentication — Who Are You?](#-authentication--who-are-you)
9. [Route Guards — Bouncers at the Door](#-route-guards--bouncers-at-the-door)
10. [The HTTP Interceptor — The Invisible Middleman](#-the-http-interceptor--the-invisible-middleman)
11. [Services — Where the Logic Lives](#-services--where-the-logic-lives)
12. [Pages (Components) — What the User Sees](#-pages-components--what-the-user-sees)
13. [Shared Components — Reusable Pieces](#-shared-components--reusable-pieces)
14. [The Admin Panel](#-the-admin-panel)
15. [Data Models (TypeScript Interfaces)](#-data-models-typescript-interfaces)
16. [Environment Configuration](#-environment-configuration)
17. [⚠️ Dead Code — Things That Exist but Are Never Used](#️-dead-code--things-that-exist-but-are-never-used)
18. [Known Issues & TODO](#-known-issues--todo)
19. [Team Credits](#-team-credits)

---

## 🤔 What is This Project?

This is the **frontend** (the part that runs in your browser) of a full-stack online bookstore called **Folio&Co**. Think of it like the website UI of an Amazon for books.

It lets users:
- Browse and search books
- View book details and read/write reviews
- Add books to a shopping cart or a personal wishlist
- Place orders (checkout)
- View their order history
- Edit their profile

And it lets **admins** (special users):
- View a stats dashboard
- Add, edit, or delete books, categories, and authors
- View and manage all users
- View orders (partially implemented)

The backend API that powers all of this lives in the **Node.js backend** part of this repo (separate folder). This frontend talks to it over HTTP.

---

## 🛠 The Tech Stack — What Tools Are Used?

| Tool | What it does |
|---|---|
| **Angular 21** | The main framework. It's like the engine of the car. |
| **TypeScript** | JavaScript with types. Catches mistakes before your code runs. |
| **Tailwind CSS v4** | Utility-first CSS. Instead of writing CSS classes, you slap pre-built classes like `bg-red-500` directly on HTML. |
| **RxJS** | Handles asynchronous events (like HTTP responses) as streams you can subscribe to. |
| **jwt-decode** | A library that reads/decodes JWT tokens so you know who is logged in. |
| **Cloudinary** | An image hosting service. Book cover images are uploaded to and served from Cloudinary. |

---

## 🚀 How to Run the Project

### Prerequisites
- Node.js (v18+) installed
- npm installed

### Steps

```bash
# 1. Go into the Angular project folder
cd book-store

# 2. Install all dependencies (only needed once, or after pulling new changes)
npm install

# 3. Start the dev server
npm start
# OR
ng serve
```

Then open your browser at: **http://localhost:4200**

### Important Config — The Backend URL

The app needs to know WHERE the backend API is. This is set in:

- **Development:** `src/environments/environment.ts`  
  _(this file is not tracked by git — you may need to create it locally)_
- **Production:** `src/environments/environment.prod.ts`

**Current production API URL:** `https://careerc.me/`

Your `environment.ts` for local development should look like:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000', // or wherever your backend is running
};
```

### Building for Production

```bash
npm run build
```

The output goes into the `dist/` folder. The `vercel.json` file at the root means this project is configured to be deployed on **Vercel**.

---

## 🧠 Angular Basics — A Plain-English Refresher

If you came back and forgot Angular, here's a quick mental model:

### 1. Components — The LEGO Blocks
Everything visible on the screen is a **Component**. A component has 3 parts:
- **`.ts` file** — The brain (TypeScript class that holds logic and data)
- **`.html` file** — The face (the HTML template that users see)
- **`.css` file** — The style (how it looks)

Example: `NavbarComponent` has `navbar.ts`, `navbar.html`, `navbar.css`.

### 2. Services — The Workers Behind the Scenes
A **Service** is a class that does work but doesn't have a visible face. Services handle things like:
- Making HTTP requests (`BookService` fetches books from the backend)
- Tracking state (`CartService` tracks what's in the cart)

Services are **injected** into components that need them. You don't create them yourself — Angular's Dependency Injection system handles that.

### 3. Signals — The Reactive Variables
This project uses Angular's modern **Signals API** for state. Think of a `signal` as a special variable that tells Angular "hey, update the view when I change."

```typescript
// Create a signal
count = signal(0);

// Update it
count.set(5);      // set to a specific value
count.update(v => v + 1); // compute a new value from old

// Read it (in templates or TypeScript)
count()  // call it like a function to read
```

### 4. `@if` / `@for` — Modern Template Control Flow
Angular 21 uses new control-flow syntax:
```html
@if (isLoggedIn) {
  <p>Welcome!</p>
}

@for (book of books(); track book._id) {
  <app-book-card [book]="book" />
}
```

### 5. `inject()` — Getting a Service
Instead of the old constructor injection, this project uses `inject()`:
```typescript
private cartService = inject(CartService);
```

### 6. Pipe (`| async`) — Subscribing in HTML
The `async` pipe subscribes to an Observable automatically in the template:
```html
@if (authService.isLoggedIn$ | async) {
  <a>My Profile</a>
}
```

### 7. Standalone Components
This project uses **standalone components** — there are no `NgModule` files. Each component declares its own imports. Angular 21 is fully standalone by default.

---

## 🏗 Project Architecture — The Big Picture

```
Browser
  │
  ▼
app.ts (root component)  →  just renders <router-outlet>
  │
  ▼
app.routes.ts (routing)  →  decides which page to show based on the URL
  │
  ├──── SharedLayoutComponent (wraps public pages with Navbar + Footer)
  │       ├── Home
  │       ├── Books (catalog)
  │       ├── BookDetail
  │       ├── Profile (auth-guarded)
  │       ├── OrdersHistory (auth-guarded)
  │       └── OrderSummary (checkout, auth-guarded)
  │
  ├──── Auth pages (no layout — standalone pages)
  │       ├── Login
  │       └── Register
  │
  └──── LayoutComponent (admin sidebar layout, auth+admin guarded)
          ├── Dashboard
          ├── AdminBooks
          ├── AdminOrders (uses mock data!)
          └── AdminUsers
```

**How Angular handles an HTTP request (the full flow):**

```
User action (e.g., clicks "Add to Cart")
  │
  ▼
Component calls service method
  │
  ▼
Service makes HTTP request via HttpClient
  │
  ▼
jwtInterceptor runs automatically:
  - Reads token from localStorage
  - Attaches it as Authorization header
  │
  ▼
Backend API processes the request
  │
  ▼
Response comes back
  │
  ▼
jwtInterceptor checks for 401/403 errors
  │
  ▼
Service receives the data, updates its state
  │
  ▼
Component's signal/observable updates
  │
  ▼
Angular automatically re-renders the view
```

---

## 📁 The File/Folder Map

```
book-store/
├── src/
│   ├── app/
│   │   ├── app.ts               ← Root component (just a router-outlet shell)
│   │   ├── app.html             ← Root template
│   │   ├── app.css              ← Root styles
│   │   ├── app.routes.ts        ← ALL page routes defined here
│   │   ├── app.config.ts        ← App bootstrap config (providers, interceptors)
│   │   ├── animations.ts        ← Reusable Angular animation triggers (⚠️ NOT USED)
│   │   │
│   │   ├── core/                ← Framework-level concerns
│   │   │   ├── services/
│   │   │   │   └── auth.ts      ← Auth service (login, logout, token decode)
│   │   │   ├── guards/
│   │   │   │   ├── auth-guard.ts    ← Blocks unauthenticated users
│   │   │   │   ├── admin-guard.ts   ← Blocks non-admins
│   │   │   │   └── guest-guard.ts   ← Blocks already-logged-in users from login page
│   │   │   └── interceptors/
│   │   │       └── jwt-interceptor.ts ← Attaches JWT to every backend HTTP request
│   │   │
│   │   ├── services/            ← Feature-level services (shared across pages)
│   │   │   ├── book.service.ts       ← Books, categories, authors CRUD + Cloudinary upload
│   │   │   ├── cart.service.ts       ← Shopping cart state (synced with backend)
│   │   │   ├── order.service.ts      ← User orders (my-orders, create order, can-review)
│   │   │   ├── review.service.ts     ← Book reviews (get, add, delete)
│   │   │   ├── wishlist.service.ts   ← Wishlist (localStorage-only, no backend)
│   │   │   └── login-prompt.service.ts ← Controls the "Please sign in" modal
│   │   │
│   │   ├── models/              ← (⚠️ LEGACY / UNUSED — see dead code section)
│   │   │   └── book.model.ts    ← Old model interfaces, no longer imported
│   │   │
│   │   ├── data/                ← (⚠️ LEGACY / UNUSED — see dead code section)
│   │   │   └── books.data.ts    ← Old hardcoded mock book data, no longer imported
│   │   │
│   │   ├── animations.ts        ← (⚠️ UNUSED — animation triggers, never imported)
│   │   │
│   │   ├── features/            ← (⚠️ ALL EMPTY FOLDERS — see dead code section)
│   │   │   ├── admin/           ← Empty
│   │   │   ├── auth/            ← Empty
│   │   │   ├── books/           ← Empty
│   │   │   └── cart/            ← Empty
│   │   │
│   │   ├── environments/
│   │   │   └── environment.prod.ts   ← Production config (API URL)
│   │   │   (environment.ts not in git — create locally for dev)
│   │   │
│   │   ├── home/                ← Home page component
│   │   ├── books/               ← Book catalog/listing page
│   │   ├── book-detail/         ← Individual book page with reviews
│   │   │
│   │   ├── auth/                ← Auth-related pages
│   │   │   ├── login/           ← Login page
│   │   │   ├── register/        ← Registration page
│   │   │   ├── profile/         ← User profile editor
│   │   │   └── orders-history/  ← User's past orders
│   │   │
│   │   ├── checkout/
│   │   │   └── order-summary/   ← Checkout page (shipping form + order placement)
│   │   │
│   │   ├── admin/               ← Admin panel (all protected by adminGuard)
│   │   │   ├── layout/          ← Admin sidebar layout wrapper
│   │   │   ├── dashboard/       ← Admin stats dashboard
│   │   │   ├── books/           ← Full CRUD for books, categories, and authors
│   │   │   ├── orders/          ← Order list viewer (⚠️ uses MOCK DATA!)
│   │   │   ├── users/           ← User management (real API)
│   │   │   ├── services/
│   │   │   │   ├── order.service.ts ← Admin-specific order service
│   │   │   │   └── user.service.ts  ← Admin-specific user service
│   │   │   ├── components/
│   │   │   │   └── user-modal/  ← Add/Edit user modal
│   │   │   └── shared/
│   │   │       └── pagination/  ← Pagination component (used by admin orders)
│   │   │
│   │   └── shared/              ← Reusable UI components
│   │       ├── navbar/          ← Top navigation bar + modals trigger
│   │       ├── footer/          ← Page footer
│   │       ├── shared-layout/   ← Layout wrapper (navbar + footer + router-outlet)
│   │       ├── hero-section/    ← Hero banner on the home page
│   │       ├── cart-modal/      ← Slide-in cart panel
│   │       ├── wishlist-modal/  ← Slide-in wishlist panel
│   │       ├── login-prompt-modal/ ← "Please sign in" popup modal
│   │       ├── star-rating/     ← Star rating display component
│   │       ├── layout/          ← (⚠️ possibly unused — check)
│   │       │
│   │       │ ─── The following are ⚠️ UNUSED (never imported anywhere) ───
│   │       ├── announcement-bar/   ← UNUSED — inline HTML in navbar instead
│   │       ├── category-tabs/      ← UNUSED — was for filtering by genre
│   │       ├── filter-accordion/   ← UNUSED — old filter UI component
│   │       ├── filter-sidebar/     ← UNUSED — uses old book.model.ts data
│   │       ├── product-card/       ← UNUSED — replaced by inline templates in books.html
│   │       ├── product-grid/       ← UNUSED — replaced by inline grid in books.html
│   │       ├── product-list-item/  ← UNUSED — list-view card, never used in templates
│   │       └── quick-view-modal/   ← UNUSED — a book quick-view popup, never triggered
│   │
│   ├── environments/
│   │   └── environment.prod.ts
│   ├── index.html          ← Main HTML shell
│   ├── main.ts             ← App bootstrap entry point
│   └── styles.css          ← Global CSS custom properties (colors, etc.)
│
├── angular.json            ← Angular CLI config (build, serve settings)
├── package.json            ← npm dependencies and scripts
├── tsconfig.json           ← TypeScript compiler config
└── vercel.json             ← Vercel deployment config (SPA routing fix)
```

---

## 🗺 Routing — Page Navigation

All routes are defined in **`src/app/app.routes.ts`**.

### How Routes Work

Angular's Router looks at the URL and renders the correct component. The `<router-outlet>` tag in a template is the **placeholder** where the matched component gets injected.

| URL | Component | Guard | Description |
|---|---|---|---|
| `/` | `Home` | None | Homepage with latest books |
| `/books` | `Books` | None | Book catalog with search & filters |
| `/books/:id` | `BookDetail` | None | Individual book page |
| `/profile` | `Profile` | `authGuard` | Edit your profile |
| `/orders` | `OrdersHistoryComponent` | `authGuard` | Your past orders |
| `/checkout` | `OrderSummaryComponent` | `authGuard` | Place an order |
| `/login` | `Login` | `guestGuard` | Login page (redirects if already logged in) |
| `/register` | `Register` | `guestGuard` | Register page (redirects if already logged in) |
| `/admin` | Redirects to `/admin/dashboard` | `authGuard + adminGuard` | Admin root |
| `/admin/dashboard` | `DashboardComponent` | `authGuard + adminGuard` | Admin stats |
| `/admin/books` | `AdminBooksComponent` | `authGuard + adminGuard` | Manage books |
| `/admin/users` | `UsersComponent` | `authGuard + adminGuard` | Manage users |
| `/admin/orders` | `AdminOrdersComponent` | `authGuard + adminGuard` | View orders |
| `/**` | Redirects to `/` | None | 404 fallback |

### Layout Groups

The router uses two layout "shells":

1. **`SharedLayoutComponent`** — Public pages: has the top Navbar + Footer wrapping the page content.
2. **`LayoutComponent`** (admin) — Admin pages: has a left sidebar with nav links instead.
3. **Auth pages** (`/login`, `/register`) — No layout wrapper at all. Full-screen forms.

---

## 🔐 Authentication — Who Are You?

Authentication is managed by **`src/app/core/services/auth.ts`**.

### How it works

1. **Login:** A form submits credentials (`email`, `password`) to `POST /users/login` on the backend.
2. **JWT Token:** The backend responds with a JWT (JSON Web Token) — a string that proves who you are.
3. **Storage:** The token is saved to `localStorage` along with the `userId` and `role` extracted from it.
4. **State:** A `BehaviorSubject<boolean>` called `loggedIn` tracks whether the user is currently logged in. Components subscribe to `isLoggedIn$` to reactively show/hide UI.
5. **Logout:** Clears all three items from `localStorage` and sets `loggedIn` to `false`.

### Auth Service Methods

| Method | What it does |
|---|---|
| `login(credentials)` | POST to backend, saves token + userId + role, broadcast login state |
| `register(data)` | POST to backend to create account |
| `logout()` | Clears localStorage, broadcasts logout |
| `isLoggedIn(): boolean` | Returns true/false synchronously |
| `isLoggedIn$` | Observable — subscribe to this for reactive UI updates |
| `getUserId(): string` | Returns userId from localStorage |
| `getRole(): string` | Returns 'User' or 'Admin' from localStorage |
| `isAdmin(): boolean` | Returns true if role is 'Admin' |

### Token Decoding

The app decodes the JWT manually using `atob()` (no library needed for that part) to extract the `userId` and `role`. The `jwt-decode` library is also installed and is used in the **Login component** specifically for the redirect-after-login logic.

---

## 🚧 Route Guards — Bouncers at the Door

Guards run before a page loads and can block access. All guards are in `src/app/core/guards/`.

### `authGuard` — "Must be logged in"

- **File:** `auth-guard.ts`
- **Used on:** `/profile`, `/orders`, `/checkout`, `/admin/**`
- **Logic:** If NOT logged in → redirect to `/login`. If logged in → let through.

### `adminGuard` — "Must be an admin"

- **File:** `admin-guard.ts`
- **Used on:** `/admin/**` (alongside `authGuard`)
- **Logic:** If logged in AND role is `'Admin'` → let through. Otherwise → redirect to `/` (home).

### `guestGuard` — "Must NOT be logged in"

- **File:** `guest-guard.ts`
- **Used on:** `/login`, `/register`
- **Logic:** If ALREADY logged in → redirect to `/books`. If not logged in → let through.
- **Why:** This prevents logged-in users from seeing the login page (which would be confusing).

---

## 🕵️ The HTTP Interceptor — The Invisible Middleman

**File:** `src/app/core/interceptors/jwt-interceptor.ts`

An **interceptor** is like a customs checkpoint that every HTTP request passes through. You never call it manually.

### What it does

1. **Reads** the JWT token from `localStorage`.
2. **Attaches** it to every outgoing request as a header:
   ```
   Authorization: Bearer eyJhbGci...
   ```
   But **only** for requests going to `environment.apiUrl` (your own backend). It doesn't attach it to, say, Cloudinary upload requests.
3. **Watches for errors** on the way back:
   - **401 Unauthorized** → calls `authService.logout()` and redirects to `/login` (your session expired).
   - **403 Forbidden** → redirects to `/` (you don't have permission).

---

## ⚙️ Services — Where the Logic Lives

### `src/app/services/` (Public-facing services)

#### `BookService` — The Book Librarian

**File:** `book.service.ts`

The main service for anything related to books, categories, and authors. Talks to the backend REST API.

| Method | HTTP | Endpoint | Description |
|---|---|---|---|
| `getAllBooks(filters?)` | GET | `/book` | Fetch all books with optional filtering/pagination |
| `getBookById(id)` | GET | `/book/:id` | Fetch one book by its MongoDB ID |
| `createBook(body)` | POST | `/book` | Create a new book (admin) |
| `updateBook(id, body)` | PATCH | `/book/:id` | Edit a book (admin) |
| `deleteBook(id)` | DELETE | `/book/:id` | Delete a book (admin) |
| `getLatestBooks(limit)` | GET | `/book` | Gets the newest books (sorted by `createdAt` desc) |
| `getAllCategories()` | GET | `/category` | All book categories |
| `createCategory(body)` | POST | `/category` | Create category (admin) |
| `updateCategory(id, body)` | PATCH | `/category/:id` | Edit category (admin) |
| `deleteCategory(id)` | DELETE | `/category/:id` | Delete category (admin) |
| `getAllAuthors()` | GET | `/author` | All authors |
| `createAuthor(body)` | POST | `/author` | Create author (admin) |
| `updateAuthor(id, body)` | PATCH | `/author/:id` | Edit author (admin) |
| `deleteAuthor(id)` | DELETE | `/author/:id` | Delete author (admin) |
| `getUploadSignature()` | GET | `/upload/signature` | Gets a signed URL for Cloudinary upload |

**Book filters** you can pass to `getAllBooks()`:
```typescript
{
  page?: number,      // pagination
  limit?: number,
  search?: string,    // search by title
  category?: string,  // filter by category ID
  author?: string,    // filter by author ID
  minPrice?: number,
  maxPrice?: number,
  sort?: string,      // e.g., '-createdAt' for newest first
}
```

---

#### `CartService` — The Shopping Cart

**File:** `cart.service.ts`

The cart is stored on the **backend** (not just localStorage). It's synced on every operation. Uses a `BehaviorSubject<CartItem[]>` called `_items` to hold the current cart state.

| Method | What it does |
|---|---|
| `loadCart()` | GET `/cart` — loads the user's cart from backend on startup |
| `addItem(book, quantity)` | POST `/cart/add` — adds a book to cart |
| `removeItem(bookId)` | DELETE `/cart/remove/:bookId` — removes a book |
| `updateQuantity(bookId, qty)` | PATCH `/cart/update/:bookId` — changes quantity |
| `getTotalPrice()` | Computes total price from current items |
| `getTotalQuantity()` | Computes total item count (for the badge number on the cart icon) |
| `clear()` | DELETE `/cart/clear` — empties the cart |

**Reactive Usage:** Subscribe to `cartService.items$` to always have a fresh list of cart items in your component.

---

#### `OrderService` — For Regular Users

**File:** `src/app/services/order.service.ts`

| Method | HTTP | Endpoint | Description |
|---|---|---|---|
| `getUserOrders()` | GET | `/order/my-orders` | Get the logged-in user's orders |
| `getOrderById(id)` | GET | `/order/:id` | Get one specific order |
| `createOrder(orderData)` | POST | `/order` | Place a new order |
| `updateOrderStatus(id, status)` | PATCH | `/order/:id` | Update order status |
| `canReviewBook(bookId)` | GET | `/order/can-review/:bookId` | Check if user can review this book (must have a Delivered order containing it) |

---

#### `ReviewService` — For Book Reviews

**File:** `src/app/services/review.service.ts`

| Method | HTTP | Endpoint | Description |
|---|---|---|---|
| `getReviews(bookId)` | GET | `/review?book=:id` | Get all reviews for a book |
| `addReview(bookId, rating, comment)` | POST | `/review` | Post a new review |
| `deleteReview(reviewId)` | DELETE | `/review/:id` | Delete your own review |
| `checkPurchased(bookId)` | GET | `/order/my-orders` | Checks if user bought the book (scans order history) |
| `getReviewsByBook(bookId)` | GET | `/review?book=:id` | Alias for `getReviews` |
| `createReview(payload)` | POST | `/review` | Alias for `addReview` |

> **Note:** `checkPurchased()` and `canReviewBook()` (in OrderService) do overlapping things. The app uses `canReviewBook()` from OrderService in `book-detail.ts`.

---

#### `WishlistService` — The Wishlist

**File:** `src/app/services/wishlist.service.ts`

> ⚠️ **The wishlist is stored ONLY in `localStorage`** — it does NOT sync with the backend. If the user logs in from a different browser, their wishlist will be empty there.

| Method | What it does |
|---|---|
| `toggle(bookId)` | Add if not there, remove if it is |
| `remove(bookId)` | Remove a specific book |
| `isWishlisted(bookId)` | Returns `true`/`false` |
| `getIds()` | Returns array of all wishlisted book IDs |
| `ids$` | Observable — subscribe to get live updates |

---

#### `LoginPromptService` — Show the "Please Sign In" Modal

**File:** `src/app/services/login-prompt.service.ts`

A tiny service that controls a modal popup. When a guest user tries to add a book to their cart, instead of silently doing nothing, the app calls `loginPromptService.show('Please sign in...')` and a modal pops up.

| Method | What it does |
|---|---|
| `show(message?)` | Shows the modal with an optional custom message |
| `hide()` | Hides the modal |
| `visible` | Signal — `true` when the modal is showing |
| `message` | Signal — the current message text |

---

### `src/app/admin/services/` (Admin-only services)

#### `admin/services/OrderService` (Admin Orders)

**File:** `src/app/admin/services/order.service.ts`

A separate, different service only for admin order operations.

| Method | HTTP | Endpoint | Description |
|---|---|---|---|
| `getAllOrders(filters?)` | GET | `/order/admin/all` | Get all orders (admin only), paginated |
| `updateOrderStatus(orderId, payload)` | PATCH | `/order/admin/update/:id` | Update order/payment status |

> **⚠️ Note:** The **Admin Orders page** (`admin/orders/orders.ts`) does NOT use this service yet! It uses hardcoded mock data. The `admin/services/order.service.ts` is used only by the **Admin Dashboard**.

---

#### `admin/services/UserService` (Admin Users)

**File:** `src/app/admin/services/user.service.ts`

| Method | HTTP | Endpoint | Description |
|---|---|---|---|
| `getAllUsers()` | GET | `/users` | Get list of all users |
| `createUser(data)` | POST | `/users/admin/create` | Create a user (admin route, skips passwordConfirm requirement) |
| `updateUser(id, data)` | PATCH | `/users/:id` | Edit a user |
| `updateUserStatus(userId, status)` | PATCH | `/users/:id` | Toggle ban/active status |
| `deleteUser(userId)` | DELETE | `/users/:id` | Delete a user |

---

## 📄 Pages (Components) — What the User Sees

### Home Page — `/`

**File:** `src/app/home/home.ts`

Fetches the 10 most recently added books using `BookService.getLatestBooks()` and displays them in a grid. Each book has an "Add to Cart" button with a brief green confirmation animation.

Also renders the `HeroSectionComponent` at the top.

---

### Books Page — `/books`

**File:** `src/app/books/books.ts`

The main catalog. This is the most complex public page.

**Features:**
- **Search bar** — real-time input, calls backend on each "Apply" / Enter
- **Category tab bar** — pre-defined genre tabs (purely cosmetic, doesn't send a category ID filter — only sets `activeTab` label)
- **Sidebar filters:** category dropdown (by ID), author dropdown (by ID), price min/max, clear all
- **Sort dropdown** — 8 sort options (newest, oldest, price, rating, title)
- **Grid / List toggle** — switches between two view modes
- **Pagination** — 12 items per page, Prev/Next buttons
- **Add to Cart** button with login-gate (guests see the login prompt modal)
- **Wishlist toggle** per book

---

### Book Detail Page — `/books/:id`

**File:** `src/app/book-detail/book-detail.ts`

Shows all information about a single book, fetched by its MongoDB ID from the URL.

**Features:**
- Book cover, title, author, category, price, stock status, rating
- Add to Cart + Wishlist toggle
- **Reviews section** with all existing reviews from other users
  - Star ratings display
  - Reviewer name + date
  - The current user can **delete their own reviews**

**Review permission system (smart):**
- The review form is only shown when **all** of these are true:
  1. User is logged in
  2. User has a `Delivered` order containing this book (`canReviewBook()` returns `true`)
  3. User hasn't already reviewed this book
- If conditions aren't met, a helpful message explains why (not purchased, already reviewed, not logged in)

---

### Login Page — `/login`

**File:** `src/app/auth/login/login.ts`

A reactive form with email + password. Validates both fields.

**After login:**
- Decodes the JWT using `jwtDecode` (from the `jwt-decode` library)
- If role is `'Admin'` → redirects to `/admin/dashboard`
- Otherwise → redirects to `/books`

---

### Register Page — `/register`

**File:** `src/app/auth/register/register.ts`

A reactive form with: firstName, lastName, email, password, passwordConfirm, date-of-birth.

Has a **cross-field validator** (`passwordMatchValidator`) that ensures both password fields match before submission.

After successful registration → waits 2 seconds → redirects to `/login`.

---

### Profile Page — `/profile`

**File:** `src/app/auth/profile/profile.ts`

Loads the user's profile data from `GET /users/profile` and shows it in a disabled form (read-only).

Clicking **"Edit"** enables all form fields. Saving calls `PATCH /users/profile`.

> ⚠️ Uses `HttpClient` directly (not through a service). This is a slight inconsistency — but it works.

---

### Orders History Page — `/orders`

**File:** `src/app/auth/orders-history/orders-history.component.ts`

Fetches the user's own orders from `GET /order/my-orders` and displays them as an expandable list.

Clicking an order shows its details (items, shipping, payment status).

Includes `getStatusColor()` and `getStatusIcon()` helpers — returns different Tailwind classes and emojis per order status.

---

### Checkout Page — `/checkout`

**File:** `src/app/checkout/order-summary/order-summary.component.ts`

A multi-field form that collects shipping information and payment method. Reads the current cart from `CartService`.

If the cart is empty, it immediately redirects to `/books`.

**Pricing calculation:**
- `subtotal` = sum of all cart items
- `tax` = subtotal × 8%
- `shipping` = $5.99, OR free if subtotal > $35
- `total` = subtotal + tax + shipping

On form submission, the order data is sent to `POST /order`. If successful, the cart is cleared and the user is redirected to `/orders` after 3 seconds.

---

## 🎨 Shared Components — Reusable Pieces

These live in `src/app/shared/` and are used across multiple pages.

### **`SharedLayoutComponent`**

The wrapper for all public pages. Renders:
```html
<app-navbar />
<router-outlet />   ← page content goes here
<app-footer />
```

### **`NavbarComponent`**

The top navigation bar. Has:
- Logo + nav links (Browse, Latest Books)
- Wishlist button (with count badge)
- Cart button (with count badge)
- If logged in: Orders link, Edit Profile link, Logout button
- If logged out: Sign In button
- Mobile hamburger menu

It also hosts the **Cart Modal**, **Wishlist Modal**, and **Login Prompt Modal** — they overlay the entire page when triggered.

### **`HeroSectionComponent`**

The big hero banner at the top of the home page. Static HTML, no logic.

### **`CartModalComponent`**

A slide-in panel showing current cart items. Lets you adjust quantities and remove items. Has a "Proceed to Checkout" button.

### **`WishlistModalComponent`**

A slide-in panel showing all wishlisted books. Can be used to move items to cart or remove from wishlist.

### **`LoginPromptModalComponent`**

A small popup modal that appears when a guest tries to do something that requires login (e.g., add to cart). Has "Sign In" and "Cancel" buttons.

### **`FooterComponent`**

The site footer. Static HTML.

### **`StarRatingComponent`**

Renders a visual star rating. Used by `ProductListItemComponent` (which itself is unused — see Dead Code).

---

## 🛡 The Admin Panel

All admin routes are protected by BOTH `authGuard` AND `adminGuard`.

The admin panel uses **`LayoutComponent`** (`src/app/admin/layout/layout.ts`) as its layout, which provides a sidebar with navigation links (Dashboard, Books, Orders, Users).

### Admin Dashboard — `/admin/dashboard`

**File:** `src/app/admin/dashboard/dashboard.ts`

Makes 3 parallel API calls on load:
- `OrderService.getAllOrders()` → total order count, recent orders list, revenue
- `UserService.getAllUsers()` → total user count
- `BookService.getAllBooks()` → total book count (just needs the `len` from the response)

Displays summary stat cards and a table of the 5 most recent orders.

---

### Admin Books — `/admin/books`

**File:** `src/app/admin/books/books.ts`

The biggest admin page. Has 3 tabs: **Books**, **Categories**, **Authors**.

**Books tab features:**
- Searchable, filterable, paginated book table
- "Add Book" button → opens a modal form
- Each row has Edit (pencil) and Delete (trash) buttons
- The modal form supports uploading a cover image which gets sent to **Cloudinary** via signed upload:
  1. App calls `GET /upload/signature` → backend returns Cloudinary signature data
  2. App uploads directly to Cloudinary using the signature (backend never sees the image file)
  3. Cloudinary returns the secure image URL
  4. That URL is saved as the book's `cover` field

**Categories tab:** Simple table with Add/Edit/Delete modals.

**Authors tab:** Same, with an optional `bio` field.

---

### Admin Orders — `/admin/orders`

**File:** `src/app/admin/orders/orders.ts`

> ⚠️ **THIS PAGE USES HARDCODED MOCK DATA — it is NOT connected to the real backend API.**

The page has all the UI: search, filter by order/payment status, pagination, a detail drawer — but all 6 orders shown are static objects defined directly in the component's TypeScript file.

There is a comment in the code: `// TODO: PATCH /order/...` — confirming that status updates are also just local mutations in memory, not real API calls.

The **real** admin order service (`src/app/admin/services/order.service.ts`) exists and is ready to use, but the orders page component doesn't import it.

---

### Admin Users — `/admin/users`

**File:** `src/app/admin/users/users.ts`

**Fully real — connected to the backend.**

Features:
- Displays all users in a paginated, searchable table
- Summary counts: total, active, banned
- **Ban/Unban toggle** — optimistic update (UI changes instantly, reverts on error)
- **Delete user** — with confirmation prompt
- **Add user** button → opens a modal to create a new user (uses admin route `/users/admin/create` which allows setting role directly)
- **Edit user** button → opens the same modal pre-filled

Uses `UserModal` component (`src/app/admin/components/user-modal/user-modal.ts`) for the add/edit form.

---

## 📐 Data Models (TypeScript Interfaces)

### Main Interfaces (from `src/app/services/book.service.ts`)

```typescript
interface Book {
  _id: string;
  name: string;
  cover: string;          // Cloudinary URL
  price: number;
  stock: number;
  author: Author;         // populated from DB (not just an ID)
  category: Category;     // populated from DB
  description?: string;
  createdAt?: string;
  ratingsAverage?: number;
  ratingsQuantity?: number;
}

interface Author {
  _id: string;
  name: string;
  bio?: string;
}

interface Category {
  _id: string;
  name: string;
}
```

### Order Interface (from `src/app/services/order.service.ts`)

```typescript
interface Order {
  _id: string;
  user: string;
  items: { book: Book; quantity: number; price: number }[];
  totalAmount: number;
  orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: 'Credit Card' | 'Debit Card' | 'PayPal' | 'Bank Transfer';
  paymentStatus: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  shippingDetails: {
    firstName, lastName, email, phone,
    address, city, state, postalCode, country
  };
  createdAt: string;
  updatedAt: string;
}
```

### User Interface (from `src/app/admin/services/user.service.ts`)

```typescript
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'Admin' | 'User';
  status: 'active' | 'banned';
  avatar?: string;
  createdAt: string;
}
```

### Review Interface (from `src/app/services/review.service.ts`)

```typescript
interface Review {
  _id: string;
  rating: number;        // 1–5
  comment?: string;
  createdAt: string;
  user: { _id?: string; firstName: string; lastName: string };
  book: string;
}
```

---

## ⚙️ Environment Configuration

| File | `production` | `apiUrl` |
|---|---|---|
| `environment.prod.ts` | `true` | `https://careerc.me/` |
| `environment.ts` (local, not in git) | `false` | `http://localhost:3000` |

The `vercel.json` file re-routes all paths to `index.html` (required for Single Page Applications, so refreshing on `/books/123` doesn't give a 404):

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## ⚠️ Dead Code — Things That Exist but Are Never Used

This is your map to the "ghosts" in the codebase — files that exist but nothing imports or uses them. Safe to leave for now, but should be cleaned up eventually.

### 1. 📁 `src/app/features/` — Entire directory is EMPTY

```
src/app/features/
├── admin/    ← empty
├── auth/     ← empty
├── books/    ← empty
└── cart/     ← empty
```

**What it is:** A directory structure that was probably created at the start of the project for a "feature module" architecture. The project was then restructured to have components directly in `app/`, and these were never deleted.

**Impact:** None. Zero code in them.

**Action:** Safe to delete the entire `features/` folder.

---

### 2. 📄 `src/app/models/book.model.ts` — UNUSED

This file defines TypeScript interfaces for `Book`, `Category`, `Author`, `FilterState`, and `NavLink`.

**Why it's unused:** These are old interfaces from when the app used hardcoded data. The real interfaces are now defined inside `book.service.ts` and match the actual backend MongoDB models.

**Only imported by:** `src/app/data/books.data.ts` (which is also unused — see below).

---

### 3. 📄 `src/app/data/books.data.ts` — UNUSED

Contains 12 hardcoded book objects (The Great Gatsby, 1984, Dune, etc.) plus static category, author, sort, and nav-link arrays.

**Why it's unused:** From the early development phase when real API wasn't ready. All data now comes from the backend. Only imported by dead shared components (`filter-sidebar`, `category-tabs`).

---

### 4. 📄 `src/app/animations.ts` — UNUSED

Defines 7 Angular animation triggers: `slideDown`, `fadeInModal`, `fadeInBackdrop`, `mobileMenuSlide`, `mobileSidebarSlide`, `bookHover`, `cartAdded`.

**Why it's unused:** Prepared for use but never imported into any component. The app has no `@Component` that lists any of these in its `animations: [...]` array.

---

### 5. 🧩 Shared Components that are NEVER used in any template

All of these exist in `src/app/shared/` but are never imported by any active component:

| Component | File | Why Likely Abandoned |
|---|---|---|
| `AnnouncementBarComponent` | `shared/announcement-bar/` | The announcement bar is just inline HTML in `navbar.html` instead |
| `CategoryTabsComponent` | `shared/category-tabs/` | Used `books.data.ts` (old format), replaced by tabs hardcoded in `books.html` |
| `FilterAccordionComponent` | `shared/filter-accordion/` | Old filter UI, replaced by sidebar inline in `books.html` |
| `FilterSidebarComponent` | `shared/filter-sidebar/` | Old filter sidebar using old `book.model.ts`, replaced by inline code |
| `ProductCardComponent` | `shared/product-card/` | Book card, replaced by inline template in `books.html` |
| `ProductGridComponent` | `shared/product-grid/` | Book grid, replaced by inline grid in `books.html` |
| `ProductListItemComponent` | `shared/product-list-item/` | List-view mode card, never used in any template |
| `QuickViewModalComponent` | `shared/quick-view-modal/` | A popup to preview book details, trigger event exists in `ProductListItemComponent` but that component itself is never used |

**Impact:** Dead code. Adds to bundle size (slightly), confuses future developers.

---

## 🐛 Known Issues & TODO

1. **Admin Orders — Mock Data**: `src/app/admin/orders/orders.ts` uses 6 hardcoded fake orders. The real API service (`admin/services/order.service.ts`) exists but is not wired up. **To fix:** Replace `allOrders` array with a call to `adminOrderService.getAllOrders()`.

2. **`updateOrderStatus` in Admin Orders** is a no-op — it mutates the local array only with a `console.log('TODO: PATCH...')`.

3. **Admin Layout navItem routes are wrong**: In `layout.ts`, nav items use routes like `'/dashboard'` instead of `'/admin/dashboard'`. The actual routing works because `RouterLink` + `RouterLinkActive` resolve them relative to the parent `/admin` route, but it's slightly inconsistent.

4. **Wishlist not synced**: The wishlist is only in `localStorage`. Wishlist data is lost when the user clears their browser storage or logs in on another device.

5. **`src/environments/environment.ts` is not in git**: Developers must create this file manually after cloning. There is no `.env.example` or documentation about this (until now).

6. **`ANGULAR_MIGRATION_GUIDE.md`** exists in the `book-store/` folder (74KB!) — it documents how the project was migrated to Angular 21 standalone. Useful reference if you ever need to understand certain decisions.

7. **Duplicate `Review` interface**: `review.service.ts` and `order.service.ts` (the user one) both define their own `OrderItem` and `Order` interfaces. This is duplicated code that could be unified.

8. **`guest-guard.ts` has a stale comment**: The comment in the code says `// todo: redirect to dashboard when created` — but the dashboard has been created. The guard already redirects to `/books` which is fine, but the comment is misleading.

---

## 👥 Team Credits

Built during a **6-day intensive sprint** at ITI.

| Team Member | Responsibility |
|---|---|
| **Ahmed Wael** | App scaffolding, Cart & Checkout pages |
| **Hashim** | Angular Material/Bootstrap integration, Admin Panel UI |
| **Khalil** | Auth services, login/register forms, user profile |
| **Hamdy** | Home page, Books list, Book details integration |
