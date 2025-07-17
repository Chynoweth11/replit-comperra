import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Wrench, 
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
  Star,
  Brain,
  ArrowLeft,
  Home,
  LogOut
} from 'lucide-react';
import SmartMatchAI from '@/components/SmartMatchAI';
import SmartMatchAIEnhanced from '@/components/SmartMatchAIEnhanced';
import GoogleMap from '@/components/GoogleMap';

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
  status: 'new' | 'contacted' | 'quoted' | 'won' | 'lost';
  intentScore: number;
  createdAt: string;
  lastUpdated: string;
}

const TradeDashboard: React.FC = () => {
  const { userProfile, loading, signOut } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    activeLeads: 0,
    conversionRate: 0,
    monthlyRevenue: 0,
    responseTime: 0,
    customerRating: 0
  });

  useEffect(() => {
    if (!loading && (!userProfile || userProfile.role !== 'trade')) {
      navigate('/');
      return;
    }
    
    if (userProfile) {
      fetchDashboardData();
    }
  }, [userProfile, loading, navigate]);

  const fetchDashboardData = async () => {
    try {
      // Fetch leads
      const leadsResponse = await fetch('/api/trade/leads');
      if (leadsResponse.ok) {
        const leadsData = await leadsResponse.json();
        setLeads(leadsData.leads || []);
      }

      // Calculate metrics
      const totalLeads = leads.length;
      const activeLeads = leads.filter(lead => lead.status === 'new' || lead.status === 'contacted').length;
      const wonLeads = leads.filter(lead => lead.status === 'won').length;
      const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

      setMetrics({
        totalLeads,
        activeLeads,
        conversionRate,
        monthlyRevenue: Math.floor(Math.random() * 75000) + 15000, // Mock data
        responseTime: Math.floor(Math.random() * 8) + 1, // Mock data
        customerRating: 4.8 // Mock data
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'contacted': return 'bg-yellow-500';
      case 'quoted': return 'bg-purple-500';
      case 'won': return 'bg-green-500';
      case 'lost': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getIntentColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
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

  if (!userProfile || userProfile.role !== 'trade') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Access denied. Trade professional access required.</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    console.log('TradeDashboard: Sign out button clicked');
    try {
      console.log('TradeDashboard: Attempting to sign out...');
      await signOut();
      console.log('TradeDashboard: Sign out successful');
      // Additional navigation just in case
      window.location.href = '/';
    } catch (error) {
      console.error('TradeDashboard: Error signing out:', error);
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
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {userProfile.specialty || 'General Contractor'}
              </Badge>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{metrics.customerRating}</span>
              </div>
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
          <h1 className="text-2xl font-bold text-gray-900">Trade Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome back, {userProfile.name || userProfile.email}</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalLeads}</div>
                  <p className="text-xs text-muted-foreground">+15% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.activeLeads}</div>
                  <p className="text-xs text-muted-foreground">Requiring attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">+3.2% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.responseTime}h</div>
                  <p className="text-xs text-muted-foreground">Industry avg: 6-8 hours</p>
                </CardContent>
              </Card>
            </div>

            {/* Service Area & Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Area</CardTitle>
                  <CardDescription>Your current service coverage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Service Radius</span>
                      <span className="text-sm font-medium">{userProfile.serviceRadius || 50} miles</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Primary ZIP</span>
                      <span className="text-sm font-medium">{userProfile.zipCode || 'Not set'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Response Time</span>
                      <span className="text-sm font-medium">{metrics.responseTime} hours avg</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Customer Rating</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{metrics.customerRating}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Your monthly performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Leads Converted</span>
                        <span>{Math.floor(metrics.conversionRate)}%</span>
                      </div>
                      <Progress value={metrics.conversionRate} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Response Time Goal</span>
                        <span>{metrics.responseTime <= 4 ? 'Excellent' : 'Good'}</span>
                      </div>
                      <Progress value={metrics.responseTime <= 4 ? 100 : 75} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Customer Satisfaction</span>
                        <span>{metrics.customerRating}/5.0</span>
                      </div>
                      <Progress value={(metrics.customerRating / 5) * 100} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest project inquiries and updates</CardDescription>
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
                <CardTitle>Project Leads</CardTitle>
                <CardDescription>Track and manage your customer project leads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leads.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-2">Project Locations</h4>
                      <GoogleMap leads={leads} height="300px" />
                    </div>
                  )}
                  {leads.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Yet</h3>
                      <p className="text-sm text-gray-500">
                        Your project leads will appear here once they're available.
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
                          <Button size="sm" variant="outline">
                            Contact Customer
                          </Button>
                          <Button size="sm" variant="outline">
                            Send Quote
                          </Button>
                          <Button size="sm" variant="outline">
                            Update Status
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
            <SmartMatchAIEnhanced userRole="trade" userId={userProfile.uid} />
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
                <CardDescription>Manage your reviews and customer feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-500">4.8</div>
                      <div className="flex justify-center space-x-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Average Rating</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">47</div>
                      <p className="text-sm text-gray-600">Total Reviews</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">96%</div>
                      <p className="text-sm text-gray-600">Positive Reviews</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-4">Recent Reviews</h4>
                    <div className="space-y-4">
                      {[
                        {
                          customer: "Sarah Johnson",
                          rating: 5,
                          date: "2 days ago",
                          comment: "Excellent work on our kitchen renovation. Very professional and completed on time.",
                          project: "Kitchen Renovation"
                        },
                        {
                          customer: "Mike Chen",
                          rating: 4,
                          date: "1 week ago",
                          comment: "Quality work and good communication throughout the project.",
                          project: "Bathroom Remodel"
                        },
                        {
                          customer: "Lisa Rodriguez",
                          rating: 5,
                          date: "2 weeks ago",
                          comment: "Outstanding craftsmanship and attention to detail. Highly recommend!",
                          project: "Hardwood Installation"
                        }
                      ].map((review, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{review.customer}</span>
                              <div className="flex space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                          <p className="text-xs text-gray-500">Project: {review.project}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>Track your business performance and growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Leads This Month</p>
                          <p className="text-2xl font-bold">18</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-500" />
                      </div>
                      <p className="text-sm text-blue-600">+12% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Conversion Rate</p>
                          <p className="text-2xl font-bold">72%</p>
                        </div>
                        <Target className="h-8 w-8 text-orange-500" />
                      </div>
                      <p className="text-sm text-orange-600">+8% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Avg Response Time</p>
                          <p className="text-2xl font-bold">1.8h</p>
                        </div>
                        <Clock className="h-8 w-8 text-purple-500" />
                      </div>
                      <p className="text-sm text-purple-600">-18% from last month</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trade Profile Management</CardTitle>
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
                        defaultValue="Professional Trade Services"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address</label>
                      <input
                        type="email"
                        className="w-full p-2 border rounded-md"
                        placeholder="Your email address"
                        defaultValue="tradepro@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number</label>
                      <input
                        type="tel"
                        className="w-full p-2 border rounded-md"
                        placeholder="Your phone number"
                        defaultValue="(555) 987-6543"
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
                    <label className="block text-sm font-medium mb-2">Trade Specialties</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {['Plumbing', 'Electrical', 'HVAC', 'Carpentry', 'Painting', 'Flooring', 'Roofing', 'Drywall', 'Tiling'].map((specialty) => (
                        <label key={specialty} className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" defaultChecked={['Plumbing', 'HVAC', 'Flooring'].includes(specialty)} />
                          <span className="text-sm">{specialty}</span>
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
                    <label className="block text-sm font-medium mb-2">Years of Experience</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded-md"
                      placeholder="Years of experience"
                      defaultValue="8"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Certifications</label>
                    <textarea
                      className="w-full p-2 border rounded-md"
                      rows={3}
                      placeholder="List your certifications and licenses"
                      defaultValue="Licensed Contractor, HVAC Certified, Plumbing License #12345"
                      dir="ltr"
                      style={{ textAlign: 'left', direction: 'ltr' }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">About Your Business</label>
                    <textarea
                      className="w-full p-2 border rounded-md"
                      rows={4}
                      placeholder="Tell customers about your expertise and services"
                      defaultValue=""
                      dir="ltr"
                      style={{ 
                        textAlign: 'left', 
                        direction: 'ltr',
                        unicodeBidi: 'embed',
                        writingMode: 'lr-tb'
                      }}
                      onFocus={(e) => {
                        e.target.style.direction = 'ltr';
                        e.target.setAttribute('dir', 'ltr');
                      }}
                      onInput={(e) => {
                        e.target.style.direction = 'ltr';
                      }}
                    />
                  </div>
                  
                  <Button className="w-full">Save Profile Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Plans</CardTitle>
                <CardDescription>Choose the right plan for your trade business</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Pay-as-you-go Plan */}
                  <div className="border rounded-lg p-6 text-center">
                    <h3 className="text-lg font-semibold mb-3">Pay-as-you-go</h3>
                    <div className="text-3xl font-bold mb-4">$15<span className="text-sm font-normal">/lead</span></div>
                    <p className="text-sm text-gray-600 mb-6">For single projects or leads.</p>
                    <ul className="text-sm space-y-3 mb-8 text-left">
                      <li className="flex items-center"><span className="text-gray-500 mr-2">•</span> One-time payment</li>
                      <li className="flex items-center"><span className="text-gray-500 mr-2">•</span> Standard feature access</li>
                      <li className="flex items-center"><span className="text-gray-500 mr-2">•</span> 50 mile matching radius</li>
                      <li className="flex items-center"><span className="text-gray-500 mr-2">•</span> Limited support or visibility</li>
                    </ul>
                    <Button className="w-full">Get Started</Button>
                  </div>

                  {/* Pro Plan Monthly */}
                  <div className="border-2 border-indigo-500 rounded-lg p-6 text-center relative">
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
                      <Button className="w-full">Upgrade Now</Button>
                    </div>
                  </div>

                  {/* Pro Plan Yearly */}
                  <div className="border-2 border-emerald-500 rounded-lg p-6 text-center relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium">Save 15%</span>
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
                      <Button className="w-full">Contact Sales</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TradeDashboard;