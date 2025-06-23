import { Button } from "@/components/ui/button";

interface HeroProps {
  onBrowseClick: () => void;
  onStartComparing: () => void;
}

export default function Hero({ onBrowseClick, onStartComparing }: HeroProps) {

  return (
    <section className="bg-gradient-to-br from-blue-50 to-white py-16 text-center">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-5xl font-bold text-gray-900 mb-4">
          Smart Material Comparisons Start Here
        </h2>
        <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
          Instantly compare specifications, prices, and performance data across thousands 
          of building materials. Make informed decisions with our comprehensive comparison tools.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={onStartComparing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg"
            size="lg"
          >
            Start Comparing
          </Button>
          <Button 
            variant="outline"
            onClick={onBrowseClick}
            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 text-lg font-semibold"
            size="lg"
          >
            Browse Categories
          </Button>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-8 mt-12 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">1,000+</div>
            <div className="text-sm text-gray-600">Products</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">50+</div>
            <div className="text-sm text-gray-600">Brands</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">7</div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
        </div>
      </div>
    </section>
  );
}
