import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Author {
  _id: string;
  name: string;
  bio?: string;
}

export interface Category {
  _id: string;
  name: string;
}

export interface Book {
  _id: string;
  name: string;
  cover: string;
  price: number;
  stock: number;
  author: Author;
  category: Category;
  description?: string;
  createdAt?: string;
  ratingsAverage?: number;
  ratingsQuantity?: number;
}

export interface BooksResponse   { status: string; len: number; data: Book[]; }
export interface BookResponse    { status: string; data: Book; }
export interface CategoriesResponse { status: string; len: number; data: Category[]; }
export interface AuthorsResponse    { status: string; len: number; data: Author[]; }

export interface BookFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  author?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

@Injectable({ providedIn: 'root' })
export class BookService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // ── Books ──────────────────────────────────────────
  getAllBooks(filters: BookFilters = {}): Observable<BooksResponse> {
    let params = new HttpParams();
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.author) params = params.set('author', filters.author);
    if (filters.minPrice) params = params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params = params.set('maxPrice', filters.maxPrice.toString());
    if (filters.sort) params = params.set('sort', filters.sort);
    return this.http.get<BooksResponse>(`${this.baseUrl}/book`, { params });
  }

  getBookById(id: string): Observable<BookResponse> {
    return this.http.get<BookResponse>(`${this.baseUrl}/book/${id}`);
  }

  createBook(body: Partial<Book> & { author: string; category: string }): Observable<BookResponse> {
    return this.http.post<BookResponse>(`${this.baseUrl}/book`, body);
  }

  updateBook(id: string, body: any): Observable<BookResponse> {
    return this.http.patch<BookResponse>(`${this.baseUrl}/book/${id}`, body);
  }

  deleteBook(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/book/${id}`);
  }

  getLatestBooks(limit = 10): Observable<BooksResponse> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('sort', '-createdAt');
    return this.http.get<BooksResponse>(`${this.baseUrl}/book`, { params });
  }

  // ── Categories ─────────────────────────────────────
  getAllCategories(): Observable<CategoriesResponse> {
    return this.http.get<CategoriesResponse>(`${this.baseUrl}/category`);
  }

  createCategory(body: { name: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/category`, body);
  }

  updateCategory(id: string, body: { name: string }): Observable<any> {
    return this.http.patch(`${this.baseUrl}/category/${id}`, body);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/category/${id}`);
  }

  // ── Authors ────────────────────────────────────────
  getAllAuthors(): Observable<AuthorsResponse> {
    return this.http.get<AuthorsResponse>(`${this.baseUrl}/author`);
  }

  createAuthor(body: { name: string; bio?: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/author`, body);
  }

  updateAuthor(id: string, body: { name: string; bio?: string }): Observable<any> {
    return this.http.patch(`${this.baseUrl}/author/${id}`, body);
  }

  deleteAuthor(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/author/${id}`);
  }

  // ── Cloudinary signature ───────────────────────────
  getUploadSignature(): Observable<{ signature: string; timestamp: number; cloudName: string; apiKey: string; folder: string }> {
    return this.http.get<any>(`${this.baseUrl}/upload/signature`);
  }
}