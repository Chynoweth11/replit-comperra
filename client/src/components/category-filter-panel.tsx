import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getCategorySchema } from "@/lib/category-schemas";

interface CategoryFilterPanelProps {
  category: string;
  filters: {
    brand: string;
    minPrice: string;
    maxPrice: string;
    search: string;
    [key: string]: any;
  };
  onFiltersChange: (filters: any) => void;
}

export default function CategoryFilterPanel({ category, filters, onFiltersChange }: CategoryFilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const schema = getCategorySchema(category);

  if (!schema) {
    return null;
  }

  const updateFilter = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      brand: "",
      minPrice: "",
      maxPrice: "",
      search: ""
    });
  };

  const getFilterOptions = (filterName: string): string[] => {
    // Return predefined options based on filter type
    const filterOptionsMap: Record<string, string[]> = {
      "Size": ["3x6", "4x8", "6x24", "12x12", "12x24", "18x18", "24x24"],
      "Finish Type": ["Matte", "Glossy", "Polished", "Honed", "Textured"],
      "PEI Rating": ["1", "2", "3", "4", "5"],
      "Edge Type": ["Rectified", "Pressed", "Beveled", "Tumbled"],
      "Material Type": ["Natural Stone", "Engineered Quartz", "Natural Marble", "Granite"],
      "Thickness": ["2cm", "3cm", "1.2cm", "2.5cm"],
      "Core Type": ["SPC", "WPC", "Rigid Core"],
      "Install Method": ["Click-lock", "Glue-down", "Nail-down", "Float"],
      "Wood Species": ["Oak", "Maple", "Cherry", "Walnut", "Pine", "Hickory"],
      "System Type": ["Electric Mat", "Loose Cable", "In-slab Cable"],
      "Voltage": ["120V", "240V", "208V"],
      "Fiber Type": ["Nylon", "Polyester", "Wool", "Solution-dyed Nylon"],
      "Construction Method": ["Loop Pile", "Cut Pile", "Cut & Loop", "Textured Loop"]
    };

    return filterOptionsMap[filterName] || [];
  };

  const activeFiltersCount = Object.values(filters).filter(value => value && value !== "").length;

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{schema.displayName} Filters</h3>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount} active</Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Show Less" : "Show More"}
            </Button>
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Basic Filters - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <Input
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Brand</label>
            <Input
              placeholder="Any brand"
              value={filters.brand}
              onChange={(e) => updateFilter("brand", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Min Price</label>
            <Input
              type="number"
              placeholder="$0"
              value={filters.minPrice}
              onChange={(e) => updateFilter("minPrice", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Price</label>
            <Input
              type="number"
              placeholder="Any"
              value={filters.maxPrice}
              onChange={(e) => updateFilter("maxPrice", e.target.value)}
            />
          </div>
        </div>

        {/* Category-Specific Filters - Expandable */}
        {isExpanded && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3 text-gray-700">
              {schema.displayName} Specifications
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schema.filters.slice(0, 9).map((filterName) => {
                const options = getFilterOptions(filterName);
                const filterKey = filterName.toLowerCase().replace(/\s+/g, "_");
                
                return (
                  <div key={filterName}>
                    <label className="block text-sm font-medium mb-1">{filterName}</label>
                    {options.length > 0 ? (
                      <Select
                        value={filters[filterKey] || ""}
                        onValueChange={(value) => updateFilter(filterKey, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Any ${filterName.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any {filterName.toLowerCase()}</SelectItem>
                          {options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder={`Any ${filterName.toLowerCase()}`}
                        value={filters[filterKey] || ""}
                        onChange={(e) => updateFilter(filterKey, e.target.value)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}