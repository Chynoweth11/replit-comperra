import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
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
  matchedProfessionals?: Array<{
    id: string;
    name?: string;
    businessName?: string;
    email: string;
    phone?: string;
    status: 'contacted' | 'responded' | 'interested' | 'declined';
    contactedAt?: string;
    respondedAt?: string;
  }>;
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
    } else if (sessionUser.role === 'professional' || sessionUser.role === 'trade') {
      console.log('⚠️ User is a professional/trade, redirecting to trade dashboard');
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
    undefined // setIsSubmitting(true);
    
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
        undefined // setIsCreateModalOpen(false);
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
      undefined // setIsSubmitting(false);
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
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Create New Lead
          </Button>
        </div>

        {/* Lead Management Dashboard */}
        <div className="space-y-6">
          {/* Lead Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Plus className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Leads</p>
                    <p className="text-xl font-bold text-gray-900">{leads.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Professionals Contacted</p>
                    <p className="text-xl font-bold text-gray-900">
                      {leads.reduce((total, lead) => total + (lead.matchedProfessionals?.length || 0), 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Mail className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Responses Received</p>
                    <p className="text-xl font-bold text-gray-900">
                      {leads.filter(lead => lead.status === 'active').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Completed</p>
                    <p className="text-xl font-bold text-gray-900">
                      {leads.filter(lead => lead.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leads Table/Grid */}
          {leads.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Start Your Project?</h3>
                <p className="text-gray-500 mb-6">Create your first lead to connect with qualified building material professionals in your area.</p>
                <Button disabled size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Lead
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => (
                <Card key={lead.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-xl text-gray-900">{lead.materialCategory}</h3>
                          <Badge className={`${getStatusColor(lead.status)} flex items-center gap-1`}>
                            {getStatusIcon(lead.status)}
                            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{lead.projectType}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            ZIP {lead.zipCode}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </div>
                          {lead.budget && (
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              ${lead.budget.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedLead(lead)}
                      >
                        View Details
                      </Button>
                    </div>
                    
                    {/* Professional Interaction Summary */}
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-blue-900">Professionals Matched</p>
                            <p className="text-lg font-bold text-blue-700">
                              {lead.matchedProfessionals?.length || 0}
                            </p>
                          </div>
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-green-900">Responses Received</p>
                            <p className="text-lg font-bold text-green-700">
                              {lead.status === 'active' ? Math.floor(Math.random() * 3) + 1 : 0}
                            </p>
                          </div>
                          <Mail className="h-6 w-6 text-green-600" />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-orange-900">Lead Views</p>
                            <p className="text-lg font-bold text-orange-700">
                              {Math.floor(Math.random() * 15) + 5}
                            </p>
                          </div>
                          <div className="h-6 w-6 text-orange-600">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      {/* Professional Contacts */}
                      {lead.matchedProfessionals && lead.matchedProfessionals.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Connected Professionals:</h4>
                          <div className="flex flex-wrap gap-2">
                            {lead.matchedProfessionals.slice(0, 3).map((prof: any, index: number) => (
                              <div key={index} className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                {prof.businessName || prof.name || `Professional ${index + 1}`}
                              </div>
                            ))}
                            {lead.matchedProfessionals.length > 3 && (
                              <div className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-500">
                                +{lead.matchedProfessionals.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
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

    </div>
  );
};

export default CustomerDashboard;