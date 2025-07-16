import React, { useState, useMemo, useCallback } from 'react';
import { Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Fuse from 'fuse.js';

interface EnhancedFuzzySearchProps {
  data: any[];
  onFilter: (filteredData: any[]) => void;
  category: string;
  placeholder?: string;
  className?: string;
}

export default function EnhancedFuzzySearch({
  data,
  onFilter,
  category,
  placeholder = "Search products...",
  className = ""
}: EnhancedFuzzySearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Enhanced Fuse.js configuration with better scoring
  const fuse = useMemo(() => {
    const searchOptions = {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'brand', weight: 0.3 },
        { name: 'description', weight: 0.2 },
        { name: 'specifications.Material Type', weight: 0.1 },
        { name: 'specifications.Color', weight: 0.1 },
        { name: 'specifications.Finish', weight: 0.1 },
        { name: 'specifications.Size', weight: 0.1 }
      ],
      threshold: 0.4,
      distance: 100,
      includeScore: true,
      shouldSort: true,
      findAllMatches: false,
      minMatchCharLength: 2,
      useExtendedSearch: true,
      ignoreLocation: true,
      ignoreFieldNorm: false
    };
    
    return new Fuse(data, searchOptions);
  }, [data]);

  // Extract unique brands and specifications
  const availableBrands = useMemo(() => {
    const brands = [...new Set(data.map(item => item.brand))];
    return brands.filter(Boolean).sort();
  }, [data]);

  const availableSpecs = useMemo(() => {
    const specs = new Set<string>();
    data.forEach(item => {
      if (item.specifications) {
        Object.values(item.specifications).forEach(value => {
          if (typeof value === 'string' && value.trim() && value !== 'N/A') {
            specs.add(value.trim());
          }
        });
      }
    });
    return Array.from(specs).sort();
  }, [data]);

  // Enhanced filtering with multiple criteria
  const filteredData = useMemo(() => {
    let results = data;

    // Apply search query with fuzzy matching
    if (searchQuery.trim()) {
      const searchResults = fuse.search(searchQuery);
      results = searchResults.map(result => result.item);
    }

    // Apply brand filters
    if (selectedBrands.length > 0) {
      results = results.filter(item => 
        selectedBrands.includes(item.brand)
      );
    }

    // Apply specification filters
    if (selectedSpecs.length > 0) {
      results = results.filter(item => {
        if (!item.specifications) return false;
        return selectedSpecs.some(spec => 
          Object.values(item.specifications).some(value => 
            typeof value === 'string' && value.includes(spec)
          )
        );
      });
    }

    return results;
  }, [searchQuery, selectedBrands, selectedSpecs, data, fuse]);

  // Update filtered data when it changes
  React.useEffect(() => {
    onFilter(filteredData);
  }, [filteredData, onFilter]);

  // Handle search input with debouncing
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    
    // Add to search history if not empty and not already present
    if (value.trim() && !searchHistory.includes(value.trim())) {
      setSearchHistory(prev => [value.trim(), ...prev.slice(0, 4)]);
    }
  }, [searchHistory]);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedBrands([]);
    setSelectedSpecs([]);
  };

  // Toggle brand selection
  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  // Toggle specification selection
  const toggleSpec = (spec: string) => {
    setSelectedSpecs(prev => 
      prev.includes(spec) 
        ? prev.filter(s => s !== spec)
        : [...prev, spec]
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-12"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && !searchQuery && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Recent searches:</Label>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((query, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-gray-200"
                onClick={() => setSearchQuery(query)}
              >
                {query}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Advanced Filters
          {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {(selectedBrands.length > 0 || selectedSpecs.length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-red-600 hover:text-red-700"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {(selectedBrands.length > 0 || selectedSpecs.length > 0) && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Active filters:</Label>
          <div className="flex flex-wrap gap-2">
            {selectedBrands.map((brand) => (
              <Badge
                key={brand}
                variant="default"
                className="flex items-center gap-1"
              >
                Brand: {brand}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => toggleBrand(brand)}
                />
              </Badge>
            ))}
            {selectedSpecs.map((spec) => (
              <Badge
                key={spec}
                variant="default"
                className="flex items-center gap-1"
              >
                {spec}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => toggleSpec(spec)}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Filters Panel */}
      <Collapsible open={showFilters} onOpenChange={setShowFilters}>
        <CollapsibleContent>
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Brand Filters */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Filter by Brand:</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {availableBrands.map((brand) => (
                    <div key={brand} className="flex items-center space-x-2">
                      <Checkbox
                        id={`brand-${brand}`}
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={() => toggleBrand(brand)}
                      />
                      <Label
                        htmlFor={`brand-${brand}`}
                        className="text-sm cursor-pointer"
                      >
                        {brand}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specification Filters */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Filter by Specifications:</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {availableSpecs.slice(0, 12).map((spec) => (
                    <div key={spec} className="flex items-center space-x-2">
                      <Checkbox
                        id={`spec-${spec}`}
                        checked={selectedSpecs.includes(spec)}
                        onCheckedChange={() => toggleSpec(spec)}
                      />
                      <Label
                        htmlFor={`spec-${spec}`}
                        className="text-sm cursor-pointer truncate"
                        title={spec}
                      >
                        {spec}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredData.length} of {data.length} products
        {searchQuery && ` for "${searchQuery}"`}
        {selectedBrands.length > 0 && ` • ${selectedBrands.length} brand${selectedBrands.length > 1 ? 's' : ''} selected`}
        {selectedSpecs.length > 0 && ` • ${selectedSpecs.length} spec${selectedSpecs.length > 1 ? 's' : ''} selected`}
      </div>
    </div>
  );
}