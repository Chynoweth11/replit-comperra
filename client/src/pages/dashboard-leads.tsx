import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useLocation } from 'wouter';

export default function DashboardLeads() {
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
          <h1 className="text-3xl font-bold text-gray-900">Matched Leads</h1>
          <p className="text-gray-600 mt-2">
            View personalized leads based on your ZIP code, radius, and specialty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead #1</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Kitchen renovation project</p>
              <p className="text-sm text-gray-500 mt-1">ZIP: 90210</p>
              <p className="text-sm text-gray-500">Budget: $50,000</p>
              <Button className="mt-3 w-full">View Details</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lead #2</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Bathroom flooring project</p>
              <p className="text-sm text-gray-500 mt-1">ZIP: 90211</p>
              <p className="text-sm text-gray-500">Budget: $25,000</p>
              <Button className="mt-3 w-full">View Details</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lead #3</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Commercial tile installation</p>
              <p className="text-sm text-gray-500 mt-1">ZIP: 90212</p>
              <p className="text-sm text-gray-500">Budget: $100,000</p>
              <Button className="mt-3 w-full">View Details</Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}