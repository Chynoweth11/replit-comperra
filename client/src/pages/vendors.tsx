import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SEOHead from "@/components/seo-head";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Brand } from "@shared/schema";

export default function Vendors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const { data: brands = [], isLoading } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
  });

  const vendorTypes = [
    { id: "all", name: "All Vendors", count: brands.length },
    { id: "manufacturer", name: "Manufacturers", count: brands.filter(b => b.description?.includes("manufact") || b.description?.includes("Manufact")).length },
    { id: "distributor", name: "Distributors", count: brands.filter(b => b.description?.includes("distribut") || b.description?.includes("Distribut")).length },
    { id: "supplier", name: "Suppliers", count: brands.filter(b => b.description?.includes("supplier") || b.description?.includes("Supplier")).length }
  ];

  const filteredBrands = brands.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         brand.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedType === "all") return matchesSearch;
    
    const matchesType = brand.description?.toLowerCase().includes(selectedType) || false;
    return matchesSearch && matchesType;
  });

  const getVendorType = (description: string = ""): string => {
    const desc = description.toLowerCase();
    if (desc.includes("manufactur")) return "Manufacturer";
    if (desc.includes("distribut")) return "Distributor"; 
    if (desc.includes("supplier")) return "Supplier";
    return "Vendor";
  };

  const getVendorCategories = (description: string = ""): string[] => {
    const categories = [];
    if (description.includes("tile") || description.includes("ceramic") || description.includes("porcelain")) categories.push("Tiles");
    if (description.includes("stone") || description.includes("granite") || description.includes("marble") || description.includes("quartz")) categories.push("Stone & Slabs");
    if (description.includes("vinyl") || description.includes("LVT") || description.includes("luxury vinyl")) categories.push("Vinyl & LVT");
    if (description.includes("hardwood") || description.includes("wood") || description.includes("flooring")) categories.push("Hardwood");
    if (description.includes("heating") || description.includes("radiant") || description.includes("floor warming")) categories.push("Heating");
    if (description.includes("carpet") || description.includes("rug")) categories.push("Carpet");
    return categories.length > 0 ? categories : ["General"];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="Vendor Directory - Comperra"
        description="Comprehensive directory of building material vendors, manufacturers, and distributors. Find trusted suppliers for tiles, stone, vinyl, hardwood, heating, and carpet."
        keywords="building material vendors, manufacturers, distributors, suppliers, tiles, stone, vinyl, hardwood, heating, carpet"
      />
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Vendor Directory</h1>
          <p className="text-gray-600">Discover trusted manufacturers, distributors, and suppliers of building materials</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search vendors by name, location, or products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              {vendorTypes.map(type => (
                <Button
                  key={type.id}
                  variant={selectedType === type.id ? "default" : "outline"}
                  onClick={() => setSelectedType(type.id)}
                  className="text-sm"
                >
                  {type.name} ({type.count})
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Vendor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands.map((brand) => (
            <Card key={brand.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-blue-600">{brand.name}</h3>
                  <Badge variant="secondary" className="mt-2">
                    {getVendorType(brand.description)}
                  </Badge>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {brand.description || "Building materials supplier"}
              </p>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Product Categories:</h4>
                <div className="flex flex-wrap gap-1">
                  {getVendorCategories(brand.description).map((category, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Link href={`/brands/${brand.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <Button variant="outline" size="sm" className="text-xs">
                    View Products
                  </Button>
                </Link>
                <Button variant="outline" size="sm" className="text-xs">
                  Contact Info
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredBrands.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search terms or filters</p>
            <Button onClick={() => { setSearchTerm(""); setSelectedType("all"); }}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Vendor Stats */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Vendor Network Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{brands.length}</div>
              <div className="text-sm text-gray-600">Total Vendors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {brands.filter(b => b.description?.toLowerCase().includes("manufactur")).length}
              </div>
              <div className="text-sm text-gray-600">Manufacturers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {brands.filter(b => b.description?.toLowerCase().includes("distribut")).length}
              </div>
              <div className="text-sm text-gray-600">Distributors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">6</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}