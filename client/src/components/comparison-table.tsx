import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import type { Material } from "@shared/schema";

interface ComparisonTableProps {
  category: string;
  filters: {
    brand: string;
    minPrice: string;
    maxPrice: string;
    search: string;
  };
}

export default function ComparisonTable({ category, filters }: ComparisonTableProps) {
  const [sortBy, setSortBy] = useState("price-low");
  const [selectedMaterials, setSelectedMaterials] = useState<number[]>([]);
  const [, navigate] = useLocation();

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
    const baseHeaders = ["Product", "Brand", "Price/SF"];
    
    switch (category) {
      case "tiles":
        return [...baseHeaders, "PEI Rating", "Slip Rating", "Water Absorption", "Size", "Actions"];
      case "slabs":
        return [...baseHeaders, "Thickness", "Warranty", "Edge Options", "Slab Size", "Actions"];
      case "lvt":
        return [...baseHeaders, "Wear Layer", "Core Type", "Waterproof", "Plank Size", "Actions"];
      case "hardwood":
        return [...baseHeaders, "Species", "Finish", "Width", "Thickness", "Actions"];
      case "heat":
        return [...baseHeaders, "Voltage", "Coverage", "Features", "Power", "Actions"];
      case "carpet":
        return [...baseHeaders, "Fiber", "Stain Resist", "Pile Height", "Width", "Actions"];
      default:
        return [...baseHeaders, "Specifications", "Size", "Actions"];
    }
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

  const toggleMaterialSelection = (materialId: number) => {
    setSelectedMaterials(prev => 
      prev.includes(materialId) 
        ? prev.filter(id => id !== materialId)
        : [...prev, materialId]
    );
  };

  const headers = getHeaders(category);

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
          <Button variant="outline" size="sm" title="Compare Selected">
            <i className="fas fa-balance-scale text-gray-600"></i>
          </Button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full comparison-table">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={header}
                    className={`px-4 py-4 text-left text-sm font-semibold text-gray-900 ${
                      index === 0 ? "sticky-column border-r min-w-64" : "min-w-24"
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
                  <td className="sticky-column px-6 py-4 border-r">
                    <div className="flex items-center">
                      <Checkbox
                        checked={selectedMaterials.includes(material.id)}
                        onCheckedChange={() => toggleMaterialSelection(material.id)}
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
                  <td className="px-4 py-4 text-sm font-semibold text-gray-900">${material.price}</td>
                  
                  {/* Category-specific specification columns */}
                  {category === "tiles" && (
                    <>
                      <td className="px-4 py-4">{renderSpecificationCell(material, category, "pei")}</td>
                      <td className="px-4 py-4">{renderSpecificationCell(material, category, "slip")}</td>
                      <td className="px-4 py-4">{renderSpecificationCell(material, category, "water")}</td>
                    </>
                  )}
                  
                  {category === "slabs" && (
                    <>
                      <td className="px-4 py-4">{renderSpecificationCell(material, category, "thickness")}</td>
                      <td className="px-4 py-4">{renderSpecificationCell(material, category, "warranty")}</td>
                      <td className="px-4 py-4">{renderSpecificationCell(material, category, "edges")}</td>
                    </>
                  )}
                  
                  {category === "lvt" && (
                    <>
                      <td className="px-4 py-4">{renderSpecificationCell(material, category, "wear")}</td>
                      <td className="px-4 py-4">{renderSpecificationCell(material, category, "core")}</td>
                      <td className="px-4 py-4">{renderSpecificationCell(material, category, "waterproof")}</td>
                    </>
                  )}
                  
                  {category === "hardwood" && (
                    <>
                      <td className="px-4 py-4">{renderSpecificationCell(material, category, "species")}</td>
                      <td className="px-4 py-4">{renderSpecificationCell(material, category, "finish")}</td>
                      <td className="px-4 py-4">{renderSpecificationCell(material, category, "width")}</td>
                    </>
                  )}
                  
                  {category === "heat" && (
                    <>
                      <td className="px-4 py-4">{renderSpecificationCell(material, category, "voltage")}</td>
                      <td className="px-4 py-4">{renderSpecificationCell(material, category, "coverage")}</td>
                      <td className="px-4 py-4">{renderSpecificationCell(material, category, "features")}</td>
                      <td className="px-4 py-4">{renderSpecificationCell(material, category, "power")}</td>
                    </>
                  )}
                  
                  {category === "carpet" && (
                    <>
                      <td className="px-4 py-4">{renderSpecificationCell(material, category, "fiber")}</td>
                      <td className="px-4 py-4">{renderSpecificationCell(material, category, "stain")}</td>
                      <td className="px-4 py-4">{renderSpecificationCell(material, category, "pile")}</td>
                      <td className="px-4 py-4">{renderSpecificationCell(material, category, "width")}</td>
                    </>
                  )}
                  
                  <td className="px-4 py-4 text-sm text-gray-900">{material.dimensions}</td>
                  <td className="px-4 py-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-royal hover:text-royal-dark"
                      onClick={() => navigate(`/product/${material.id}`)}
                    >
                      View Details
                    </Button>
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
            disabled={selectedMaterials.length < 2}
            onClick={() => {
              if (selectedMaterials.length >= 2) {
                navigate(`/compare?ids=${selectedMaterials.join(',')}`);
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
    </div>
  );
}
