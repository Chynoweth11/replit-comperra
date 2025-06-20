import React, { useState } from 'react';
import Fuse from 'fuse.js';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { Material } from "@shared/schema";

interface FuzzySearchBarProps {
  materials: Material[];
  onResults: (results: Material[]) => void;
  placeholder?: string;
}

const FuzzySearchBar: React.FC<FuzzySearchBarProps> = ({ 
  materials, 
  onResults, 
  placeholder = "Search products by name, brand, type, or color..." 
}) => {
  const [query, setQuery] = useState('');

  const fuse = new Fuse(materials, {
    threshold: 0.4, // 40% fuzzy tolerance
    keys: [
      { name: 'name', weight: 0.4 },
      { name: 'brand', weight: 0.3 },
      { name: 'description', weight: 0.2 },
      { name: 'category', weight: 0.1 }
    ],
    includeScore: true,
    ignoreLocation: true,
    findAllMatches: true
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) {
      onResults(materials); // Show all if empty query
      return;
    }

    const results = fuse.search(query);
    const matchedMaterials = results.map((res) => res.item);
    
    // Also include exact matches to ensure completeness
    const exactMatches = materials.filter(material => {
      const searchTerm = query.toLowerCase();
      return material.name.toLowerCase().includes(searchTerm) ||
             material.brand.toLowerCase().includes(searchTerm) ||
             material.description.toLowerCase().includes(searchTerm);
    });

    // Merge and deduplicate results
    const allMatches = [...exactMatches];
    matchedMaterials.forEach(fuzzyMatch => {
      if (!exactMatches.find(exact => exact.id === fuzzyMatch.id)) {
        allMatches.push(fuzzyMatch);
      }
    });

    onResults(allMatches);
  };

  const handleClear = () => {
    setQuery('');
    onResults(materials);
  };

  return (
    <form onSubmit={handleSearch} className="w-full flex items-center gap-2 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-4"
        />
      </div>
      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
        Search
      </Button>
      {query && (
        <Button type="button" variant="outline" onClick={handleClear}>
          Clear
        </Button>
      )}
    </form>
  );
};

export default FuzzySearchBar;