import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import tilesImage from "@assets/Tile_1750385685010.jpg";
import slabsImage from "@assets/Stone and slabs_1750385785852.jpg";
import lvtImage from "@assets/Vinyl_1750385685009.jpg";
import hardwoodImage from "@assets/Hardwood_1750385685009.jpg";
import heatImage from "@assets/Thermostat_1750385685008.jpg";
import carpetImage from "@assets/Carpet_1750385685009.jpg";

interface CategoryGridProps {
  onCategorySelect: (category: string) => void;
}

export default function CategoryGrid({ onCategorySelect }: CategoryGridProps) {
  const categories = [
    {
      id: "tiles",
      name: "Tiles",
      icon: "fas fa-th-large",
      description: "Compare PEI rating, finish types, slip resistance, water absorption, and installation methods across ceramic, porcelain, and natural stone tiles.",
      specs: ["PEI Rating", "Slip Resistance", "Water Absorption"],
    },
    {
      id: "slabs", 
      name: "Stone & Slabs",
      icon: "fas fa-square",
      description: "Analyze quartz, marble, granite, and sintered stone slabs by thickness, pricing, edge profiles, and surface treatments.",
      specs: ["Thickness", "Price/SF", "Edge Options"],
    },
    {
      id: "lvt",
      name: "Vinyl & LVT", 
      icon: "fas fa-layer-group",
      description: "Evaluate luxury vinyl planks and tiles by wear layer thickness, core construction, water resistance, and installation methods.",
      specs: ["Wear Layer", "Core Type", "Waterproof"],
    },
    {
      id: "hardwood",
      name: "Hardwood Flooring",
      icon: "fas fa-tree", 
      description: "Compare solid vs. engineered hardwood by species, plank dimensions, finish durability, and country of origin.",
      specs: ["Wood Species", "Finish Type", "Plank Width"],
    },
    {
      id: "heat",
      name: "Heating Systems",
      icon: "fas fa-thermometer-half",
      description: "Analyze radiant heating mats and smart thermostats by voltage, coverage area, programmable features, and compatibility.",
      specs: ["Voltage", "Coverage", "Smart Features"],
    },
    {
      id: "carpet",
      name: "Carpet",
      icon: "fas fa-grip-lines",
      description: "Evaluate carpet options by fiber composition, stain resistance technology, pile height, and traffic rating performance.",
      specs: ["Fiber Type", "Stain Resist", "Pile Height"],
    },
    {
      id: "thermostats",
      name: "Thermostats",
      icon: "fas fa-temperature-low",
      description: "Compare smart and programmable thermostats by voltage, load capacity, sensor types, connectivity, and control features.",
      specs: ["Device Type", "Voltage", "Load Capacity"],
    },
  ];

  return (
    <section id="categories" className="bg-gradient-to-br from-slate-50 via-white to-blue-50 py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-sm font-medium mb-6">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Building Material Categories
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Compare by Category</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Explore our comprehensive collection of building materials, each with detailed specifications and expert comparisons to help you make informed decisions.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className="group bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-2xl hover:border-blue-300 hover:-translate-y-3 transition-all duration-500 h-full flex flex-col"
          >
            <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
              <img 
                src={category.id === 'tiles' ? tilesImage : 
                     category.id === 'slabs' ? slabsImage : 
                     category.id === 'lvt' ? lvtImage : 
                     category.id === 'hardwood' ? hardwoodImage : 
                     category.id === 'heat' ? heatImage : 
                     category.id === 'thermostats' ? heatImage :
                     carpetImage} 
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className={`w-full h-full bg-gradient-to-br ${category.id === 'tiles' ? 'from-blue-400 to-blue-600' : 
                               category.id === 'slabs' ? 'from-gray-400 to-gray-600' : 
                               category.id === 'lvt' ? 'from-green-400 to-green-600' : 
                               category.id === 'hardwood' ? 'from-amber-500 to-amber-700' : 
                               category.id === 'heat' ? 'from-red-400 to-red-600' : 
                               category.id === 'thermostats' ? 'from-orange-400 to-orange-600' : 'from-purple-400 to-purple-600'} 
                               hidden items-center justify-center text-white text-7xl absolute top-0 left-0`}>
                <div>
                  {category.id === 'tiles' ? '🏛️' : 
                   category.id === 'slabs' ? '🗿' : 
                   category.id === 'lvt' ? '📱' : 
                   category.id === 'hardwood' ? '🌲' : 
                   category.id === 'heat' ? '🔥' : 
                   category.id === 'thermostats' ? '🌡️' : '🧶'}
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                <h4 className="text-lg font-bold mb-1">{category.name}</h4>
                <p className="text-sm opacity-90">Click to explore products</p>
              </div>
            </div>
            
            <div className="p-8 flex flex-col flex-grow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
                <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow">
                {category.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {category.specs.map((spec) => (
                  <span key={spec} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </section>
  );
}
