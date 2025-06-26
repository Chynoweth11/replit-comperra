import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Article } from "@shared/schema";

export default function ArticlesSection() {
  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });
  
  const [, navigate] = useLocation();

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
    <section className="bg-gradient-to-br from-slate-50 via-white to-blue-50 py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Expert Analysis
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Expert Buying Guides & Reviews</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Get professional insights and detailed analysis to make the best material decisions for your project.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {articles.map((article) => (
            <Card key={article.id} className="group bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-2xl hover:border-blue-300 hover:-translate-y-2 transition-all duration-500">
              {article.imageUrl && (
                <div className="relative overflow-hidden">
                  <img 
                    src={article.imageUrl} 
                    alt={article.title}
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              )}
              <div className="p-8">
                <div className="flex items-center mb-5">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${getCategoryColor(article.category)}`}>
                    {article.category}
                  </span>
                  <div className="flex items-center text-slate-500 text-sm ml-auto">
                    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {article.publishedAt}
                  </div>
                </div>
                
                <h3 className="font-bold text-xl mb-4 text-slate-900 leading-tight group-hover:text-blue-700 transition-colors duration-300">{article.title}</h3>
                <p className="text-slate-600 mb-6 leading-relaxed line-clamp-3">{article.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <Button 
                    variant="ghost" 
                    className="text-blue-600 font-semibold hover:text-blue-700 hover:bg-blue-50 p-0 group-hover:translate-x-1 transition-all duration-300"
                    onClick={() => {
                      console.log('Article clicked:', article.id);
                      console.log('Navigating to:', `/article/${article.id}`);
                      navigate(`/article/${article.id}`);
                    }}
                  >
                    Read Full Guide
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Button>
                  <div className="flex items-center text-sm text-slate-500">
                    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
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
