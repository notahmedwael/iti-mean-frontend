# 📖 Online Bookstore Web Portal (Angular)

A modern, responsive e-commerce storefront built with Angular. This application features a seamless shopping experience from browsing to checkout, including a dedicated Admin dashboard.

## 🚀 Setup Instructions
1.  **Clone & Install:**
    ```bash
    cd frontend
    npm install
    ```
2.  **Configuration:** Update `src/environments/environment.ts` to point to your backend API URL.
3.  **Run Application:**
    ```bash
    ng serve
    ```
    Navigate to `http://localhost:4200`

## 📦 Key Features
* **Lazy Loading:** Optimized performance using modular routing for Auth, Books, Cart, and Admin modules.
* **Guarded Routes:** Auth guards protect sensitive pages like Checkout and Admin Panel.
* **State Management:** Reactive forms with real-time validation for login and registration.
* **Interceptors:** Global HTTP interceptor to attach JWT tokens and handle 401/403/500 errors.

## 📂 Project Structure
* `AuthModule`: Login and Registration pages.
* `BooksModule`: Catalog browsing, search/filters, and book details.
* `CartModule`: Shopping cart management and checkout flow.
* `AdminModule`: Inventory management (Books, Categories, Authors) and order tracking.

## 👥 Team Responsibilities
* **Ahmed Wael:** App scaffolding, Cart, and Checkout pages.
* **Hashim:** Angular Material/Bootstrap integration and Admin Panel UI.
* **Khalil:** Auth services, login/register forms, and user profile.
* **Hamdy:** Home page, Books list, and Book details integration.

---
*Created during a 6-day intensive sprint.*
