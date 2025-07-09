import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

interface VendorDashboardProps {
  leadCount?: number;
  productCount?: number;
  subscriptionStatus?: string;
  isActive?: boolean;
}

export default function VendorDashboard({
  leadCount = 0,
  productCount = 0,
  subscriptionStatus = "Active",
  isActive = true,
}: VendorDashboardProps) {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();

  const goToLeads = () => {
    setLocation('/vendor/leads');
  };

  const goToProducts = () => {
    setLocation('/vendor/products');
  };

  const goToSubscription = () => {
    setLocation('/vendor/subscription');
  };

  const goToSettings = () => {
    setLocation('/vendor/settings');
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
      <h1 className="text-2xl font-semibold">Welcome back, {user?.name || 'User'}!</h1>
      <p className="text-sm text-gray-600 mt-1">
        You're logged in as a <strong>Vendor</strong>.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* Product Listings */}
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold">📦 Product Listings</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage your inventory, pricing, and availability.
            </p>
            <p className="text-2xl font-bold mt-2">{productCount}</p>
            <Button className="mt-3 w-full" onClick={goToProducts}>
              Manage Products
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

      {/* Sign Out */}
      <div className="mt-4">
        <Button variant="destructive" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}