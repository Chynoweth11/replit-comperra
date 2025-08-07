import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useLocation } from "wouter";
import { ArrowLeft, Home, LogOut } from "lucide-react";

interface TradeDashboardProps {
  leadCount?: number;
  subscriptionStatus?: string;
  isActive?: boolean;
}

export default function TradeDashboard({
  leadCount = 0,
  subscriptionStatus = "Active",
  isActive = true,
}: TradeDashboardProps) {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();

  const goToLeads = () => {
    setLocation('/trade/leads');
  };

  const goToSubscription = () => {
    setLocation('/trade/subscription');
  };

  const goToSettings = () => {
    setLocation('/trade/settings');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setLocation('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="p-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/')}
            className="flex items-center space-x-2 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Button>
          <div className="h-6 w-px bg-gray-300"></div>
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/')}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Home className="w-5 h-5" />
            <span className="font-bold text-lg">Comperra</span>
          </Button>
        </div>
        <Button 
          variant="ghost" 
          onClick={handleSignOut}
          className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Button>
      </div>

      <h1 className="text-2xl font-semibold">Welcome back, {user?.name || 'User'}!</h1>
      <p className="text-sm text-gray-600 mt-1">
        You're logged in as a <strong>Trade Professional</strong>.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Matched Leads */}
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold">📥 Matched Leads</h2>
            <p className="text-sm text-gray-500 mt-1">
              View personalized leads based on your ZIP code, radius, and specialty.
            </p>
            <p className="text-2xl font-bold mt-2">{leadCount}</p>
            <Button className="mt-3 w-full" onClick={goToLeads}>
              View Leads
            </Button>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold">💳 Subscription</h2>
            <p className="text-sm text-gray-500 mt-1">
              Track your plan status and billing.
            </p>
            <p className="text-base font-bold mt-2">
              Status: <span className={isActive ? 'text-green-600' : 'text-red-600'}>{subscriptionStatus}</span>
            </p>
            <Button className="mt-3 w-full" onClick={goToSubscription}>
              Manage Subscription
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Account Settings */}
      <div className="mt-6">
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold">⚙️ Account Settings</h2>
            <p className="text-sm text-gray-500 mt-1">Email: {user?.email}</p>
            <Button className="mt-3 w-full" variant="secondary" onClick={goToSettings}>
              Edit Profile
            </Button>
          </CardContent>
        </Card>
      </div>


    </div>
  );
}