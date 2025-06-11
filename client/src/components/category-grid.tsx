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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => (
          <Card 
            key={category.id}
            className="bg-white shadow-lg rounded-xl p-8 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-royal-light rounded-lg flex items-center justify-center mr-4">
                <i className={`${category.icon} text-royal text-xl`}></i>
              </div>
              <h3 className="text-2xl font-semibold">{category.name}</h3>
            </div>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              {category.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {category.specs.map((spec) => (
                <span key={spec} className="spec-badge bg-gray-100 text-gray-800">
                  {spec}
                </span>
              ))}
            </div>
            
            <Button
              onClick={() => onCategorySelect(category.id)}
              className="w-full bg-royal text-white hover:bg-royal-dark font-semibold"
            >
              Compare {category.name}
            </Button>
          </Card>
        ))}
      </div>
    </section>
  );
}
