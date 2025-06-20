import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { MATERIAL_SPECIFICATIONS } from "@shared/material-specifications";
import type { Material } from "@shared/schema";

export default function ProductCompare() {
  const [selectedMaterials, setSelectedMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: allMaterials = [] } = useQuery<Material[]>({
    queryKey: ["/api/materials"],
  });

  useEffect(() => {
    const loadSelectedProducts = async () => {
      const comparisonIds = JSON.parse(localStorage.getItem('comparisonIds') || '[]');
      
      if (comparisonIds.length > 0 && allMaterials.length > 0) {
        console.log("Loading products by IDs:", comparisonIds);
        
        const products: Material[] = [];
        for (const id of comparisonIds) {
          try {
            const response = await fetch(`/api/materials/${id}`);
            if (response.ok) {
              const product = await response.json();
              products.push(product);
            }
          } catch (error) {
            console.error(`Error loading product ${id}:`, error);
          }
        }
        
        console.log("Loaded products from API:", products);
        setSelectedMaterials(products);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };

    if (allMaterials.length > 0) {
      loadSelectedProducts();
    }
  }, [allMaterials]);

  const clearComparison = () => {
    localStorage.removeItem('comparisonIds');
    setSelectedMaterials([]);
  };

  const removeProduct = (id: number) => {
    const currentIds = JSON.parse(localStorage.getItem('comparisonIds') || '[]');
    const updatedIds = currentIds.filter((compId: number) => compId !== id);
    localStorage.setItem('comparisonIds', JSON.stringify(updatedIds));
    setSelectedMaterials(prev => prev.filter(product => product.id !== id));
  };

  const getSpecValue = (material: Material, key: string): string => {
    const specs = material.specifications as Record<string, any>;
    const value = specs?.[key];
    
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    if (value === null || value === undefined || value === "") {
      return "—";
    }
    
    // Handle specific formatting for certain fields
    if (key === 'slipRating' && value) {
      return value;
    }
    if (key === 'peiRating' && value) {
      return String(value);
    }
    if (key === 'waterAbsorption' && value) {
      return value;
    }
    
    return String(value);
  };

  // Enhanced specification fields based on category using centralized config
  const getSpecFields = (category: string) => {
    const specs = MATERIAL_SPECIFICATIONS[category] || [];
    
    // Always include base fields first
    const baseFields = [
      { key: 'brand', label: 'Brand' },
      { key: 'price', label: 'Price/SF' },
      { key: 'dimensions', label: 'Size' }
    ];

    // Add category-specific fields from centralized config, filtering out empty ones
    const categoryFields = specs
      .filter(spec => !['name', 'brand', 'price', 'dimensions', 'category'].includes(spec.key))
      .map(spec => ({ key: spec.key, label: spec.label }));

    return [...baseFields, ...categoryFields];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading comparison...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (selectedMaterials.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Products Selected</h1>
            <p className="text-gray-600 mb-8">
              Please select materials to compare from the comparison table.
            </p>
            <Link href="/">
              <Button>Browse Categories</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const primaryCategory = selectedMaterials[0]?.category || '';
  const specFields = getSpecFields(primaryCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Product Comparison ({selectedMaterials.length} items)
          </h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearComparison}
            className="ml-auto"
          >
            Clear All
          </Button>
        </div>

        {/* Enhanced Comparison Table */}
        <div className="overflow-auto border rounded-xl shadow bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left font-medium text-gray-700">Product</th>
                <th className="p-3 text-left font-medium text-gray-700">Brand</th>
                <th className="p-3 text-left font-medium text-gray-700">Price/SF</th>
                <th className="p-3 text-left font-medium text-gray-700">Size</th>
                {specFields.slice(3).map(field => (
                  <th key={field.key} className="p-3 text-left font-medium text-gray-700">{field.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {selectedMaterials.map((material) => (
                <tr key={material.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">{material.name}</td>
                  <td className="p-3 text-gray-700">{material.brand}</td>
                  <td className="p-3 text-green-600 font-medium">${material.price}</td>
                  <td className="p-3 text-gray-700">{material.dimensions}</td>
                  {specFields.slice(3).map(field => (
                    <td key={`${material.id}-${field.key}`} className="p-3 text-gray-700">
                      {getSpecValue(material, field.key)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Product Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {selectedMaterials.map((material) => (
            <Card key={material.id} className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeProduct(material.id)}
                className="absolute top-2 right-2 h-8 w-8 p-0 text-red-600 hover:text-red-700 z-10"
              >
                ×
              </Button>
              
              {material.imageUrl && (
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  <img 
                    src={material.imageUrl} 
                    alt={material.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{material.name}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Brand:</span>
                    <span className="font-medium">{material.brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium text-green-600">${material.price}/sf</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span>{material.dimensions}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}