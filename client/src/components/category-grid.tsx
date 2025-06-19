import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
  ];

  return (
    <section id="categories" className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-12">Compare by Category</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group h-full flex flex-col"
          >
            <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
              <div className={`w-full h-full bg-gradient-to-br ${category.id === 'tiles' ? 'from-blue-400 to-blue-600' : 
                               category.id === 'slabs' ? 'from-gray-400 to-gray-600' : 
                               category.id === 'lvt' ? 'from-green-400 to-green-600' : 
                               category.id === 'hardwood' ? 'from-amber-500 to-amber-700' : 
                               category.id === 'heat' ? 'from-red-400 to-red-600' : 'from-purple-400 to-purple-600'} 
                               flex items-center justify-center text-white text-7xl group-hover:scale-110 transition-transform duration-500 ease-out`}>
                <div className="animate-pulse">
                  {category.id === 'tiles' ? '🏛️' : 
                   category.id === 'slabs' ? '🗿' : 
                   category.id === 'lvt' ? '📱' : 
                   category.id === 'hardwood' ? '🌲' : 
                   category.id === 'heat' ? '🔥' : '🧶'}
                </div>
              </div>
            </div>
            
            <div className="p-6 flex flex-col flex-grow">
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
    </section>
  );
}
