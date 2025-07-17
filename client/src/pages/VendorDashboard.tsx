import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Target,
  Brain,
  ArrowLeft,
  Home,
  LogOut,
  Star,
  BarChart3
} from 'lucide-react';
import SmartMatchAI from '@/components/SmartMatchAI';
import SmartMatchAIEnhanced from '@/components/SmartMatchAIEnhanced';
import SmartMatchAISimple from '@/components/SmartMatchAISimple';
import GoogleMap from '@/components/GoogleMap';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';
import { sessionManager } from '@/utils/sessionManager';

interface LeadData {
  id: string;
  email: string;
  phone?: string;
  zipCode: string;
  materialCategory: string;
  projectType: string;
  budget?: number;
  timeline?: string;
  description: string;
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  intentScore: number;
  createdAt: string;
  lastUpdated: string;
}



const VendorDashboard: React.FC = () => {
  const { userProfile, loading, signOut } = useAuth();
  const [, navigate] = useLocation();
  const { sessionActive } = useSessionPersistence();
  const [activeTab, setActiveTab] = useState('overview');
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [subscription, setSubscription] = useState({
    planId: 'basic',
    planName: 'Basic Plan',
    price: 0,
    billingCycle: 'monthly',
    status: 'active',
    features: []
  });
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    activeLeads: 0,
    conversionRate: 0,
    responseTime: 0
  });
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');

  useEffect(() => {
    // Use sessionManager for more reliable authentication
    const sessionUser = sessionManager.getSession();
    
    if (!sessionUser) {
      console.log('⚠️ No valid session found, redirecting to signin');
      navigate('/auth?tab=signin');
      return;
    }
    
    // Check if user is a vendor
    if (sessionUser.role !== 'vendor') {
      console.log('⚠️ User is not a vendor, redirecting to appropriate dashboard');
      if (sessionUser.role === 'trade') {
        navigate('/trade-dashboard');
      } else {
        navigate('/dashboard');
      }
      return;
    }
    
    console.log('✅ Vendor session validated:', sessionUser.email);
    
    // Update activity timestamp
    sessionManager.updateLastActivity();
    
    // Fetch dashboard data
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      // Fetch leads
      const leadsResponse = await fetch('/api/vendor/leads');
      if (leadsResponse.ok) {
        const leadsData = await leadsResponse.json();
        setLeads(leadsData.leads || []);
      }

      // Fetch subscription info
      const subscriptionResponse = await fetch('/api/vendor/subscription');
      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json();
        setSubscription(subscriptionData.subscription || subscription);
      }

      // Calculate metrics
      const totalLeads = leads.length;
      const activeLeads = leads.filter(lead => lead.status === 'new' || lead.status === 'contacted').length;
      const closedLeads = leads.filter(lead => lead.status === 'closed').length;
      const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0;

      setMetrics({
        totalLeads,
        activeLeads,
        conversionRate,
        monthlyRevenue: Math.floor(Math.random() * 50000) + 10000, // Mock data
        responseTime: Math.floor(Math.random() * 24) + 1 // Mock data
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'contacted': return 'bg-yellow-500';
      case 'qualified': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getIntentColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleContactLead = (lead: any) => {
    setSelectedLead(lead);
    setContactMessage(`Hi ${lead.customerName || 'there'}, I saw your request for ${lead.materialCategory} in ${lead.zipCode}. I'd be happy to help with your project. Could we schedule a time to discuss your needs?`);
    setIsContactModalOpen(true);
  };

  const handleUpdateStatus = (lead: any) => {
    setSelectedLead(lead);
    setNewStatus(lead.status);
    setIsStatusModalOpen(true);
  };

  const handleViewDetails = (lead: any) => {
    setSelectedLead(lead);
    setIsDetailsModalOpen(true);
  };

  const submitContactMessage = async () => {
    if (!selectedLead || !contactMessage.trim()) return;
    
    try {
      const response = await fetch(`/api/vendor-lead/${selectedLead.id}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: contactMessage,
          vendorId: userProfile?.uid 
        }),
      });

      if (response.ok) {
        console.log('Contact message sent successfully');
        setIsContactModalOpen(false);
        setContactMessage('');
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error sending contact message:', error);
    }
  };

  const submitStatusUpdate = async () => {
    if (!selectedLead || !newStatus) return;
    
    try {
      const response = await fetch(`/api/vendor-lead/${selectedLead.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          vendorId: userProfile?.uid 
        }),
      });

      if (response.ok) {
        console.log('Status updated successfully');
        setIsStatusModalOpen(false);
        setNewStatus('');
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userProfile || userProfile.role !== 'vendor') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Access denied. Vendor access required.</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    console.log('VendorDashboard: Sign out button clicked');
    try {
      console.log('VendorDashboard: Attempting to sign out...');
      await signOut();
      console.log('VendorDashboard: Sign out successful');
      // Additional navigation just in case
      window.location.href = '/';
    } catch (error) {
      console.error('VendorDashboard: Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Home className="w-5 h-5" />
                <span className="font-bold text-lg">Comperra</span>
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {userProfile.brandAffiliation || 'Independent Vendor'}
              </Badge>
              <Button 
                variant="outline" 
                onClick={() => navigate('/profile')}
                className="text-sm"
              >
                Profile Settings
              </Button>
              <Button 
                variant="ghost" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSignOut();
                }}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                type="button"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Title */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome back, {userProfile.businessName || userProfile.email}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="smart-match">Smart Match AI</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalLeads}</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.activeLeads}</div>
                  <p className="text-xs text-muted-foreground">Requiring follow-up</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">+2.1% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest lead interactions and product updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leads.slice(0, 5).map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(lead.status)}`}></div>
                        <div>
                          <p className="font-medium">{lead.email}</p>
                          <p className="text-sm text-gray-600">{lead.materialCategory} • {lead.projectType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getIntentColor(lead.intentScore)}`}>
                          Intent: {lead.intentScore}/10
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Management</CardTitle>
                <CardDescription>Track and manage your customer leads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leads.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-2">Lead Locations</h4>
                      <GoogleMap leads={leads} height="300px" />
                    </div>
                  )}
                  {leads.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Leads Yet</h3>
                      <p className="text-sm text-gray-500">
                        Your customer leads will appear here once they're available.
                      </p>
                    </div>
                  ) : (
                    leads.map((lead) => (
                      <div key={lead.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Badge className={getStatusColor(lead.status)}>
                              {lead.status}
                            </Badge>
                            <span className={`font-medium ${getIntentColor(lead.intentScore)}`}>
                              Intent Score: {lead.intentScore}/10
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{lead.email}</span>
                            </div>
                            {lead.phone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{lead.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{lead.zipCode}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm"><strong>Category:</strong> {lead.materialCategory}</p>
                            <p className="text-sm"><strong>Project:</strong> {lead.projectType}</p>
                            {lead.budget && (
                              <p className="text-sm"><strong>Budget:</strong> ${lead.budget.toLocaleString()}</p>
                            )}
                            {lead.timeline && (
                              <p className="text-sm"><strong>Timeline:</strong> {lead.timeline}</p>
                            )}
                          </div>
                        </div>
                        
                        {lead.description && (
                          <div className="mt-3 p-3 bg-gray-50 rounded">
                            <p className="text-sm">{lead.description}</p>
                          </div>
                        )}
                        
                        <div className="mt-4 flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleContactLead(lead)}
                          >
                            Contact Lead
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUpdateStatus(lead)}
                          >
                            Update Status
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewDetails(lead)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>



          <TabsContent value="smart-match" className="space-y-6">
            <SmartMatchAIEnhanced userRole="vendor" userId={userProfile.uid} />
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Customer Reviews & Ratings
                </CardTitle>
                <CardDescription>Manage your customer feedback and ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Average Rating</p>
                          <p className="text-2xl font-bold">4.8</p>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Total Reviews</p>
                          <p className="text-2xl font-bold">127</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Response Rate</p>
                          <p className="text-2xl font-bold">96%</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Recent Reviews</h4>
                  {[
                    {
                      id: 1,
                      customer: "Sarah Johnson",
                      rating: 5,
                      comment: "Excellent service! Very professional and completed the project on time.",
                      date: "2 days ago",
                      project: "Kitchen Tile Installation"
                    },
                    {
                      id: 2,
                      customer: "Mike Chen",
                      rating: 4,
                      comment: "Quality work, would recommend to others.",
                      date: "1 week ago",
                      project: "Bathroom Renovation"
                    },
                    {
                      id: 3,
                      customer: "Lisa Rodriguez",
                      rating: 5,
                      comment: "Outstanding craftsmanship and attention to detail.",
                      date: "2 weeks ago",
                      project: "Hardwood Flooring"
                    }
                  ].map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {review.customer.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{review.customer}</p>
                            <p className="text-sm text-gray-600">{review.project}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-gray-500">{review.date}</p>
                        </div>
                      </div>
                      <p className="text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Performance Analytics
                </CardTitle>
                <CardDescription>Track your business performance and growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Leads This Month</p>
                          <p className="text-2xl font-bold">23</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-500" />
                      </div>
                      <p className="text-sm text-blue-600">+8% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Conversion Rate</p>
                          <p className="text-2xl font-bold">68%</p>
                        </div>
                        <Target className="h-8 w-8 text-orange-500" />
                      </div>
                      <p className="text-sm text-orange-600">+5% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Avg Response Time</p>
                          <p className="text-2xl font-bold">2.3h</p>
                        </div>
                        <Clock className="h-8 w-8 text-purple-500" />
                      </div>
                      <p className="text-sm text-purple-600">-12% from last month</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Lead Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">Lead trends chart placeholder</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Vendor Profile Management
                </CardTitle>
                <CardDescription>Manage your professional profile and service areas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Business Name</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-md"
                        placeholder="Your business name"
                        defaultValue="Luxury Surfaces Group"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address</label>
                      <input
                        type="email"
                        className="w-full p-2 border rounded-md"
                        placeholder="Your email address"
                        defaultValue="ochynoweth@luxsurfacesgroup.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number</label>
                      <input
                        type="tel"
                        className="w-full p-2 border rounded-md"
                        placeholder="Your phone number"
                        defaultValue="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Service Radius</label>
                      <div className="w-full p-2 border rounded-md bg-gray-100">
                        <span className="text-gray-700">50 miles (fixed)</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Service radius is fixed at 50 miles for all professionals</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Material Specialties</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {['Tiles', 'Stone & Slabs', 'Hardwood', 'Vinyl & LVT', 'Carpet', 'Heating Systems'].map((material) => (
                        <label key={material} className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" defaultChecked />
                          <span className="text-sm">{material}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Service Areas (ZIP Codes)</label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        className="w-full p-2 border rounded-md"
                        placeholder="Primary ZIP code (e.g., 90210)"
                        defaultValue="90210"
                        maxLength={5}
                      />
                      <input
                        type="text"
                        className="w-full p-2 border rounded-md"
                        placeholder="Secondary ZIP code (e.g., 90211)"
                        defaultValue="90211"
                        maxLength={5}
                      />
                      <p className="text-xs text-gray-500">
                        Maximum 2 ZIP codes allowed. Each ZIP code covers a 50-mile radius.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">About Your Business</label>
                    <div
                      contentEditable
                      className="w-full p-2 border rounded-md min-h-[100px] bg-white"
                      style={{ 
                        textAlign: 'left', 
                        direction: 'ltr',
                        unicodeBidi: 'bidi-override',
                        writingMode: 'lr-tb',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}
                      onInput={(e) => {
                        setBusinessDescription(e.currentTarget.textContent || '');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const selection = window.getSelection();
                          const range = selection?.getRangeAt(0);
                          if (range) {
                            range.deleteContents();
                            range.insertNode(document.createTextNode('\n'));
                            range.collapse(false);
                            selection?.removeAllRanges();
                            selection?.addRange(range);
                          }
                        }
                      }}
                      suppressContentEditableWarning={true}
                    >
                      {businessDescription || 'Tell customers about your expertise and services'}
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Save Profile
                    </Button>
                    <Button variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            {/* Current Subscription Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Current Subscription
                </CardTitle>
                <CardDescription>Your active subscription plan and features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-lg border-2 border-emerald-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-emerald-800">{subscription.planName}</h3>
                      <p className="text-emerald-600 capitalize">{subscription.billingCycle} billing</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-emerald-800">
                        ${subscription.price}
                        <span className="text-sm font-normal">
                          /{subscription.billingCycle === 'yearly' ? 'yr' : 'mo'}
                        </span>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        {subscription.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-emerald-800">Included Features:</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {subscription.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm text-emerald-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-6 flex gap-4">
                    <Button variant="outline" className="flex-1">
                      Manage Subscription
                    </Button>
                    <Button variant="outline" className="flex-1">
                      View Billing History
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Available Plans */}
            <Card>
              <CardHeader>
                <CardTitle>Available Plans</CardTitle>
                <CardDescription>Upgrade or change your subscription plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Pay-as-you-go Plan */}
                  <div className={`border rounded-lg p-6 text-center ${subscription.planId === 'pay-as-you-go' ? 'border-blue-500 bg-blue-50' : ''}`}>
                    <h3 className="text-lg font-semibold mb-3">Pay-as-you-go</h3>
                    <div className="text-3xl font-bold mb-4">$15<span className="text-sm font-normal">/lead</span></div>
                    <p className="text-sm text-gray-600 mb-6">For single projects or leads.</p>
                    <ul className="text-sm space-y-3 mb-8 text-left">
                      <li className="flex items-center"><span className="text-gray-500 mr-2">•</span> One-time payment</li>
                      <li className="flex items-center"><span className="text-gray-500 mr-2">•</span> Standard feature access</li>
                      <li className="flex items-center"><span className="text-gray-500 mr-2">•</span> 50 mile matching radius</li>
                      <li className="flex items-center"><span className="text-gray-500 mr-2">•</span> Limited support or visibility</li>
                    </ul>
                    <Button className="w-full" variant={subscription.planId === 'pay-as-you-go' ? 'outline' : 'default'}>
                      {subscription.planId === 'pay-as-you-go' ? 'Current Plan' : 'Get Started'}
                    </Button>
                  </div>

                  {/* Pro Plan Monthly */}
                  <div className={`border-2 border-indigo-500 rounded-lg p-6 text-center relative ${subscription.planId === 'pro-monthly' ? 'bg-indigo-50' : ''}`}>
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-medium">Most Popular</span>
                    </div>
                    <div className="mt-2">
                      <h3 className="text-lg font-semibold mb-3">Pro Plan</h3>
                      <div className="text-3xl font-bold mb-4">$49<span className="text-sm font-normal">/mo</span></div>
                      <p className="text-sm text-gray-600 mb-6">For professionals and small teams.</p>
                      <ul className="text-sm space-y-3 mb-8 text-left">
                        <li className="flex items-center"><span className="text-indigo-500 mr-2">•</span> All Pro features</li>
                        <li className="flex items-center"><span className="text-indigo-500 mr-2">•</span> Priority Support</li>
                        <li className="flex items-center"><span className="text-indigo-500 mr-2">•</span> 50 mile matching radius</li>
                        <li className="flex items-center"><span className="text-indigo-500 mr-2">•</span> Unlimited lead claims</li>
                      </ul>
                      <Button className="w-full" variant={subscription.planId === 'pro-monthly' ? 'outline' : 'default'}>
                        {subscription.planId === 'pro-monthly' ? 'Current Plan' : 'Upgrade Now'}
                      </Button>
                    </div>
                  </div>

                  {/* Pro Plan Yearly */}
                  <div className={`border-2 border-emerald-500 rounded-lg p-6 text-center relative ${subscription.planId === 'pro-yearly' ? 'bg-emerald-50' : ''}`}>
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        {subscription.planId === 'pro-yearly' ? 'Your Plan' : 'Save 15%'}
                      </span>
                    </div>
                    <div className="mt-2">
                      <h3 className="text-lg font-semibold mb-3">Pro Plan</h3>
                      <div className="text-3xl font-bold mb-4">$490<span className="text-sm font-normal">/yr</span></div>
                      <p className="text-sm text-gray-600 mb-6">Best value for long-term projects.</p>
                      <ul className="text-sm space-y-3 mb-8 text-left">
                        <li className="flex items-center"><span className="text-emerald-500 mr-2">•</span> All Pro features</li>
                        <li className="flex items-center"><span className="text-emerald-500 mr-2">•</span> Priority Support</li>
                        <li className="flex items-center"><span className="text-emerald-500 mr-2">•</span> 50 mile matching radius</li>
                        <li className="flex items-center"><span className="text-emerald-500 mr-2">•</span> Advanced analytics</li>
                      </ul>
                      <Button className="w-full" variant={subscription.planId === 'pro-yearly' ? 'outline' : 'default'}>
                        {subscription.planId === 'pro-yearly' ? 'Current Plan' : 'Contact Sales'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Contact Lead Modal */}
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Lead</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedLead && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm"><strong>Customer:</strong> {selectedLead.customerName || selectedLead.email}</p>
                <p className="text-sm"><strong>Project:</strong> {selectedLead.materialCategory} • {selectedLead.zipCode}</p>
              </div>
            )}
            <div>
              <label htmlFor="contactMessage" className="block text-sm font-medium mb-2">
                Your Message
              </label>
              <textarea
                id="contactMessage"
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Write your message to the customer..."
                className="w-full p-3 border border-gray-300 rounded-md resize-none"
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsContactModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={submitContactMessage}
                className="flex-1"
                disabled={!contactMessage.trim()}
              >
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Status Modal */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Lead Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedLead && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm"><strong>Customer:</strong> {selectedLead.customerName || selectedLead.email}</p>
                <p className="text-sm"><strong>Current Status:</strong> {selectedLead.status}</p>
              </div>
            )}
            <div>
              <label htmlFor="newStatus" className="block text-sm font-medium mb-2">
                New Status
              </label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal-sent">Proposal Sent</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsStatusModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={submitStatusUpdate}
                className="flex-1"
                disabled={!newStatus}
              >
                Update Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Customer Information</h4>
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Name:</strong> {selectedLead.customerName || 'Not provided'}</p>
                    <p className="text-sm"><strong>Email:</strong> {selectedLead.email}</p>
                    <p className="text-sm"><strong>Phone:</strong> {selectedLead.phone || 'Not provided'}</p>
                    <p className="text-sm"><strong>Location:</strong> {selectedLead.zipCode}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Project Details</h4>
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Category:</strong> {selectedLead.materialCategory}</p>
                    <p className="text-sm"><strong>Project Type:</strong> {selectedLead.projectType}</p>
                    <p className="text-sm"><strong>Budget:</strong> {selectedLead.budget ? `$${selectedLead.budget.toLocaleString()}` : 'Not specified'}</p>
                    <p className="text-sm"><strong>Timeline:</strong> {selectedLead.timeline || 'Not specified'}</p>
                    <p className="text-sm"><strong>Intent Score:</strong> <span className={getIntentColor(selectedLead.intentScore)}>{selectedLead.intentScore}/10</span></p>
                  </div>
                </div>
              </div>
              
              {selectedLead.description && (
                <div className="space-y-2">
                  <h4 className="font-medium">Project Description</h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{selectedLead.description}</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <h4 className="font-medium">Lead Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <p className="text-sm"><strong>Status:</strong> {selectedLead.status}</p>
                  <p className="text-sm"><strong>Created:</strong> {new Date(selectedLead.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm"><strong>Customer Type:</strong> {selectedLead.customerType || 'Not specified'}</p>
                  <p className="text-sm"><strong>Source:</strong> {selectedLead.source || 'Direct'}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorDashboard;