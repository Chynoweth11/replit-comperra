export interface MaterialFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface SearchSuggestion {
  id: number;
  name: string;
  category: string;
  brand: string;
}

export type CategoryId = "tiles" | "slabs" | "lvt" | "hardwood" | "heat" | "carpet";

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  icon: string;
  description: string;
  specs: string[];
}
