import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BookService, Book } from '../services/book.service';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.css',
})
export class BookDetail implements OnInit {
  book = signal<Book | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private bookService: BookService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Invalid book ID.');
      this.loading.set(false);
      return;
    }
    this.bookService.getBookById(id).subscribe({
      next: (res) => {
        this.book.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Book not found or failed to load.');
        this.loading.set(false);
      },
    });
  }
}