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
  Package, 
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
  Brain
} from 'lucide-react';
import SmartMatchAI from '@/components/SmartMatchAI';

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

interface ProductData {
  id: string;
  name: string;
  category: string;
  price: string;
  views: number;
  inquiries: number;
  lastUpdated: string;
}

const VendorDashboard: React.FC = () => {
  const { userProfile, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    activeLeads: 0,
    conversionRate: 0,
    monthlyRevenue: 0,
    responseTime: 0
  });

  useEffect(() => {
    if (!loading && (!userProfile || userProfile.role !== 'vendor')) {
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
      const leadsResponse = await fetch('/api/vendor/leads');
      if (leadsResponse.ok) {
        const leadsData = await leadsResponse.json();
        setLeads(leadsData.leads || []);
      }

      // Fetch products
      const productsResponse = await fetch('/api/vendor/products');
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData.products || []);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {userProfile.businessName || userProfile.email}</p>
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
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="smart-match">Smart Match AI</TabsTrigger>
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

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${metrics.monthlyRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+8.3% from last month</p>
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
                  {leads.map((lead) => (
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
                          Contact Lead
                        </Button>
                        <Button size="sm" variant="outline">
                          Update Status
                        </Button>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Management</CardTitle>
                <CardDescription>Manage your product listings and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Total Products: {products.length}</p>
                    </div>
                    <Button>Add New Product</Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <Card key={product.id}>
                        <CardHeader>
                          <CardTitle className="text-sm">{product.name}</CardTitle>
                          <CardDescription>{product.category}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Price:</span>
                              <span className="text-sm font-medium">{product.price}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Views:</span>
                              <span className="text-sm">{product.views}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Inquiries:</span>
                              <span className="text-sm">{product.inquiries}</span>
                            </div>
                          </div>
                          <div className="mt-4 flex space-x-2">
                            <Button size="sm" variant="outline">Edit</Button>
                            <Button size="sm" variant="outline">View</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="smart-match" className="space-y-6">
            <SmartMatchAI userRole="vendor" userId={userProfile.uid} />
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Management</CardTitle>
                <CardDescription>Manage your Comperra vendor subscription</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Professional Plan</h3>
                      <p className="text-sm text-gray-600">Full access to vendor features</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">$299/month</p>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Plan Features</h4>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Unlimited product listings</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Priority lead matching</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Advanced analytics</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Custom branding</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Usage This Month</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Leads Generated</span>
                            <span>{metrics.totalLeads}/100</span>
                          </div>
                          <Progress value={(metrics.totalLeads / 100) * 100} />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Product Views</span>
                            <span>2,847/10,000</span>
                          </div>
                          <Progress value={28.47} />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button variant="outline">Change Plan</Button>
                    <Button variant="outline">View Billing</Button>
                    <Button variant="outline">Cancel Subscription</Button>
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

export default VendorDashboard;