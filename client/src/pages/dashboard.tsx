import { signOut } from 'firebase/auth';
import { Link } from 'wouter';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { User, Heart, FileText, Settings } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
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
              <p className="text-gray-600 mb-4">
                Your saved product comparisons will appear here.
              </p>
              <Button variant="outline" className="w-full">
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
              <p className="text-gray-600 mb-4">
                Track your pricing and sample requests.
              </p>
              <Button variant="outline" className="w-full">
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
              <p className="text-gray-600 mb-4">
                Manage your profile and preferences.
              </p>
              <Button variant="outline" className="w-full">
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