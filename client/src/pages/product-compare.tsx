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
import { comparisonStore } from "@/lib/comparison-store";
import type { Material } from "@shared/schema";
import { ComparisonDebug } from "@/components/comparison-debug";

export default function ProductCompare() {
  const [selectedMaterials, setSelectedMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: allMaterials = [] } = useQuery<Material[]>({
    queryKey: ["/api/materials"],
  });

  useEffect(() => {
    const loadSelectedProducts = async () => {
      const comparisonIds = JSON.parse(localStorage.getItem('comparisonIds') || '[]');
      console.log("Loading products by IDs:", comparisonIds);
      
      if (comparisonIds.length > 0) {
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
      }
      setIsLoading(false);
    };

    loadSelectedProducts();
  }, []);

  const clearComparison = () => {
    // Clear localStorage
    localStorage.removeItem('comparisonIds');
    
    // Clear local state
    setSelectedMaterials([]);
    
    // Clear the comparison store so checkboxes are unchecked in the main table
    comparisonStore.clear();
  };

  const removeProduct = (id: number) => {
    // Update localStorage
    const currentIds = JSON.parse(localStorage.getItem('comparisonIds') || '[]');
    const updatedIds = currentIds.filter((compId: number) => compId !== id);
    localStorage.setItem('comparisonIds', JSON.stringify(updatedIds));
    
    // Update local state
    setSelectedMaterials(prev => prev.filter(product => product.id !== id));
    
    // Update comparison store so checkbox gets unchecked in main table
    comparisonStore.remove(id);
  };

  const getSpecValue = (material: Material, key: string): React.ReactNode => {
    const specs = material.specifications as Record<string, any>;
    const value = specs?.[key];
    
    // Special handling for Product URL to make it clickable
    if (key === 'Product URL' && value && typeof value === 'string') {
      return (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline break-all"
        >
          {value}
        </a>
      );
    }
    
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    if (value === null || value === undefined) {
      return "—";
    }
    return String(value);
  };

  // Enhanced specification fields based on category using centralized config
  const getSpecFields = (category: string) => {
    const specs = MATERIAL_SPECIFICATIONS[category] || [];
    
    // Always include base fields first with Product URL as the first field
    const baseFields = [
      { key: 'Product URL', label: 'Product URL' },
      { key: 'brand', label: 'Brand' },
      { key: 'category', label: 'Category' },
      { key: 'price', label: 'Price per SF' }
    ];

    // Add category-specific fields from centralized config
    const categoryFields = specs
      .filter(spec => !['name', 'brand', 'price', 'dimensions', 'Product URL', 'category'].includes(spec.key))
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Categories
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Product Comparison
              </h1>
              <p className="text-gray-600">
                Comparing {selectedMaterials.length} {selectedMaterials[0]?.category || 'products'}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearComparison}
          >
            Clear All
          </Button>
        </div>

        {/* Enhanced Comparison Table */}
        <div className="overflow-auto border rounded-xl shadow bg-white">
          <table className="min-w-full text-sm text-left table-fixed">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="p-4 w-1/4 font-semibold">Specification</th>
                {selectedMaterials.map((material) => (
                  <th key={material.id} className="p-4 w-1/4 font-semibold">
                    <div className="space-y-2">
                      <div className="font-semibold text-gray-900">{material.name}</div>
                      <Badge variant="secondary" className="text-xs">{material.brand}</Badge>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {specFields.map(field => (
                <tr key={field.key} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700">{field.label}</td>
                  {selectedMaterials.map((material) => {
                    let value = '';
                    if (field.key === 'price') {
                      value = `$${material.price}`;
                    } else if (field.key === 'dimensions') {
                      value = material.dimensions;
                    } else if (field.key === 'brand') {
                      value = material.brand;
                    } else if (field.key === 'category') {
                      return (
                        <td key={material.id} className="p-4">
                          <Badge variant="secondary">{material.category}</Badge>
                        </td>
                      );
                    } else {
                      value = getSpecValue(material, field.key);
                    }
                    
                    return (
                      <td key={material.id} className={`p-4 ${field.key === 'price' ? 'text-green-600 font-medium' : ''}`}>
                        {value || '—'}
                      </td>
                    );
                  })}
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