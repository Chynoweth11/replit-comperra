import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { ArrowLeft, Calendar, Mail, MapPin, Package, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Quote {
  id: string;
  productName: string;
  category: string;
  customerType: string;
  email: string;
  zipCode: string;
  status: 'pending' | 'responded' | 'expired';
  requestDate: string;
  responseDate?: string;
  notes?: string;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    // Load quotes from localStorage (in a real app, this would come from an API)
    const savedQuotes = localStorage.getItem('quoteHistory');
    if (savedQuotes) {
      setQuotes(JSON.parse(savedQuotes));
    } else {
      // Sample data to demonstrate functionality
      const sampleQuotes: Quote[] = [
        {
          id: '1',
          productName: 'Metropolis Gray Porcelain Tile',
          category: 'Tiles',
          customerType: 'homeowner',
          email: 'user@example.com',
          zipCode: '90210',
          status: 'responded',
          requestDate: '2025-01-15',
          responseDate: '2025-01-16',
          notes: 'Price quoted for 500 sq ft installation'
        },
        {
          id: '2',
          productName: 'Calacatta Gold Marble Slab',
          category: 'Stone & Slabs',
          customerType: 'designer',
          email: 'user@example.com',
          zipCode: '90210',
          status: 'pending',
          requestDate: '2025-01-20',
          notes: 'Kitchen countertop project'
        }
      ];
      setQuotes(sampleQuotes);
      localStorage.setItem('quoteHistory', JSON.stringify(sampleQuotes));
    }
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'responded':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'responded':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Quote History</h1>
          <p className="text-gray-600 mt-2">
            Track all your pricing and sample requests in one place.
          </p>
        </div>

        {quotes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes yet</h3>
              <p className="text-gray-600 mb-6">
                Start comparing products to request pricing information.
              </p>
              <Link href="/">
                <Button className="bg-royal text-white hover:bg-royal-dark">
                  Browse Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {quotes.map((quote) => (
              <Card key={quote.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {quote.productName}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {quote.category}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(quote.requestDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {quote.zipCode}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(quote.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                        {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>Customer Type: {quote.customerType}</span>
                    </div>
                    
                    {quote.responseDate && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Response received on {new Date(quote.responseDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    {quote.notes && (
                      <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                        <strong>Notes:</strong> {quote.notes}
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {quote.status === 'pending' && (
                        <Button variant="outline" size="sm">
                          Follow Up
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Having trouble with a quote request? Our team is here to help.
              </p>
              <Link href="/contact">
                <Button variant="outline">
                  Contact Support
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}