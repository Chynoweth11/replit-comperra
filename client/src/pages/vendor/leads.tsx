import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/seo-head";

export default function VendorLeads() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'vendor')) {
      setLocation('/');
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || user.role !== 'vendor') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="Vendor Leads - Comperra"
        description="View and manage your matched leads"
      />
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Matched Leads</h1>
          <p className="text-gray-600">View personalized leads based on your location and specialty</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>🏠 Hardwood Flooring Project</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">New</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Location:</strong> San Francisco, CA</p>
                <p><strong>Project Type:</strong> Residential Hardwood Installation</p>
                <p><strong>Budget:</strong> $15,000 - $25,000</p>
                <p><strong>Timeline:</strong> 2-3 weeks</p>
                <p><strong>Details:</strong> 1,200 sq ft home needs engineered hardwood flooring installation</p>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm">Contact Customer</Button>
                <Button size="sm" variant="outline">View Details</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>🏢 Commercial Tile Project</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">Active</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Location:</strong> Oakland, CA</p>
                <p><strong>Project Type:</strong> Commercial Tile Installation</p>
                <p><strong>Budget:</strong> $50,000 - $75,000</p>
                <p><strong>Timeline:</strong> 4-6 weeks</p>
                <p><strong>Details:</strong> Office building lobby renovation with porcelain tiles</p>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm">Contact Customer</Button>
                <Button size="sm" variant="outline">View Details</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>🏠 Kitchen Backsplash</span>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Follow-up</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Location:</strong> San Jose, CA</p>
                <p><strong>Project Type:</strong> Kitchen Backsplash</p>
                <p><strong>Budget:</strong> $3,000 - $5,000</p>
                <p><strong>Timeline:</strong> 1 week</p>
                <p><strong>Details:</strong> Subway tile backsplash installation in modern kitchen</p>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm">Contact Customer</Button>
                <Button size="sm" variant="outline">View Details</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}