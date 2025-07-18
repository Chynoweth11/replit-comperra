import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import Header from "@/components/header";
import ComparisonTable from "@/components/comparison-table";
import CategoryFilterPanel from "@/components/category-filter-panel";
import Footer from "@/components/footer";
import SEOHead from "@/components/seo-head";
import { getCategoryDisplayName } from "@/lib/category-schemas";

export default function Comparison() {
  const { category } = useParams<{ category?: string }>();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState(category || "tiles");
  
  // Enhanced filter state with URL persistence
  const [filters, setFilters] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      brand: urlParams.get('brand') || "",
      minPrice: urlParams.get('minPrice') || "",
      maxPrice: urlParams.get('maxPrice') || "",
      search: urlParams.get('search') || "",
    };
  });

  const categories = [
    { id: "tiles", name: "Tiles", icon: "fas fa-th-large" },
    { id: "slabs", name: "Stone & Slabs", icon: "fas fa-square" },
    { id: "lvt", name: "Vinyl & LVT", icon: "fas fa-layer-group" },
    { id: "hardwood", name: "Hardwood", icon: "fas fa-tree" },
    { id: "heat", name: "Heating", icon: "fas fa-thermometer-half" },
    { id: "carpet", name: "Carpet", icon: "fas fa-grip-lines" },
    { id: "thermostats", name: "Thermostats", icon: "fas fa-temperature-low" },
  ];

  // Enhanced filter state persistence to URL
  useEffect(() => {
    const urlParams = new URLSearchParams();
    
    // Add non-empty filters to URL
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        urlParams.set(key, value);
      }
    });
    
    // Update URL without page reload
    const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [filters]);

  // Enhanced filter change handler
  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  // Load the comparison enhancement script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/comperra-addon.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Category Menu */}
      <section className="bg-gray-100 border-t border-b py-3">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-4 text-sm font-medium">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full transition-all duration-200 ${
                selectedCategory === cat.id
                  ? "bg-royal text-white"
                  : "hover:bg-royal hover:text-white"
              }`}
            >
              <i className={`${cat.icon} mr-2`}></i>
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Main Comparison Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Material Comparison Tool</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-4">
              Select a category to view detailed specifications and compare materials side-by-side
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-royal-light border border-royal rounded-lg">
              <i className="fas fa-filter text-royal mr-2"></i>
              <span className="text-sm font-medium text-royal">
                Showing only {categories.find(cat => cat.id === selectedCategory)?.name} materials
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <CategoryFilterPanel 
              category={selectedCategory}
              filters={filters} 
              onFiltersChange={handleFiltersChange} 
            />
            
            <ComparisonTable 
              category={selectedCategory}
              filters={filters}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
