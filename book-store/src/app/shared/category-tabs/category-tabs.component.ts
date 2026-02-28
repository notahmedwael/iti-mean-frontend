import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GENRE_TABS } from '../../data/books.data';

@Component({
  selector: 'app-category-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-tabs.component.html',
  styleUrl: './category-tabs.component.css',
})
export class CategoryTabsComponent {
  tabs = GENRE_TABS;
  activeTab = 0;
}
