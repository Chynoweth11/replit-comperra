import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useLocation } from 'wouter';
import { MapPin, Calendar, DollarSign, Eye, TrendingUp, Star } from 'lucide-react';

export default function DashboardPotentialLeads() {
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
          <h1 className="text-3xl font-bold text-gray-900">Potential Leads</h1>
          <p className="text-gray-600 mt-2">
            Prospects and opportunities that match your expertise.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle>Office Building Lobby Renovation</CardTitle>
                <div className="flex gap-2">
                  <Badge className="bg-green-100 text-green-800">High Match</Badge>
                  <Badge variant="outline">Commercial</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Downtown LA, CA 90013</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Timeline: Q2 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Budget: $200,000+</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Score: 9.2/10</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Premium office building seeking high-end marble and granite installation for lobby renovation. Looking for experienced commercial contractor with portfolio.
              </p>
              <div className="flex gap-2">
                <Button size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button size="sm" variant="outline">
                  Express Interest
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle>Luxury Home Pool Area</CardTitle>
                <div className="flex gap-2">
                  <Badge className="bg-blue-100 text-blue-800">Good Match</Badge>
                  <Badge variant="outline">Residential</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Malibu, CA 90265</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Timeline: Summer 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Budget: $150,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Score: 8.5/10</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                High-end residential pool area renovation including deck, coping, and waterline tile. Client values quality and has flexible timeline.
              </p>
              <div className="flex gap-2">
                <Button size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button size="sm" variant="outline">
                  Express Interest
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle>Multi-Unit Apartment Complex</CardTitle>
                <div className="flex gap-2">
                  <Badge className="bg-purple-100 text-purple-800">Large Project</Badge>
                  <Badge variant="outline">Multi-Family</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Van Nuys, CA 91401</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Timeline: 6 months</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Budget: $500,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Score: 7.8/10</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Large-scale apartment complex renovation project. 48 units requiring bathroom and kitchen flooring updates. Long-term partnership opportunity.
              </p>
              <div className="flex gap-2">
                <Button size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button size="sm" variant="outline">
                  Express Interest
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle>Retail Store Renovation</CardTitle>
                <div className="flex gap-2">
                  <Badge className="bg-orange-100 text-orange-800">Urgent</Badge>
                  <Badge variant="outline">Retail</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Beverly Hills, CA 90210</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Timeline: ASAP</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Budget: $75,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Score: 8.9/10</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Luxury retail store needs quick turnaround on flooring replacement. Premium materials required. Client has urgent timeline due to grand opening.
              </p>
              <div className="flex gap-2">
                <Button size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button size="sm" variant="outline">
                  Express Interest
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