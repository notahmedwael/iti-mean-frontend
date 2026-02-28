import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent implements OnChanges {
  @Input() currentPage = 1;
  @Input() totalItems = 0;
  @Input() itemsPerPage = 6;
  @Input() itemLabel = 'users';

  @Output() pageChange = new EventEmitter<number>();

  totalPages = 1;
  pageNumbers: number[] = [];
  showingFrom = 0;
  showingTo = 0;

  ngOnChanges(changes: SimpleChanges): void {
    this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
    this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.showingFrom = this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
    this.showingTo = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  go(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
}
