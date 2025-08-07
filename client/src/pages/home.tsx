import { useLocation, Link } from "wouter";
import Header from "@/components/header";
import Hero from "@/components/hero";
import CategoryGrid from "@/components/category-grid";
import ArticlesSection from "@/components/articles-section";
import Footer from "@/components/footer";
import SEOHead from "@/components/seo-head";

export default function Home() {
  const [, navigate] = useLocation();

  const handleCategorySelect = (category: string) => {
    navigate(`/comparison/${category}`);
  };

  const handleStartComparing = () => {
    navigate("/comparison/tiles");
  };

  const handleBrowseCategories = () => {
    navigate("/categories");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="Comperra - Smart Building Materials Comparison Platform"
        description="Compare tiles, stone, vinyl, hardwood, heating systems, and carpet with detailed specifications and pricing. Make informed building material decisions with expert guides."
        keywords="building materials comparison, tiles, stone slabs, vinyl flooring, hardwood, radiant heating, carpet, construction materials, building supplies"
      />
      <Header />
      <Hero onBrowseClick={handleBrowseCategories} onStartComparing={handleStartComparing} />
      <CategoryGrid onCategorySelect={handleCategorySelect} />
      


      <ArticlesSection />
      <Footer />
    </div>
  );
}
