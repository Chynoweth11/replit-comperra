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

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
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
    setLeadModalOpen(true);
  };

  const handleRequestSamples = (productName: string) => {
    setSelectedProduct(`Sample Request: ${productName}`);
    setLeadModalOpen(true);
  };

  const handleToggleCompare = () => {
    if (material) {
      comparisonStore.toggle(material.id);
    }
  };

  const getSpecDisplayValue = (key: string, value: any): string => {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    return String(value);
  };

  const formatSpecKey = (key: string): string => {
    return key
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
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
              <p className="text-xl font-semibold text-royal">${material.price}/SF</p>
            </div>

            {material.description && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-gray-600 leading-relaxed">{material.description}</p>
              </div>
            )}

            {material.dimensions && (
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
              <Button 
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => handleRequestSamples(material.name)}
              >
                Request Samples
              </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(material.specifications as Record<string, any>).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="font-medium text-gray-700">{formatSpecKey(key)}</span>
                  <span className="text-gray-900">{getSpecDisplayValue(key, value)}</span>
                </div>
              ))}
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
      />

      <Footer />
    </div>
  );
}