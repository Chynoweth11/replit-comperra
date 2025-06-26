import { signOut } from 'firebase/auth';
import { Link, useLocation } from 'wouter';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { User, Heart, FileText, Settings, Eye, History, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [savedComparisons, setSavedComparisons] = useState([]);
  const [quoteHistory, setQuoteHistory] = useState([]);

  useEffect(() => {
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
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.displayName || 'User'}!
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <FileText className="h-5 w-5 text-blue-500" />
                Quote Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600">
                  Track your pricing and sample requests.
                </p>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                  {quoteHistory.length}
                </span>
              </div>
              <Button variant="outline" className="w-full" onClick={handleViewQuotes}>
                <History className="h-4 w-4 mr-2" />
                View Quote History
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