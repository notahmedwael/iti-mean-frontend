import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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

export interface BooksResponse {
  status: string;
  len: number;
  data: Book[];
}

export interface BookResponse {
  status: string;
  data: Book;
}

export interface CategoriesResponse {
  status: string;
  len: number;
  data: Category[];
}

export interface AuthorsResponse {
  status: string;
  len: number;
  data: Author[];
}

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
  private baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

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

  getLatestBooks(limit = 10): Observable<BooksResponse> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('sort', '-createdAt');
    return this.http.get<BooksResponse>(`${this.baseUrl}/book`, { params });
  }

  getAllCategories(): Observable<CategoriesResponse> {
    return this.http.get<CategoriesResponse>(`${this.baseUrl}/category`);
  }

  getAllAuthors(): Observable<AuthorsResponse> {
    return this.http.get<AuthorsResponse>(`${this.baseUrl}/author`);
  }
}