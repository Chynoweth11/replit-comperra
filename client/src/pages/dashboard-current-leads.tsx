import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useLocation } from 'wouter';
import { MapPin, Calendar, DollarSign, Eye, Clock } from 'lucide-react';

export default function DashboardCurrentLeads() {
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
          <h1 className="text-3xl font-bold text-gray-900">Current Leads</h1>
          <p className="text-gray-600 mt-2">
            Leads currently in progress with active engagement.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle>Luxury Condo Renovation</CardTitle>
                <Badge className="bg-orange-100 text-orange-800">Negotiating</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Manhattan Beach, CA 90266</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Start: March 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Budget: $125,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Response: 2 days ago</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                High-end condo renovation including marble countertops, porcelain flooring, and custom backsplash. Customer is reviewing our proposal.
              </p>
              <div className="flex gap-2">
                <Button size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button size="sm" variant="outline">
                  Follow Up
                </Button>
                <Button size="sm" variant="outline">
                  Update Quote
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle>Restaurant Kitchen Flooring</CardTitle>
                <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Culver City, CA 90232</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Start: February 15, 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Budget: $85,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Confirmed: 1 day ago</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Commercial kitchen flooring project with slip-resistant tiles. Site visit scheduled for next week. Materials ordered and delivery confirmed.
              </p>
              <div className="flex gap-2">
                <Button size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button size="sm" variant="outline">
                  View Schedule
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle>Residential Bathroom Remodel</CardTitle>
                <Badge className="bg-yellow-100 text-yellow-800">Awaiting Response</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Pasadena, CA 91101</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Start: April 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Budget: $45,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Quote sent: 5 days ago</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Master bathroom renovation with custom tile work. Sent detailed proposal with material samples. Customer requested time to review.
              </p>
              <div className="flex gap-2">
                <Button size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button size="sm" variant="outline">
                  Follow Up
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