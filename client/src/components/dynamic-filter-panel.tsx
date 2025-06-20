import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MATERIAL_SPECIFICATIONS, SpecificationField } from "@shared/material-specifications";

interface DynamicFilterPanelProps {
  category: string;
  filters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
}

export default function DynamicFilterPanel({ category, filters, onFiltersChange }: DynamicFilterPanelProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const specs = MATERIAL_SPECIFICATIONS[category] || [];

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      brand: "",
      minPrice: "",
      maxPrice: "",
      search: ""
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const renderFilterField = (spec: SpecificationField) => {
    const value = localFilters[spec.key] || "";

    switch (spec.type) {
      case 'select':
        if (!spec.options) return null;
        return (
          <div key={spec.key} className="space-y-2">
            <Label htmlFor={spec.key} className="text-sm font-medium">
              {spec.label}
            </Label>
            <Select value={value} onValueChange={(val) => handleFilterChange(spec.key, val)}>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${spec.label}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All {spec.label}s</SelectItem>
                {spec.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'boolean':
        return (
          <div key={spec.key} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={spec.key}
                checked={value === true}
                onCheckedChange={(checked) => handleFilterChange(spec.key, checked)}
              />
              <Label htmlFor={spec.key} className="text-sm font-medium">
                {spec.label}
              </Label>
            </div>
          </div>
        );

      case 'number':
        if (spec.key === 'price') {
          return (
            <div key={spec.key} className="space-y-2">
              <Label className="text-sm font-medium">Price Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={localFilters.minPrice || ""}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={localFilters.maxPrice || ""}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
            </div>
          );
        }
        return (
          <div key={spec.key} className="space-y-2">
            <Label htmlFor={spec.key} className="text-sm font-medium">
              {spec.label}
            </Label>
            <Input
              id={spec.key}
              type="number"
              placeholder={spec.label}
              value={value}
              onChange={(e) => handleFilterChange(spec.key, e.target.value)}
            />
          </div>
        );

      case 'text':
      default:
        if (spec.key === 'name') return null; // Skip name field in filters
        return (
          <div key={spec.key} className="space-y-2">
            <Label htmlFor={spec.key} className="text-sm font-medium">
              {spec.label}
            </Label>
            <Input
              id={spec.key}
              type="text"
              placeholder={spec.label}
              value={value}
              onChange={(e) => handleFilterChange(spec.key, e.target.value)}
            />
          </div>
        );
    }
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
          <Button size="sm" onClick={applyFilters}>
            Apply Filters
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Always show basic filters */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium">
            Search
          </Label>
          <Input
            id="search"
            type="text"
            placeholder="Search by name, brand, or description..."
            value={localFilters.search || ""}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand" className="text-sm font-medium">
            Brand
          </Label>
          <Input
            id="brand"
            type="text"
            placeholder="Filter by brand"
            value={localFilters.brand || ""}
            onChange={(e) => handleFilterChange('brand', e.target.value)}
          />
        </div>

        {/* Dynamic category-specific filters */}
        {specs
          .filter(spec => !['name', 'brand', 'price', 'sourceUrl'].includes(spec.key))
          .filter(spec => spec.type === 'select' || spec.type === 'boolean')
          .slice(0, 5) // Limit to avoid overwhelming UI
          .map(renderFilterField)}
      </div>
    </div>
  );
}