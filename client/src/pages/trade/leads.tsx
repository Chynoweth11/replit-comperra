import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/seo-head";

export default function TradeLeads() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'trade')) {
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

  if (!user || user.role !== 'trade') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="Trade Professional Leads - Comperra"
        description="View and manage your matched installation leads"
      />
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Installation Leads</h1>
          <p className="text-gray-600">View installation projects matched to your expertise</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>🔧 Vinyl Plank Installation</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">New</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Location:</strong> Fremont, CA</p>
                <p><strong>Service Type:</strong> LVT Installation</p>
                <p><strong>Budget:</strong> $8,000 - $12,000</p>
                <p><strong>Timeline:</strong> 1-2 weeks</p>
                <p><strong>Details:</strong> 800 sq ft luxury vinyl plank installation in residential home</p>
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
                <span>🏠 Carpet Installation</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">Active</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Location:</strong> Palo Alto, CA</p>
                <p><strong>Service Type:</strong> Carpet Installation</p>
                <p><strong>Budget:</strong> $4,000 - $6,000</p>
                <p><strong>Timeline:</strong> 3-5 days</p>
                <p><strong>Details:</strong> Master bedroom and living room carpet installation</p>
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
                <span>🌡️ Heating System Installation</span>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Follow-up</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Location:</strong> Mountain View, CA</p>
                <p><strong>Service Type:</strong> Radiant Floor Heating</p>
                <p><strong>Budget:</strong> $6,000 - $9,000</p>
                <p><strong>Timeline:</strong> 2-3 weeks</p>
                <p><strong>Details:</strong> Under-floor heating system installation in bathroom renovation</p>
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