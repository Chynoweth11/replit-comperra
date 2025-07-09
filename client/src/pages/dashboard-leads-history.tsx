import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useLocation } from 'wouter';
import { MapPin, Calendar, DollarSign, Eye, CheckCircle, XCircle } from 'lucide-react';

export default function DashboardLeadsHistory() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="outline" onClick={() => setLocation('/dashboard')}>
            ← Back to Dashboard
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Leads History</h1>
          <p className="text-gray-600 mt-2">
            View completed and past lead interactions.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle>Residential Kitchen Remodel</CardTitle>
                <div className="flex gap-2">
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Brentwood, CA 90049</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Completed: Dec 2024</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Final: $89,500</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-green-600">✓ Paid</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Complete kitchen renovation with quartz countertops, subway tile backsplash, and luxury vinyl flooring. Project completed on time and within budget.
              </p>
              <div className="flex gap-2">
                <Button size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button size="sm" variant="outline">
                  Download Invoice
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle>Office Building Bathroom Upgrade</CardTitle>
                <div className="flex gap-2">
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Century City, CA 90067</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Completed: Nov 2024</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Final: $125,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-green-600">✓ Paid</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Commercial bathroom renovation for 3-story office building. Installed porcelain tile floors and walls. Client was very satisfied with results.
              </p>
              <div className="flex gap-2">
                <Button size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button size="sm" variant="outline">
                  Download Invoice
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle>Retail Store Flooring</CardTitle>
                <div className="flex gap-2">
                  <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">West Hollywood, CA 90069</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Cancelled: Oct 2024</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Quote: $65,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">No charge</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Boutique retail store flooring project. Client decided to postpone renovation indefinitely due to budget constraints.
              </p>
              <div className="flex gap-2">
                <Button size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle>Luxury Home Pool Deck</CardTitle>
                <div className="flex gap-2">
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Calabasas, CA 91302</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Completed: Sep 2024</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Final: $175,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-green-600">✓ Paid</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Premium pool deck renovation with natural stone coping and slip-resistant decking. Client provided excellent review and referral.
              </p>
              <div className="flex gap-2">
                <Button size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button size="sm" variant="outline">
                  Download Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}