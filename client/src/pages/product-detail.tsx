import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/header";
import Footer from "@/components/footer";
import LeadCaptureModal from "@/components/lead-capture-modal";
import { comparisonStore } from "@/lib/comparison-store";
import type { Material } from "@shared/schema";

// Helper function to get category-specific images
const getProductImage = (category: string, brand?: string) => {
  const categoryImages = {
    tiles: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=500&fit=crop',
    slabs: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=500&h=500&fit=crop',
    lvt: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=500&h=500&fit=crop',
    hardwood: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&h=500&fit=crop',
    heat: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=500&fit=crop',
    carpet: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=500&h=500&fit=crop',
    thermostats: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=500&fit=crop'
  };
  
  return categoryImages[category as keyof typeof categoryImages] || 
         `https://placehold.co/500x500/E3F2FD/1976D2?text=${encodeURIComponent(brand || 'Product')}`;
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [requestType, setRequestType] = useState<'pricing' | 'sample'>('pricing');
  const [isInComparison, setIsInComparison] = useState(false);
  
  const { data: material, isLoading } = useQuery<Material>({
    queryKey: [`/api/materials/${id}`],
    enabled: !!id,
  });

  // Check if product is already in comparison
  useEffect(() => {
    if (material) {
      const unsubscribe = comparisonStore.subscribe(() => {
        setIsInComparison(comparisonStore.hasSelected(material.id));
      });
      
      // Initial check
      setIsInComparison(comparisonStore.hasSelected(material.id));
      
      return unsubscribe;
    }
  }, [material]);

  const handleGetPricing = (productName: string) => {
    setSelectedProduct(productName);
    setRequestType('pricing');
    setLeadModalOpen(true);
  };

  const handleRequestSamples = (productName: string) => {
    setSelectedProduct(productName);
    setRequestType('sample');
    setLeadModalOpen(true);
  };

  const formatSpecKey = (key: string): string => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const getSpecDisplayValue = (key: string, value: any): React.ReactNode => {
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

  const handleToggleCompare = () => {
    if (material) {
      comparisonStore.toggle(material.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
            <Link href="/comparison">
              <Button className="bg-royal text-white hover:bg-royal-dark">
                Back to Comparison
              </Button>
            </Link>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-royal">Home</Link>
            <span>/</span>
            <Link href="/comparison" className="hover:text-royal">Comparison</Link>
            <span>/</span>
            <Link href={`/comparison/${material.category}`} className="hover:text-royal">
              {material.category.charAt(0).toUpperCase() + material.category.slice(1)}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{material.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            {material.imageUrl ? (
              <img
                src={material.imageUrl}
                alt={material.name}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <i className="fas fa-image text-4xl text-gray-400"></i>
              </div>
            )}
            
            {/* Additional Images Placeholder */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="h-20 bg-gray-100 rounded border"></div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{material.category}</Badge>
                <Badge variant="outline">{material.brand}</Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{material.name}</h1>
              <p className="text-xl font-semibold text-royal">
                {material.price === 'N/A' || material.price === '0.00' ? 'N/A' : `$${material.price}/SF`}
              </p>
            </div>

            {material.description && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-gray-600 leading-relaxed">{material.description}</p>
              </div>
            )}

            {material.dimensions && material.dimensions !== '—' && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Dimensions</h2>
                <p className="text-gray-600">{material.dimensions}</p>
              </div>
            )}

            <div className="flex gap-4">
              <Button 
                className="bg-green-600 text-white hover:bg-green-700"
                onClick={() => handleGetPricing(material.name)}
              >
                Get Pricing
              </Button>
              {material.category !== 'heat' && material.category !== 'thermostats' && (
                <Button 
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                  onClick={() => handleRequestSamples(material.name)}
                >
                  Request Samples
                </Button>
              )}
              <Button 
                variant={isInComparison ? "default" : "outline"}
                className={isInComparison ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
                onClick={handleToggleCompare}
              >
                {isInComparison ? "Remove from Compare" : "Add to Compare"}
              </Button>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <Card className="mt-8 p-6">
          <h2 className="text-2xl font-bold mb-6">Technical Specifications</h2>
          
          {material.specifications && typeof material.specifications === 'object' ? (
            <div className="space-y-6">
              {/* Configuration Options Section */}
              {Object.entries(material.specifications as Record<string, any>)
                .filter(([key]) => key.toLowerCase().includes('available') || key.toLowerCase().includes('suitability'))
                .length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Configuration Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                    {Object.entries(material.specifications as Record<string, any>)
                      .filter(([key]) => key.toLowerCase().includes('available') || key.toLowerCase().includes('suitability'))
                      .map(([key, value]) => (
                        <div key={key} className="flex flex-col">
                          <span className="font-medium text-blue-800 text-sm">{formatSpecKey(key)}</span>
                          <span className="text-gray-700">{getSpecDisplayValue(key, value)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              {/* Core Specifications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Core Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(material.specifications as Record<string, any>)
                    .filter(([key, value]) => {
                      // Filter out empty values, dashes, and meaningless data
                      if (value === '—' || value === '' || value == null || value === undefined || value === '0.00') {
                        return false;
                      }
                      
                      // Hide image URLs and additional images from specifications for cleaner display
                      if (key.toLowerCase().includes('image url') || key.toLowerCase().includes('additional images')) {
                        return false;
                      }
                      
                      // Hide configuration options (they're shown in separate section above)
                      if (key.toLowerCase().includes('available') || key.toLowerCase().includes('suitability')) {
                        return false;
                      }
                  
                  // For stone & slabs products, hide Applications field and duplicate Dimensions
                  if (material.category === 'slabs') {
                    if (key.toLowerCase().includes('applications') || key.toLowerCase().includes('application')) {
                      return false;
                    }
                    // Hide dimensions in specs if already shown in product box
                    if ((key.toLowerCase().includes('dimensions') || key.toLowerCase().includes('dimension')) && material.dimensions && material.dimensions !== '—') {
                      return false;
                    }
                  }
                  
                  // For LVT products, hide Applications, Warranty, Installation, and Actions fields
                  if (material.category === 'lvt') {
                    if (key.toLowerCase().includes('applications') || key.toLowerCase().includes('application')) {
                      return false;
                    }
                    if (key.toLowerCase().includes('warranty')) {
                      return false;
                    }
                    if (key.toLowerCase().includes('installation')) {
                      return false;
                    }
                    if (key.toLowerCase().includes('actions')) {
                      return false;
                    }
                    // Hide dimensions in specs if already shown in product box
                    if ((key.toLowerCase().includes('dimensions') || key.toLowerCase().includes('dimension')) && material.dimensions && material.dimensions !== '—') {
                      return false;
                    }
                  }
                  
                  // For hardwood products, hide Janka Hardness, Installation, and Actions fields
                  if (material.category === 'hardwood') {
                    if (key.toLowerCase().includes('janka') || key.toLowerCase().includes('hardness')) {
                      return false;
                    }
                    if (key.toLowerCase().includes('installation')) {
                      return false;
                    }
                    if (key.toLowerCase().includes('actions')) {
                      return false;
                    }
                    if (key.toLowerCase().includes('applications') || key.toLowerCase().includes('application')) {
                      return false;
                    }
                  }
                  
                  // For carpet products, hide unwanted fields for cleaner display
                  if (material.category === 'carpet') {
                    if (key.toLowerCase().includes('applications') || key.toLowerCase().includes('application')) {
                      return false;
                    }
                    if (key.toLowerCase().includes('warranty')) {
                      return false;
                    }
                    if (key.toLowerCase().includes('actions')) {
                      return false;
                    }
                    if (key.toLowerCase().includes('installation')) {
                      return false;
                    }
                  }
                  
                  // For heating products, hide Actions field
                  if (material.category === 'heat') {
                    if (key.toLowerCase().includes('actions')) {
                      return false;
                    }
                    if (key.toLowerCase().includes('applications') || key.toLowerCase().includes('application')) {
                      return false;
                    }
                  }
                  
                  // For tiles, hide Actions field
                  if (material.category === 'tiles') {
                    if (key.toLowerCase().includes('actions')) {
                      return false;
                    }
                  }
                  
                  // For slabs, hide Actions field (already hiding Applications)
                  if (material.category === 'slabs') {
                    if (key.toLowerCase().includes('actions')) {
                      return false;
                    }
                  }
                  
                  // For hardwood products, hide Janka Hardness, Installation, and Actions fields
                  if (material.category === 'hardwood') {
                    if (key.toLowerCase().includes('janka') || key.toLowerCase().includes('hardness')) {
                      return false;
                    }
                    if (key.toLowerCase().includes('installation')) {
                      return false;
                    }
                    if (key.toLowerCase().includes('actions')) {
                      return false;
                    }
                    // Hide dimensions in specs if already shown in product box
                    if ((key.toLowerCase().includes('dimensions') || key.toLowerCase().includes('dimension')) && material.dimensions && material.dimensions !== '—') {
                      return false;
                    }
                  }
                  
                  return true;
                })
                    .map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                        <span className="font-medium text-gray-700">{formatSpecKey(key)}</span>
                        <div className="text-gray-900 text-right max-w-xs break-words">
                          {getSpecDisplayValue(key, value)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">No detailed specifications available.</p>
          )}
        </Card>

        {/* Related Products */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Similar Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((index) => (
              <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
                <div className="h-32 bg-gray-100 rounded mb-3"></div>
                <h3 className="font-semibold text-sm mb-1">Similar Product {index}</h3>
                <p className="text-xs text-gray-600 mb-2">Brand Name</p>
                <p className="font-semibold text-royal">$X.XX/SF</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link href={`/comparison/${material.category}`}>
            <Button variant="outline" className="border-royal text-royal hover:bg-royal hover:text-white">
              <i className="fas fa-arrow-left mr-2"></i>
              Back to {material.category.charAt(0).toUpperCase() + material.category.slice(1)} Comparison
            </Button>
          </Link>
        </div>
      </div>

      {/* Lead Capture Modal */}
      <LeadCaptureModal 
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        productName={selectedProduct}
        requestType={requestType}
        productSpecs={material?.specifications}
        productUrl={material?.productUrl}
      />

      <Footer />
    </div>
  );
}