import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { Brand } from "@shared/schema";

interface FilterPanelProps {
  filters: {
    brand: string;
    minPrice: string;
    maxPrice: string;
    search: string;
  };
  onFiltersChange: (filters: any) => void;
}

export default function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
  });

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value === "all" ? "" : value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      brand: "",
      minPrice: "",
      maxPrice: "",
      search: "",
    });
  };

  const materialTypes = [
    "Porcelain",
    "Ceramic", 
    "Natural Stone",
    "Quartz",
    "Marble",
    "Granite",
  ];

  return (
    <div className="lg:w-1/4">
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold mb-4 flex items-center">
          <i className="fas fa-filter mr-2 text-royal"></i>
          Filters
        </h3>
        
        {/* Price Range */}
        <div className="mb-6">
          <Label className="block text-sm font-medium mb-2">Price Range ($/SF)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
              className="w-1/2"
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
              className="w-1/2"
            />
          </div>
        </div>

        {/* Brand Filter */}
        <div className="mb-6">
          <Label className="block text-sm font-medium mb-2">Brand</Label>
          <Select value={filters.brand || "all"} onValueChange={(value) => handleFilterChange("brand", value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.name}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Material Type Filter */}
        <div className="mb-6">
          <Label className="block text-sm font-medium mb-2">Material Type</Label>
          <div className="space-y-2">
            {materialTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox id={type} />
                <Label htmlFor={type} className="text-sm">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={clearFilters}
            variant="outline" 
            className="flex-1"
          >
            Clear
          </Button>
          <Button className="flex-1 bg-royal text-white hover:bg-royal-dark">
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
