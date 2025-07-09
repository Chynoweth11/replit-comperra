import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useLocation } from 'wouter';
import { CreditCard, Calendar, Check, AlertCircle } from 'lucide-react';

export default function DashboardSubscription() {
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
          <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600 mt-2">
            Track your plan status and billing information.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Plan Type</span>
                  <span className="text-lg font-bold text-green-600">Professional</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <span className="flex items-center gap-1 text-green-600">
                    <Check className="h-4 w-4" />
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Monthly Cost</span>
                  <span className="text-lg font-semibold">$99.99</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Next Billing</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Jan 15, 2025
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plan Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Unlimited lead access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Advanced analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Priority support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Product management tools</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Custom branding</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">December 2024</p>
                    <p className="text-sm text-gray-500">Professional Plan</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">$99.99</p>
                    <p className="text-sm text-green-600">Paid</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">November 2024</p>
                    <p className="text-sm text-gray-500">Professional Plan</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">$99.99</p>
                    <p className="text-sm text-green-600">Paid</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">October 2024</p>
                    <p className="text-sm text-gray-500">Professional Plan</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">$99.99</p>
                    <p className="text-sm text-green-600">Paid</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex gap-4">
          <Button variant="outline">
            Change Plan
          </Button>
          <Button variant="outline">
            Update Payment Method
          </Button>
          <Button variant="destructive">
            Cancel Subscription
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}