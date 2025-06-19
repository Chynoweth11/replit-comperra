import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Article } from "@shared/schema";

export default function ArticlesSection() {
  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "buyer's guide":
        return "bg-royal-light text-royal";
      case "comparison":
        return "bg-green-100 text-green-800";
      case "performance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96 w-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Expert Buying Guides & Reviews</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get professional insights and detailed analysis to make the best material decisions for your project.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Card key={article.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {article.imageUrl && (
                <img 
                  src={article.imageUrl} 
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                    {article.category}
                  </span>
                  <span className="text-gray-500 text-sm ml-auto">{article.publishedAt}</span>
                </div>
                
                <h3 className="font-bold text-xl mb-3 text-gray-900">{article.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{article.description}</p>
                
                <div className="flex items-center justify-between">
                  <Link href={`/article/${article.id}`}>
                    <Button variant="ghost" className="text-royal font-semibold hover:text-royal-dark p-0">
                      Read Full Guide →
                    </Button>
                  </Link>
                  <div className="flex items-center text-sm text-gray-500">
                    <i className="fas fa-clock mr-1"></i>
                    {article.readTime} min read
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Newsletter Signup */}
        <Card className="p-8 mt-12 text-center">
          <h3 className="text-2xl font-bold mb-4">Stay Updated with Latest Material Data</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Get weekly updates on new product comparisons, price changes, and expert buying recommendations delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-1 focus:ring-2 focus:ring-royal focus:border-royal"
            />
            <Button className="bg-royal text-white hover:bg-royal-dark font-semibold">
              Subscribe Free
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            No spam. Unsubscribe anytime. 15,000+ contractors already subscribed.
          </p>
        </Card>
      </div>
    </section>
  );
}
