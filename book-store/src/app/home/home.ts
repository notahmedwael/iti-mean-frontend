import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSectionComponent } from '../shared/hero-section/hero-section.component';
import { CategoryTabsComponent } from '../shared/category-tabs/category-tabs.component';
import { FilterSidebarComponent } from '../shared/filter-sidebar/filter-sidebar.component';
import { ProductGridComponent } from '../shared/product-grid/product-grid.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroSectionComponent,
    CategoryTabsComponent,
    FilterSidebarComponent,
    ProductGridComponent,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}