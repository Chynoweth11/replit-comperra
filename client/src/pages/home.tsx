import { useLocation } from "wouter";
import Header from "@/components/header";
import Hero from "@/components/hero";
import CategoryGrid from "@/components/category-grid";
import ArticlesSection from "@/components/articles-section";
import Footer from "@/components/footer";

export default function Home() {
  const [, navigate] = useLocation();

  const handleCategorySelect = (category: string) => {
    navigate(`/comparison/${category}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Hero onBrowseClick={() => navigate("/comparison")} />
      <CategoryGrid onCategorySelect={handleCategorySelect} />
      <ArticlesSection />
      <Footer />
    </div>
  );
}
