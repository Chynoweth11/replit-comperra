import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { User, Building, MapPin, Phone, Mail } from 'lucide-react';

export default function DashboardSettings() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="outline" onClick={() => setLocation('/dashboard')}>
            ← Back to Dashboard
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your profile and preferences.
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={user?.name || 'Professional User'} />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue={user?.email || ''} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="(555) 123-4567" />
                </div>
                <div>
                  <Label htmlFor="role">Account Type</Label>
                  <Input 
                    id="role" 
                    value={user?.role === 'vendor' ? 'Vendor/Supplier' : user?.role === 'trade' ? 'Trade Professional' : user?.role || 'Customer'} 
                    disabled 
                    className="bg-gray-100"
                  />
                  {(user?.role === 'vendor' || user?.role === 'trade') && (
                    <p className="text-xs text-orange-600 mt-1 font-medium">
                      🔒 Account type is locked and cannot be changed.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input id="company" placeholder="Your Company Name" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="license">License Number</Label>
                  <Input id="license" placeholder="License #" />
                </div>
                <div>
                  <Label htmlFor="specialty">Specialty</Label>
                  <Input id="specialty" placeholder="Tile Installation, Flooring, etc." />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Business Address</Label>
                <Input id="address" placeholder="123 Main St, City, State 12345" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Service Area
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zip">Primary ZIP Code</Label>
                  <Input id="zip" placeholder="12345" />
                </div>
                <div>
                  <Label htmlFor="radius">Service Radius (miles)</Label>
                  <Input id="radius" type="number" placeholder="25" />
                </div>
              </div>
              <div>
                <Label htmlFor="additional-areas">Additional Service Areas</Label>
                <Input id="additional-areas" placeholder="ZIP codes or cities (comma separated)" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button variant="outline">
              Cancel
            </Button>
            <Button>
              Save Changes
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}