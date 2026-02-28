export type BadgeColor = 'rust' | 'gold' | 'maroon';

export interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  genre: string;
  pages?: number;
  year?: number;
  description?: string;
  inStock?: boolean;
  badgeColor?: BadgeColor;
  badge?: string;
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
  selectedFormats: string[];
  selectedRating: number;
  priceRange: [number, number];
}

export interface NavLink {
  label: string;
  hasDropdown?: boolean;
  route?: string;
}
