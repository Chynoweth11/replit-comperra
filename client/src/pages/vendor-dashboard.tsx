import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import VendorDashboard from "@/components/VendorDashboard";
import SEOHead from "@/components/seo-head";

export default function VendorDashboardPage() {
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
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
        title="Vendor Dashboard - Comperra"
        description="Vendor dashboard for managing leads, products, and subscriptions"
      />
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <VendorDashboard />
      </main>
      
      <Footer />
    </div>
  );
}