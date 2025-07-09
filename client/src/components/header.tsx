import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { signOut } from "firebase/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, User, Users } from "lucide-react";
import Fuse from 'fuse.js';
import { useMaterials } from "@/hooks/use-materials";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";

interface SearchSuggestion {
  id: number;
  name: string;
  category: string;
  brand: string;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  
  // Get all materials for fuzzy search
  const { data: allMaterials = [] } = useMaterials();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    const generateSuggestions = () => {
      if (searchQuery.length > 0 && allMaterials.length > 0) {
        // Configure Fuse.js for fuzzy search
        const fuseOptions = {
          keys: [
            { name: 'name', weight: 0.4 },
            { name: 'brand', weight: 0.3 },
            { name: 'category', weight: 0.2 },
            { name: 'description', weight: 0.1 }
          ],
          threshold: 0.4, // Allow 40% fuzzy matching
          includeScore: true,
          ignoreLocation: true,
          findAllMatches: false,
          limit: 8 // Limit to 8 suggestions
        };

        const fuse = new Fuse(allMaterials, fuseOptions);
        const searchResults = fuse.search(searchQuery);
        
        // Convert results to suggestions format
        const fuzzyResults = searchResults.map(result => ({
          id: result.item.id,
          name: result.item.name,
          category: result.item.category,
          brand: result.item.brand
        }));

        // Also include exact matches for completeness
        const exactMatches = allMaterials
          .filter(material => {
            const query = searchQuery.toLowerCase();
            return material.name.toLowerCase().includes(query) ||
                   material.brand.toLowerCase().includes(query) ||
                   material.category.toLowerCase().includes(query);
          })
          .slice(0, 4)
          .map(material => ({
            id: material.id,
            name: material.name,
            category: material.category,
            brand: material.brand
          }));

        // Combine and deduplicate
        const allSuggestions = [...exactMatches];
        fuzzyResults.forEach(fuzzyResult => {
          if (!exactMatches.find(exact => exact.id === fuzzyResult.id)) {
            allSuggestions.push(fuzzyResult);
          }
        });

        setSuggestions(allSuggestions.slice(0, 8));
        setShowSuggestions(allSuggestions.length > 0 && isSearchFocused);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(generateSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, allMaterials, isSearchFocused]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query: string = searchQuery) => {
    if (query.trim()) {
      // Try to determine the best category for the search
      let targetCategory = 'tiles'; // default
      
      if (allMaterials.length > 0) {
        const searchTerm = query.toLowerCase();
        // Find the most relevant category based on fuzzy search results
        const fuseOptions = {
          keys: ['name', 'brand', 'description'],
          threshold: 0.4,
          includeScore: true
        };
        
        const fuse = new Fuse(allMaterials, fuseOptions);
        const results = fuse.search(searchTerm);
        
        if (results.length > 0) {
          targetCategory = results[0].item.category;
        }
      }
      
      navigate(`/comparison/${targetCategory}?search=${encodeURIComponent(query.trim())}`);
      setSearchQuery("");
      setShowSuggestions(false);
      setIsSearchFocused(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    // Navigate to the specific category with the product highlighted
    navigate(`/comparison/${suggestion.category}?search=${encodeURIComponent(suggestion.name)}`);
    setSearchQuery("");
    setShowSuggestions(false);
    setIsSearchFocused(false);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    if (searchQuery.length > 0) {
      setShowSuggestions(suggestions.length > 0);
    }
  };

  const handleSearchBlur = () => {
    // Don't immediately hide suggestions to allow clicking
    // The click outside handler will manage this
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
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
          <div className="hidden md:block relative w-1/3" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products, brands, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                onKeyPress={handleKeyPress}
                className="pl-10 pr-12 w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm text-gray-900">{suggestion.name}</div>
                        <div className="text-xs text-gray-500">{suggestion.brand}</div>
                      </div>
                      <div className="text-xs text-gray-400 uppercase">
                        {suggestion.category}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <nav className="space-x-4 text-sm font-medium hidden md:flex items-center">
            <Link href="/professionals" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-lg">
              <Users size={18} />
              Pros & Suppliers Near You
            </Link>
            <Link href="/about" className="hover:text-royal transition-colors">About</Link>
            <Link href="/contact" className="hover:text-royal transition-colors">Help</Link>
            {user ? (
              <>
                <Link href={user.role === 'vendor' ? '/vendor-dashboard' : user.role === 'trade' ? '/trade-dashboard' : '/dashboard'} className="hover:text-royal transition-colors flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {user.name || 'Dashboard'}
                </Link>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-royal transition-colors">Sign In</Link>
                <Link href="/register">
                  <Button className="bg-royal text-white hover:bg-royal-dark">
                    Join Free
                  </Button>
                </Link>
              </>
            )}
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
                <Link href="/about" className="block py-2 hover:text-royal">About</Link>
                <Link href="/contact" className="block py-2 hover:text-royal">Help</Link>
                {user ? (
                  <>
                    <Link href={user.role === 'vendor' ? '/vendor-dashboard' : user.role === 'trade' ? '/trade-dashboard' : '/dashboard'} className="block py-2 hover:text-royal">Dashboard</Link>
                    <Button variant="outline" className="w-full" onClick={handleSignOut}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block py-2 hover:text-royal">Sign In</Link>
                    <Link href="/register">
                      <Button className="w-full bg-royal text-white hover:bg-royal-dark">
                        Join Free
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
