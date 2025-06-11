import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchSuggestion {
  id: number;
  name: string;
  category: string;
  brand: string;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: suggestions = [] } = useQuery<SearchSuggestion[]>({
    queryKey: ["/api/search/suggestions", searchQuery],
    enabled: searchQuery.length > 2,
  });

  const handleSearchFocus = () => {
    if (searchQuery.length > 2) {
      setShowSuggestions(true);
    }
  };

  const handleSearchBlur = () => {
    // Delay hiding suggestions to allow clicking
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-royal text-white text-sm text-center py-2">
        Ad-free. Influence-free. Powered by contractors and consumers.
      </div>

      {/* Navigation */}
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-royal cursor-pointer">Comperra</h1>
          </Link>
          
          {/* Enhanced Search */}
          <div className="hidden md:block relative w-1/3">
            <Input
              type="text"
              placeholder="Search materials, brands, or specifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className="pr-10 focus:ring-2 focus:ring-royal focus:border-royal"
            />
            <i className="fas fa-search absolute right-3 top-3 text-gray-400"></i>
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50">
                {suggestions.map((suggestion) => (
                  <Link key={suggestion.id} href={`/comparison/${suggestion.category}`}>
                    <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                      <div className="font-medium">{suggestion.name}</div>
                      <div className="text-sm text-gray-500">{suggestion.brand} • {suggestion.category}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <nav className="space-x-4 text-sm font-medium hidden md:flex items-center">
            <a href="#" className="hover:text-royal transition-colors">About</a>
            <a href="#" className="hover:text-royal transition-colors">Help</a>
            <a href="#" className="hover:text-royal transition-colors">Sign In</a>
            <Button className="bg-royal text-white hover:bg-royal-dark">
              Join Free
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className="fas fa-bars text-gray-600"></i>
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-3 space-y-3">
              <Input
                type="text"
                placeholder="Search materials..."
                className="w-full"
              />
              <div className="space-y-2">
                <a href="#" className="block py-2 hover:text-royal">About</a>
                <a href="#" className="block py-2 hover:text-royal">Help</a>
                <a href="#" className="block py-2 hover:text-royal">Sign In</a>
                <Button className="w-full bg-royal text-white hover:bg-royal-dark">
                  Join Free
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
