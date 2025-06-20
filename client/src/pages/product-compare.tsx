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
import { getCategorySpecifications } from "@shared/material-specifications";
import type { Material } from "@shared/schema";

export default function ProductCompare() {
  const [selectedMaterials, setSelectedMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: allMaterials = [] } = useQuery<Material[]>({
    queryKey: ["/api/materials"],
  });

  useEffect(() => {
    const loadSelectedProducts = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const idsParam = urlParams.get('ids');
        
        if (idsParam) {
          // Load products by IDs from URL
          const ids = idsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
          console.log('Loading products by IDs:', ids);
          
          const products: Material[] = [];
          for (const id of ids) {
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
          
          setSelectedMaterials(products);
          console.log('Loaded products from API:', products);
        } else {
          // Fallback to localStorage
          const stored = localStorage.getItem('comparisonIds');
          if (stored) {
            const storedIds = JSON.parse(stored);
            const materials = allMaterials.filter(m => storedIds.includes(m.id));
            setSelectedMaterials(materials);
          }
        }
      } catch (error) {
        console.error('Error loading selected products:', error);
      } finally {
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
    return value ? String(value) : "N/A";
  };

  const getAllSpecKeys = (materials: Material[]): string[] => {
    const keys = new Set<string>();
    materials.forEach(material => {
      if (material.specifications && typeof material.specifications === 'object') {
        Object.keys(material.specifications as Record<string, any>).forEach(key => keys.add(key));
      }
    });
    return Array.from(keys);
  };

  const formatSpecKey = (key: string): string => {
    return key
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };



  if (selectedMaterials.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">No Products Selected</h1>
            <p className="text-gray-600 mb-6">Please select materials to compare from the comparison table.</p>
            <Link href="/categories">
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                Browse Categories
              </Button>
            </Link>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const specKeys = getAllSpecKeys(selectedMaterials);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Product Comparison</h1>
            <p className="text-gray-600">Comparing {selectedMaterials.length} products side by side</p>
          </div>
          <div className="space-x-2">
            <Link href="/categories">
              <Button variant="outline">Add More Products</Button>
            </Link>
            <Button 
              variant="outline"
              onClick={clearComparison}
            >
              Clear All
            </Button>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {selectedMaterials.map((material) => (
            <Card key={material.id} className="overflow-hidden">
              {/* Product Image */}
              <div className="h-48 bg-gray-100 relative">
                {material.imageUrl ? (
                  <img
                    src={material.imageUrl}
                    alt={material.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="fas fa-image text-3xl text-gray-400"></i>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary">{material.category}</Badge>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{material.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{material.brand}</p>
                <p className="text-xl font-bold text-royal mb-3">${material.price}/SF</p>
                
                {material.dimensions && (
                  <p className="text-sm text-gray-600 mb-3">Size: {material.dimensions}</p>
                )}

                <div className="flex gap-2">
                  <Link href={`/product/${material.id}`}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                    >
                      View Details
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => removeProduct(material.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Detailed Specifications Comparison */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">Detailed Specifications</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold sticky left-0 bg-gray-50 border-r">Specification</th>
                  {selectedMaterials.map((material) => (
                    <th key={material.id} className="text-center p-4 font-semibold min-w-48">
                      <div className="flex flex-col items-center">
                        <span className="text-sm">{material.name}</span>
                        <Badge variant="outline" className="mt-1">{material.brand}</Badge>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Basic Info */}
                <tr className="border-b">
                  <td className="p-4 font-medium sticky left-0 bg-white border-r">Price per SF</td>
                  {selectedMaterials.map((material) => (
                    <td key={material.id} className="p-4 text-center font-semibold text-royal">
                      ${material.price}
                    </td>
                  ))}
                </tr>
                
                <tr className="border-b bg-gray-50">
                  <td className="p-4 font-medium sticky left-0 bg-gray-50 border-r">Dimensions</td>
                  {selectedMaterials.map((material) => (
                    <td key={material.id} className="p-4 text-center">
                      {material.dimensions || "N/A"}
                    </td>
                  ))}
                </tr>

                {/* Specifications */}
                {specKeys.map((key, index) => (
                  <tr key={key} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="p-4 font-medium sticky left-0 bg-inherit border-r">
                      {formatSpecKey(key)}
                    </td>
                    {selectedMaterials.map((material) => (
                      <td key={material.id} className="p-4 text-center">
                        {getSpecValue(material, key)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-center gap-4 mt-8">
          <Button 
            variant="outline"
            onClick={() => window.history.back()}
            className="border-royal text-royal hover:bg-royal hover:text-white"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Comparison
          </Button>
          <Button className="bg-royal text-white hover:bg-royal-dark">
            <i className="fas fa-download mr-2"></i>
            Export Comparison
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}