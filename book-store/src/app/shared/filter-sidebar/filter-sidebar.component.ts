import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterAccordionComponent } from '../filter-accordion/filter-accordion.component';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { CATEGORIES, AUTHORS, FORMATS } from '../../data/books.data';
import { FilterState } from '../../models/book.model';

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FilterAccordionComponent,
    StarRatingComponent,
  ],
  templateUrl: './filter-sidebar.component.html',
  styleUrl: './filter-sidebar.component.css',
})
export class FilterSidebarComponent {
  @Output() filterChange = new EventEmitter<FilterState>();

  categories = CATEGORIES;
  authors = AUTHORS;
  formats = FORMATS;

  selectedCategories: Record<string, boolean> = {};
  selectedAuthors: Record<string, boolean> = {};
  selectedFormats: Record<string, boolean> = {};
  selectedRating = 0;
  minPrice: number | null = null;
  maxPrice: number | null = null;

  priceRange = signal<[number, number]>([0, 100]);

  onFilterChange(): void {
    const state: FilterState = {
      selectedCategories: Object.keys(this.selectedCategories).filter(
        (key) => this.selectedCategories[key]
      ),
      selectedAuthors: Object.keys(this.selectedAuthors).filter(
        (key) => this.selectedAuthors[key]
      ),
      selectedFormats: Object.keys(this.selectedFormats).filter(
        (key) => this.selectedFormats[key]
      ),
      selectedRating: this.selectedRating,
      priceRange: [this.minPrice ?? 0, this.maxPrice ?? 100],
    };
    this.filterChange.emit(state);
  }

  clearFilters(): void {
    this.selectedCategories = {};
    this.selectedAuthors = {};
    this.selectedFormats = {};
    this.selectedRating = 0;
    this.minPrice = null;
    this.maxPrice = null;
    this.onFilterChange();
  }

  formatPrice(price: number): string {
    return '$' + price.toFixed(2);
  }
}
