import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import type { Article } from "@shared/schema";

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  
  const { data: article, isLoading } = useQuery<Article>({
    queryKey: [`/api/articles/${id}`],
    enabled: !!id,
  });

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "buyer's guide":
        return "bg-blue-100 text-blue-800";
      case "comparison":
        return "bg-green-100 text-green-800";
      case "performance":
        return "bg-yellow-100 text-yellow-800";
      case "heating guide":
        return "bg-red-100 text-red-800";
      case "durability & design":
        return "bg-purple-100 text-purple-800";
      case "design & longevity":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <div className="flex gap-4 mb-8">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-64 w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-6">The article you're looking for doesn't exist.</p>
            <Link href="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Guides
          </Button>
        </Link>

        {/* Article Header */}
        <article className="bg-white rounded-xl shadow-lg overflow-hidden">
          {article.imageUrl && (
            <img 
              src={article.imageUrl} 
              alt={article.title}
              className="w-full h-64 md:h-80 object-cover"
            />
          )}
          
          <div className="p-8">
            {/* Article Meta */}
            <div className="flex flex-wrap gap-4 items-center mb-6">
              <Badge className={getCategoryColor(article.category)}>
                {article.category}
              </Badge>
              <div className="flex items-center text-gray-500 text-sm">
                <Calendar className="w-4 h-4 mr-1" />
                {article.publishedAt}
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <Clock className="w-4 h-4 mr-1" />
                {article.readTime} min read
              </div>
            </div>

            {/* Article Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {article.title}
            </h1>

            {/* Article Description */}
            <p className="text-xl text-gray-600 leading-relaxed mb-8 border-l-4 border-blue-500 pl-6">
              {article.description}
            </p>

            {/* Article Content */}
            {article.content && (
              <div className="prose prose-lg max-w-none">
                {article.content.split('\n').map((paragraph, index) => {
                  if (paragraph.trim() === '') return null;
                  
                  // Handle bullet points
                  if (paragraph.startsWith('•')) {
                    return (
                      <div key={index} className="flex items-start mb-2">
                        <span className="text-blue-500 font-bold mr-3 mt-1">•</span>
                        <span>{paragraph.substring(1).trim()}</span>
                      </div>
                    );
                  }
                  
                  // Handle section headers (lines that end with colon)
                  if (paragraph.endsWith(':')) {
                    return (
                      <h3 key={index} className="text-xl font-bold text-gray-900 mt-8 mb-4">
                        {paragraph}
                      </h3>
                    );
                  }
                  
                  // Regular paragraphs
                  return (
                    <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            )}
          </div>
        </article>

        {/* Related Articles or CTA */}
        <Card className="p-6 mt-8 text-center bg-blue-50">
          <h3 className="text-xl font-bold mb-3">Need Help Choosing Materials?</h3>
          <p className="text-gray-600 mb-4">
            Get personalized recommendations based on your specific project requirements.
          </p>
          <Link href="/comparison/tiles">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Start Product Comparison
            </Button>
          </Link>
        </Card>
      </main>

      <Footer />
    </div>
  );
}