import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LeadCaptureModal from "./lead-capture-modal";
import { comparisonStore } from "@/lib/comparison-store";
import { MATERIAL_SPECIFICATIONS } from "@shared/material-specifications";
import type { Material } from "@shared/schema";

interface ComparisonTableProps {
  category: string;
  filters: {
    brand: string;
    minPrice: string;
    maxPrice: string;
    search: string;
  };
  overrideMaterials?: Material[];
}

export default function ComparisonTable({ category, filters, overrideMaterials }: ComparisonTableProps) {
  const [sortBy, setSortBy] = useState("price-low");
  const [selectedMaterials, setSelectedMaterials] = useState<number[]>([]);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [pasteUrl, setPasteUrl] = useState("");
  const [location, setLocation] = useLocation();
  const [visibleSpecs, setVisibleSpecs] = useState({
    price: true,
    brand: true,
    dimensions: true,
    specifications: true
  });

  // Subscribe to comparison store
  useEffect(() => {
    const unsubscribe = comparisonStore.subscribe((ids) => {
      setSelectedMaterials(ids);
    });
    
    // Initialize with current state
    setSelectedMaterials(comparisonStore.getSelected());
    
    return unsubscribe;
  }, []);

  const handleGetPricing = (productName: string) => {
    setSelectedProduct(productName);
    setLeadModalOpen(true);
  };

  const handleRequestSamples = (productName: string) => {
    setSelectedProduct(`Sample Request: ${productName}`);
    setLeadModalOpen(true);
  };

  const handleScrapeUrl = async () => {
    if (!pasteUrl.trim()) return;
    
    try {
      const response = await fetch('/api/scrape/single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: pasteUrl })
      });
      
      if (response.ok) {
        const result = await response.json();
        setPasteUrl("");
        
        // Redirect to the correct category page based on scraped product category
        if (result.product && result.product.category) {
          setLocation(`/comparison/${result.product.category}`);
        } else {
          // Refresh if category is unknown
          window.location.reload();
        }
      } else {
        const error = await response.json();
        console.error('Scraping failed:', error.error);
      }
    } catch (error) {
      console.error('Scraping error:', error);
    }
  };

  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('urlFile', file);

    try {
      const response = await fetch('/api/scrape/bulk', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('CSV upload error:', error);
    }
  };

  const toggleSpec = (spec: keyof typeof visibleSpecs) => {
    setVisibleSpecs(prev => ({ ...prev, [spec]: !prev[spec] }));
  };

  const toggleMaterialSelection = (id: number) => {
    console.log(`Toggling material selection:`, id);
    comparisonStore.toggle(id);
  };

  const handleCompareSelected = () => {
    const selectedIds = comparisonStore.getSelected();
    console.log('Compare button clicked with selections:', selectedIds);
    
    if (selectedIds.length === 0) {
      alert('Please select at least one product to compare.');
      return;
    }
    
    if (selectedIds.length > 5) {
      alert('Please select no more than 5 products to compare.');
      return;
    }
    
    // Validate all selected materials are from the same category
    const selectedMaterialData = filteredMaterials.filter(m => selectedIds.includes(m.id));
    const categories = new Set(selectedMaterialData.map(m => m.category));
    
    if (categories.size > 1) {
      const categoryList = Array.from(categories).join(", ");
      alert(`Cannot compare materials from different categories: ${categoryList}. Please select materials from the same category only.`);
      return;
    }
    
    // Store the IDs and navigate to comparison page
    localStorage.setItem('comparisonIds', JSON.stringify(selectedIds));
    console.log('Stored IDs in localStorage and navigating to /compare');
    setLocation('/compare');
  };

  const { data: materials = [], isLoading } = useQuery<Material[]>({
    queryKey: ["/api/materials", { 
      category,
      brand: filters.brand || undefined,
      minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
      search: filters.search || undefined,
    }],
  });

  console.log('ComparisonTable - Category:', category);
  console.log('ComparisonTable - Materials count:', materials.length);
  console.log('ComparisonTable - Materials:', materials.map(m => ({ name: m.name, category: m.category })));

  const sortedMaterials = [...materials].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price-high":
        return parseFloat(b.price) - parseFloat(a.price);
      case "brand":
        return a.brand.localeCompare(b.brand);
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const getHeaders = (category: string) => {
    const specs = MATERIAL_SPECIFICATIONS[category] || [];
    const baseHeaders = ["Product", "Brand", "Price/SF"];
    
    // Get the most important specs for table headers (limit to avoid overcrowding)
    const importantSpecs = specs
      .filter(spec => spec.required && !['name', 'brand', 'price'].includes(spec.key))
      .slice(0, 4) // Limit to 4 additional columns
      .map(spec => spec.label);
    
    return [...baseHeaders, ...importantSpecs, "Dimensions", "Actions"];
  };

  const getSpecBadge = (value: any, type: string) => {
    let bgColor = "bg-gray-100 text-gray-800";
    
    if (type === "pei" && typeof value === "number") {
      bgColor = value >= 4 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
    } else if (type === "slip") {
      bgColor = "bg-blue-100 text-blue-800";
    } else if (type === "warranty") {
      bgColor = "bg-green-100 text-green-800";
    } else if (type === "waterproof" && value === true) {
      bgColor = "bg-green-100 text-green-800";
    }
    
    return `spec-badge ${bgColor}`;
  };

  const renderSpecificationCell = (material: Material, category: string, specType: string) => {
    const specs = material.specifications as any;
    const categorySpecs = MATERIAL_SPECIFICATIONS[category] || [];
    
    switch (category) {
      case "tiles":
        switch (specType) {
          case "pei":
            return <span className={getSpecBadge(specs.peiRating, "pei")}>PEI {specs.peiRating}</span>;
          case "slip":
            return <span className={getSpecBadge(specs.slipRating, "slip")}>{specs.slipRating}</span>;
          case "water":
            return <span className={getSpecBadge(specs.waterAbsorption, "water")}>{specs.waterAbsorption}</span>;
        }
        break;
      case "slabs":
        switch (specType) {
          case "thickness":
            return <span className={getSpecBadge(specs.thickness, "thickness")}>{specs.thickness}</span>;
          case "warranty":
            return <span className={getSpecBadge(specs.warranty, "warranty")}>{specs.warranty}</span>;
          case "edges":
            return <span className={getSpecBadge(specs.edgeOptions?.length, "edges")}>{specs.edgeOptions?.length} Options</span>;
        }
        break;
      case "lvt":
        switch (specType) {
          case "wear":
            return <span className={getSpecBadge(specs.wearLayer, "wear")}>{specs.wearLayer}</span>;
          case "core":
            return <span className={getSpecBadge(specs.coreType, "core")}>{specs.coreType}</span>;
          case "waterproof":
            return <span className={getSpecBadge(specs.waterproof, "waterproof")}>{specs.waterproof ? "100%" : "No"}</span>;
        }
        break;
      case "hardwood":
        switch (specType) {
          case "species":
            return <span className={getSpecBadge(specs.species, "species")}>{specs.species}</span>;
          case "finish":
            return <span className={getSpecBadge(specs.finishType, "finish")}>{specs.finishType}</span>;
          case "width":
            return material.dimensions;
        }
        break;
      case "heat":
        switch (specType) {
          case "voltage":
            return <span className={getSpecBadge(specs.voltage, "voltage")}>{specs.voltage}</span>;
          case "coverage":
            return material.dimensions;
          case "features":
            return <span className={getSpecBadge(specs.features?.length, "features")}>{specs.features?.length} Features</span>;
          case "power":
            return <span className={getSpecBadge(specs.power, "power")}>{specs.power}</span>;
        }
        break;
      case "carpet":
        switch (specType) {
          case "fiber":
            return <span className={getSpecBadge(specs.fiberType, "fiber")}>{specs.fiberType}</span>;
          case "stain":
            return <span className={getSpecBadge(specs.stainResistance, "stain")}>{specs.stainResistance}</span>;
          case "pile":
            return material.dimensions;
          case "width":
            return <span className={getSpecBadge(specs.width, "width")}>{specs.width}</span>;
        }
        break;
    }
    return null;
  };



  const headers = category === "tiles" 
    ? ["Product", "Brand", "Price/SF", "PEI Rating", "DCOF / Slip Rating", "Water Absorption", "Dimensions", "Actions"]
    : category === "slabs" 
    ? ["Product", "Brand", "Price/SF", "Material Type", "Finish", "Color", "Thickness", "Water Absorption", "Applications", "Dimensions", "Scratch Resistance", "Actions"]
    : category === "lvt" 
    ? ["Product", "Brand", "Price/SF", "Material Type", "Wear Layer", "Thickness", "Waterproof", "Installation", "Applications", "Warranty", "Actions"]
    : category === "hardwood" 
    ? ["Product", "Brand", "Price/SF", "Species", "Finish", "Width", "Dimensions", "Actions"]
    : category === "heat" 
    ? ["Product", "Brand", "Price/SF", "Voltage", "Coverage", "Features", "Power", "Dimensions", "Actions"]
    : category === "carpet" 
    ? ["Product", "Brand", "Price/SF", "Fiber", "Stain Resistance", "Pile Height", "Width", "Dimensions", "Actions"]
    : ["Product", "Brand", "Price/SF", "Dimensions", "Actions"];

  if (isLoading) {
    return (
      <div className="lg:w-3/4">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="lg:w-3/4">
      {/* URL Scraping and CSV Upload Bar */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2 items-center flex-1 min-w-64">
            <Input
              placeholder="Paste product URL to scrape..."
              value={pasteUrl}
              onChange={(e) => setPasteUrl(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleScrapeUrl}
              disabled={!pasteUrl.trim()}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Scrape
            </Button>
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="file"
              id="csv-upload"
              accept=".csv,.txt"
              onChange={handleCsvUpload}
              className="hidden"
            />
            <Label 
              htmlFor="csv-upload" 
              className="cursor-pointer bg-gray-200 px-3 py-2 rounded border hover:bg-gray-300"
            >
              Upload CSV
            </Label>
          </div>
        </div>
      </div>

      {/* Spec Toggle Controls */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap gap-4 items-center">
          <span className="text-sm font-medium">Show/Hide Columns:</span>
          {(Object.keys(visibleSpecs) as Array<keyof typeof visibleSpecs>).map((spec) => (
            <label key={spec} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={visibleSpecs[spec]}
                onChange={() => toggleSpec(spec)}
                className="rounded"
              />
              <span className="capitalize">{spec}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort and View Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Sort by:</label>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="brand">Brand A-Z</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" title="Grid View">
            <i className="fas fa-th text-gray-600"></i>
          </Button>
          <Button variant="outline" size="sm" className="bg-gray-100" title="Table View">
            <i className="fas fa-list text-gray-600"></i>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            title="Compare Selected"
            onClick={handleCompareSelected}
            className={comparisonStore.getCount() > 0 ? "bg-blue-50 border-blue-200" : ""}
          >
            <i className="fas fa-balance-scale text-gray-600"></i>
            {comparisonStore.getCount() > 0 && (
              <span className="ml-1 text-xs bg-blue-500 text-white rounded-full px-1.5 py-0.5">
                {comparisonStore.getCount()}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="w-full">
          <table className="w-full comparison-table min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={header}
                    className={`px-4 py-4 text-left text-sm font-semibold text-gray-900 ${
                      index === 0 ? "border-r min-w-64" : "min-w-32"
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedMaterials.map((material) => (
                <tr key={material.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 border-r">
                    <div className="flex items-center">
                      <Checkbox
                        checked={comparisonStore.hasSelected(material.id)}
                        onCheckedChange={(checked) => {
                          console.log(`Material ${material.id} (${material.name}) ${checked ? 'selected' : 'deselected'}`);
                          toggleMaterialSelection(material.id);
                        }}
                        className="mr-3"
                      />
                      {material.imageUrl && (
                        <img 
                          src={material.imageUrl} 
                          alt={material.name}
                          className="w-12 h-12 rounded-lg object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{material.name}</div>
                        <div className="text-sm text-gray-500">{material.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">{material.brand}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                    {material.price === 'N/A' || material.price === '0.00' ? 'N/A' : `$${material.price}`}
                  </td>
                  
                  {/* Category-specific specification columns */}
                  {category === "tiles" && (
                    <>
                      <td className="px-4 py-4 text-center">
                        {material.specifications?.['PEI Rating'] || material.specifications?.peiRating || '—'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {material.specifications?.['DCOF / Slip Rating'] || material.specifications?.slipRating || '—'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {material.specifications?.['Water Absorption'] || material.specifications?.waterAbsorption || '—'}
                      </td>
                    </>
                  )}
                  
                  {category === "slabs" && (
                    <>
                      <td className="px-4 py-4 text-center">
                        {material.specifications?.['Material Type'] || material.specifications?.materialType || material.specifications?.material || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {material.specifications?.['Finish'] || material.specifications?.finish || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {material.specifications?.['Color / Pattern'] || material.specifications?.['Color'] || material.specifications?.color || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {material.specifications?.['Thickness'] || material.specifications?.thickness || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {material.specifications?.['Water Absorption'] || material.specifications?.waterAbsorption || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {material.specifications?.['Applications'] || (Array.isArray(material.specifications?.applications) ? material.specifications.applications.join(', ') : material.specifications?.applications) || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {material.specifications?.['Slab Dimensions'] || material.specifications?.['Dimensions'] || material.specifications?.slabSize || material.dimensions || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {material.specifications?.['Scratch / Etch Resistance'] || material.specifications?.['Scratch Resistance'] || material.specifications?.scratchResistance || 'N/A'}
                      </td>
                    </>
                  )}
                  
                  {category === "lvt" && (
                    <>
                      <td className="px-4 py-4 text-center">
                        {material.specifications?.['Wear Layer'] || material.specifications?.wearLayer || '—'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {material.specifications?.['Core Type'] || material.specifications?.coreType || '—'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {material.specifications?.['Waterproof'] || (material.specifications?.waterproof ? 'Yes' : 'No') || '—'}
                      </td>
                    </>
                  )}
                  
                  {category === "hardwood" && (
                    <>
                      <td className="px-4 py-4 text-center">
                        {material.specifications?.['Species'] || material.specifications?.species || '—'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {material.specifications?.['Finish'] || material.specifications?.finishType || '—'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {material.specifications?.['Width'] || material.specifications?.plankWidth || '—'}
                      </td>
                    </>
                  )}
                  
                  {category === "heat" && (
                    <>
                      <td className="px-4 py-4 text-center">
                        {material.specifications?.['Voltage'] || material.specifications?.voltage || '—'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {material.specifications?.['Coverage'] || material.specifications?.coverageArea || material.specifications?.['Coverage Area (SF)'] || '—'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {material.specifications?.['Features'] || (Array.isArray(material.specifications?.features) ? material.specifications.features.join(', ') : material.specifications?.features) || '—'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {material.specifications?.['Power'] || material.specifications?.power || '—'}
                      </td>
                    </>
                  )}
                  
                  {category === "carpet" && (
                    <>
                      <td className="px-4 py-4 text-center">
                        {material.specifications?.['Fiber'] || material.specifications?.fiberType || '—'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {material.specifications?.['Stain Resistance'] || material.specifications?.stainResistance || '—'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {material.specifications?.['Pile Height'] || material.specifications?.pileHeight || '—'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {material.specifications?.['Width'] || material.specifications?.width || '—'}
                      </td>
                    </>
                  )}
                  
                  <td className="px-4 py-4 text-sm text-gray-900 text-center">
                    {material.specifications?.['Dimensions'] || material.dimensions || '—'}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-royal hover:text-royal-dark"
                        onClick={() => setLocation(`/product/${material.id}`)}
                      >
                        View Details
                      </Button>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-green-600 text-white hover:bg-green-700 flex-1"
                          onClick={() => handleGetPricing(material.name)}
                        >
                          Get Pricing
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-green-600 text-green-600 hover:bg-green-50 flex-1"
                          onClick={() => handleRequestSamples(material.name)}
                        >
                          Request Samples
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Actions */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-600">
          Showing {sortedMaterials.length} products
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="border-royal text-royal hover:bg-royal hover:text-white"
            disabled={selectedMaterials.length < 1}
            onClick={() => {
              console.log('Compare button clicked with selections:', selectedMaterials);
              if (selectedMaterials.length >= 1) {
                localStorage.setItem('comparisonIds', JSON.stringify(selectedMaterials));
                setLocation('/compare');
              }
            }}
          >
            Compare Selected ({selectedMaterials.length})
          </Button>
          <Button className="bg-royal text-white hover:bg-royal-dark">
            Load More Products
          </Button>
        </div>
      </div>

      {/* Lead Capture Modal */}
      <LeadCaptureModal 
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        productName={selectedProduct}
      />

      {/* Floating Comparison Bar */}
      {selectedMaterials.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t p-4 z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <span className="text-gray-600">
                {selectedMaterials.length} products selected
              </span>
              <Button 
                variant="outline" 
                className="border-royal text-royal hover:bg-royal hover:text-white"
                disabled={selectedMaterials.length < 2}
                onClick={() => {
                  if (selectedMaterials.length >= 2) {
                    localStorage.setItem('comparisonIds', JSON.stringify(selectedMaterials));
                    setLocation('/compare');
                  }
                }}
              >
                Compare Selected ({selectedMaterials.length})
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => comparisonStore.clear()}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
