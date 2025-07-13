import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { sessionManager } from '@/utils/sessionManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  MapPin, 
  Clock, 
  DollarSign, 
  User, 
  Mail, 
  Phone, 
  Star,
  Heart,
  Ban,
  CheckCircle,
  AlertCircle,
  Home,
  LogOut,
  X,
  Users
} from 'lucide-react';
import LeadDetailModal from '@/components/LeadDetailModal';
import { ProfessionalNetwork, SubmitLeadForm } from '@/components/ProfessionalNetwork';

interface Lead {
  id: string;
  customerName: string;
  zipCode: string;
  materialCategory: string;
  projectType: string;
  budget?: number;
  timeline?: string;
  description: string;
  status: 'new' | 'active' | 'completed' | 'archived';
  createdAt: string;
  intentScore?: number;
  nonResponsiveVendors?: Array<{vendorId: string; vendorName: string}>;
}

interface UserProfile {
  fullName: string;
  email: string;
  phone?: string;
  favoriteVendors?: string[];
  blockedVendors?: string[];
}

const CustomerDashboard: React.FC = () => {
  const { userProfile, loading, signOut } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showProfessionalNetwork, setShowProfessionalNetwork] = useState(false);

  // Redirect if not authenticated or not a customer
  useEffect(() => {
    console.log('🔍 CustomerDashboard - checking authentication');
    
    // Use sessionManager for more reliable authentication
    const sessionUser = sessionManager.getSession();
    
    console.log('🔍 CustomerDashboard - sessionUser:', sessionUser);
    
    if (!sessionUser) {
      console.log('⚠️ No valid session found, redirecting to signin');
      navigate('/auth?tab=signin');
      return;
    }
    
    console.log('🔍 CustomerDashboard - user role:', sessionUser.role);
    
    // Check if user is a customer (more flexible check)
    if (sessionUser.role === 'vendor') {
      console.log('⚠️ User is a vendor, redirecting to vendor dashboard');
      navigate('/vendor-dashboard');
      return;
    } else if (sessionUser.role === 'trade') {
      console.log('⚠️ User is a trade, redirecting to trade dashboard');
      navigate('/trade-dashboard');
      return;
    }
    
    // If we reach here, user is customer or homeowner
    console.log('✅ Customer session validated:', sessionUser.email, 'role:', sessionUser.role);
    
    // Update activity timestamp
    sessionManager.updateLastActivity();
    
    // Fetch customer data
    fetchCustomerData();
  }, [navigate]);

  const fetchCustomerData = async () => {
    try {
      // Fetch leads
      const leadsResponse = await fetch('/api/customer/leads');
      if (leadsResponse.ok) {
        const leadsData = await leadsResponse.json();
        setLeads(leadsData.leads || []);
      }

      // Fetch user profile
      const profileResponse = await fetch('/api/customer/profile');
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData.profile || null);
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const leadData = {
      // Contact Information
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      customerType: formData.get('customerType') as string,
      
      // Location Information
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zip: formData.get('zip') as string,
      zipCode: formData.get('zip') as string,
      
      // Project Information
      materialCategory: formData.get('materialCategory') as string,
      projectType: formData.get('projectType') as string,
      budget: formData.get('budget') ? parseInt(formData.get('budget') as string) : undefined,
      timeline: formData.get('timeline') as string,
      projectDetails: formData.get('projectDetails') as string,
      description: formData.get('projectDetails') as string,
      message: formData.get('projectDetails') as string,
      
      // Professional Preference
      professionalType: formData.get('professionalType') as string,
      isLookingForPro: formData.get('professionalType') === 'trade' || formData.get('professionalType') === 'both',
      
      // System fields
      customerEmail: formData.get('email') as string,
      customerName: formData.get('name') as string,
      source: 'customer-dashboard'
    };

    try {
      const response = await fetch('/api/lead/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData)
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: "We're finding professionals for you and you'll see who got connected.",
        });
        setIsCreateModalOpen(false);
        fetchCustomerData(); // Refresh leads
      } else {
        throw new Error('Failed to create lead');
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        title: "Error",
        description: "Failed to create lead. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFavoriteVendor = async (vendorId: string) => {
    try {
      const response = await fetch('/api/customer/favorite-vendor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vendorId })
      });

      if (response.ok) {
        setProfile(prev => ({
          ...prev!,
          favoriteVendors: prev?.favoriteVendors?.includes(vendorId)
            ? prev.favoriteVendors.filter(id => id !== vendorId)
            : [...(prev?.favoriteVendors || []), vendorId]
        }));
        toast({
          title: "Vendor Preferences Updated",
          description: "Your favorite vendors have been updated.",
        });
      }
    } catch (error) {
      console.error('Error updating favorite vendor:', error);
      toast({
        title: "Error",
        description: "Failed to update vendor preferences.",
        variant: "destructive",
      });
    }
  };

  const handleBlockVendor = async (vendorId: string) => {
    try {
      const response = await fetch('/api/customer/block-vendor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vendorId })
      });

      if (response.ok) {
        setProfile(prev => ({
          ...prev!,
          blockedVendors: prev?.blockedVendors?.includes(vendorId)
            ? prev.blockedVendors.filter(id => id !== vendorId)
            : [...(prev?.blockedVendors || []), vendorId],
          favoriteVendors: prev?.favoriteVendors?.filter(id => id !== vendorId) || []
        }));
        toast({
          title: "Vendor Blocked",
          description: "This vendor will no longer be matched with your leads.",
        });
      }
    } catch (error) {
      console.error('Error blocking vendor:', error);
      toast({
        title: "Error",
        description: "Failed to block vendor.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="h-4 w-4" />;
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'archived': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show ProfessionalNetwork component when user wants to create a lead
  if (showProfessionalNetwork) {
    return <ProfessionalNetwork />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Home className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Customer Portal</h1>
                <p className="text-sm text-gray-500">Welcome back, {userProfile?.name || 'Customer'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => navigate('/')} variant="ghost">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button onClick={handleSignOut} variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Leads</p>
                  <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Leads</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {leads.filter(lead => lead.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Favorite Vendors</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {profile?.favoriteVendors?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Ban className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Blocked Vendors</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {profile?.blockedVendors?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leads Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">My Project Leads</h2>
          <Button onClick={() => setShowProfessionalNetwork(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Lead
          </Button>
        </div>

        {/* Leads Grid */}
        {leads.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads yet</h3>
              <p className="text-gray-500 mb-4">Create your first project lead to connect with professionals</p>
              <Button onClick={() => setShowProfessionalNetwork(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Lead
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leads.map((lead) => (
              <Card key={lead.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6" onClick={() => setSelectedLead(lead)}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{lead.materialCategory}</h3>
                      <p className="text-sm text-gray-500">{lead.projectType}</p>
                    </div>
                    <Badge className={`${getStatusColor(lead.status)} flex items-center gap-1`}>
                      {getStatusIcon(lead.status)}
                      {lead.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      ZIP {lead.zipCode}
                    </div>
                    {lead.budget && (
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        ${lead.budget.toLocaleString()}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </div>
                    
                    {/* Show matched professionals count */}
                    {lead.matchedProfessionals && lead.matchedProfessionals.length > 0 && (
                      <div className="flex items-center text-sm text-blue-600">
                        <Users className="h-4 w-4 mr-1" />
                        {lead.matchedProfessionals.length} professionals matched
                      </div>
                    )}
                  </div>
                  
                  {lead.description && (
                    <p className="text-sm text-gray-700 truncate">{lead.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      <LeadDetailModal
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        userData={profile}
        onFavorite={handleFavoriteVendor}
        onBlock={handleBlockVendor}
      />

      {/* Professional Network Modal */}
      {showProfessionalNetwork && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-full max-h-full w-full h-full overflow-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Comperra Connect</h2>
              <button
                onClick={() => setShowProfessionalNetwork(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              <SubmitLeadForm onBack={() => setShowProfessionalNetwork(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;