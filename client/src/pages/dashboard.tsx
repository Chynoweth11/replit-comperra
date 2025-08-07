import { useLocation, Link } from 'wouter';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { User, Heart, FileText, Settings, Eye, History, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const [savedComparisons, setSavedComparisons] = useState([]);
  const [quoteHistory, setQuoteHistory] = useState([]);

  useEffect(() => {
    // Debug logging
    console.log('Dashboard - Current user:', user);
    console.log('Dashboard - User role:', user?.role);
    
    // Load saved comparisons from localStorage
    const saved = localStorage.getItem('savedComparisons');
    if (saved) {
      setSavedComparisons(JSON.parse(saved));
    }

    // Load quote history from localStorage
    const quotes = localStorage.getItem('quoteHistory');
    if (quotes) {
      setQuoteHistory(JSON.parse(quotes));
    }
  }, [user, setLocation]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setLocation('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleViewComparisons = () => {
    setLocation('/compare');
  };

  const handleViewQuotes = () => {
    setLocation('/quotes');
  };

  const handleEditProfile = () => {
    setLocation('/profile');
  };

  // Professional Dashboard Component
  const ProfessionalDashboard = ({ userType, userName, leadCount, productCount, subscriptionStatus, userEmail, isActive }) => {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Welcome back, {userName}!</h1>
        <p className="text-sm text-gray-600 mt-1">
          You're logged in as a <strong>{userType === "vendor" ? "Vendor" : "Trade Professional"}</strong>.
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Matched Leads */}
          <Card className="h-full">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-2">📥 Matched Leads</h2>
              <p className="text-sm text-gray-500 mb-4">
                View personalized leads based on your ZIP code, radius, and specialty.
              </p>
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-blue-600">{leadCount}</p>
              </div>
              <Button className="w-full" onClick={() => setLocation('/dashboard/leads')}>
                View Leads
              </Button>
            </CardContent>
          </Card>

          {/* Product Listings (Only for Vendors) */}
          {userType === "vendor" && (
            <Card className="h-full">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-2">📦 Product Listings</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Manage your inventory, pricing, and availability.
                </p>
                <div className="text-center mb-4">
                  <p className="text-3xl font-bold text-green-600">{productCount}</p>
                </div>
                <Button className="w-full" onClick={() => setLocation('/dashboard/products')}>
                  Manage Products
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Subscription */}
          <Card className="h-full">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-2">💳 Subscription</h2>
              <p className="text-sm text-gray-500 mb-4">
                Track your plan status and billing.
              </p>
              <div className="text-center mb-4">
                <p className="text-lg font-bold">
                  Status: <span className={isActive ? 'text-green-600' : 'text-red-600'}>{subscriptionStatus}</span>
                </p>
              </div>
              <Button className="w-full" onClick={() => setLocation('/dashboard/subscription')}>
                Manage Subscription
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Lead Management Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-6">Lead Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* My Leads */}
            <Card className="h-full">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-blue-600 mb-3">My Leads</h3>
                <p className="text-3xl font-bold text-blue-600 mb-2">12</p>
                <p className="text-sm text-gray-500 mb-4">Active leads</p>
                <Button size="sm" className="w-full" onClick={() => setLocation('/dashboard/my-leads')}>
                  View My Leads
                </Button>
              </CardContent>
            </Card>

            {/* Current Leads */}
            <Card className="h-full">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-green-600 mb-3">Current Leads</h3>
                <p className="text-3xl font-bold text-green-600 mb-2">8</p>
                <p className="text-sm text-gray-500 mb-4">In progress</p>
                <Button size="sm" className="w-full" onClick={() => setLocation('/dashboard/current-leads')}>
                  View Current
                </Button>
              </CardContent>
            </Card>

            {/* Potential Leads */}
            <Card className="h-full">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-orange-600 mb-3">Potential Leads</h3>
                <p className="text-3xl font-bold text-orange-600 mb-2">25</p>
                <p className="text-sm text-gray-500 mb-4">Prospects</p>
                <Button size="sm" className="w-full" onClick={() => setLocation('/dashboard/potential-leads')}>
                  View Potential
                </Button>
              </CardContent>
            </Card>

            {/* Leads History */}
            <Card className="h-full">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-gray-600 mb-3">Leads History</h3>
                <p className="text-3xl font-bold text-gray-600 mb-2">47</p>
                <p className="text-sm text-gray-500 mb-4">Completed</p>
                <Button size="sm" className="w-full" onClick={() => setLocation('/dashboard/leads-history')}>
                  View History
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Account Settings */}
        <div className="mt-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-3">⚙️ Account Settings</h2>
              <p className="text-sm text-gray-500 mb-4">Email: {userEmail}</p>
              <Button className="w-full" variant="secondary" onClick={() => setLocation('/dashboard/settings')}>
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </div>


      </div>
    );
  };

  // Show sign-in prompt if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
            <p className="text-gray-600 mb-8">You need to be signed in to access your dashboard.</p>
            <div className="space-y-4">
              <Link href="/customer-login">
                <Button className="bg-royal text-white hover:bg-royal-dark mr-4">
                  Customer Login
                </Button>
              </Link>
              <Link href="/professional-login">
                <Button className="bg-royal text-white hover:bg-royal-dark">
                  Professional Login
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show role-specific dashboard content
  if (user?.role === 'vendor') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <ProfessionalDashboard
            userType="vendor"
            userName={user.name || 'User'}
            leadCount={3}
            productCount={12}
            subscriptionStatus="Active"
            userEmail={user.email}
            isActive={true}
          />
        </main>
        <Footer />
      </div>
    );
  }

  if (user?.role === 'trade') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <ProfessionalDashboard
            userType="trade"
            userName={user.name || 'User'}
            leadCount={5}
            productCount={0}
            subscriptionStatus="Active"
            userEmail={user.email}
            isActive={true}
          />
        </main>
        <Footer />
      </div>
    );
  }

  // Customer dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.displayName || user?.name || 'User'}!
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your saved comparisons, quotes, and account settings.
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Saved Comparisons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600">
                  Your saved product comparisons will appear here.
                </p>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                  {savedComparisons.length}
                </span>
              </div>
              <Button variant="outline" className="w-full" onClick={handleViewComparisons}>
                <Eye className="h-4 w-4 mr-2" />
                View All Comparisons
              </Button>
            </CardContent>
          </Card>



          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-500" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-gray-600">
                  Manage your profile and preferences.
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  {user?.email}
                </p>
              </div>
              <Button variant="outline" className="w-full" onClick={handleEditProfile}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Link href="/comparison/tiles">
                  <Button className="bg-royal text-white hover:bg-royal-dark">
                    Compare Tiles
                  </Button>
                </Link>
                <Link href="/comparison/slabs">
                  <Button className="bg-royal text-white hover:bg-royal-dark">
                    Compare Stone & Slabs
                  </Button>
                </Link>
                <Link href="/comparison/hardwood">
                  <Button className="bg-royal text-white hover:bg-royal-dark">
                    Compare Hardwood
                  </Button>
                </Link>
                <Link href="/articles">
                  <Button variant="outline">
                    Read Expert Guides
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}