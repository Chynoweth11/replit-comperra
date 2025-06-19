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
            <div className="h-40 bg-gray-100 relative overflow-hidden">
              <img 
                src={`https://images.unsplash.com/photo-${category.id === 'tiles' ? '1556912173-46c336c7fd55' : 
                     category.id === 'slabs' ? '1556909114-f6e7ad7d3136' : 
                     category.id === 'lvt' ? '1586105251261-72a756497a11' : 
                     category.id === 'hardwood' ? '1586023492125-27b2c045efd7' : 
                     category.id === 'heat' ? '1558618666-fcd25c85cd64' : 
                     '1584464491033-06628f3a6b7b'}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300`} 
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className={`w-full h-full ${category.id === 'tiles' ? 'bg-blue-500' : 
                               category.id === 'slabs' ? 'bg-gray-500' : 
                               category.id === 'lvt' ? 'bg-green-500' : 
                               category.id === 'hardwood' ? 'bg-amber-600' : 
                               category.id === 'heat' ? 'bg-red-500' : 'bg-purple-500'} items-center justify-center text-white text-6xl hidden absolute top-0 left-0`}>
                {category.id === 'tiles' ? '🏛️' : 
                 category.id === 'slabs' ? '🗿' : 
                 category.id === 'lvt' ? '📱' : 
                 category.id === 'hardwood' ? '🌲' : 
                 category.id === 'heat' ? '🔥' : '🧶'}
              </div>
              <div className="absolute top-3 right-3">
                <div className={`w-10 h-10 ${category.id === 'tiles' ? 'bg-blue-500' : 
                               category.id === 'slabs' ? 'bg-gray-500' : 
                               category.id === 'lvt' ? 'bg-green-500' : 
                               category.id === 'hardwood' ? 'bg-amber-600' : 
                               category.id === 'heat' ? 'bg-red-500' : 'bg-purple-500'} rounded-full flex items-center justify-center text-white text-lg shadow-lg`}>
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
