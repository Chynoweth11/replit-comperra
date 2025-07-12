import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Building, 
  Target, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Settings,
  RefreshCw,
  Download,
  Upload,
  Search,
  Filter,
  BarChart3,
  UserCheck,
  Clock
} from 'lucide-react';

interface SystemMetrics {
  totalVendors: number;
  activeVendors: number;
  totalCustomers: number;
  totalLeads: number;
  activeLeads: number;
  expiredLeads: number;
  avgResponseTime: number;
  conversionRate: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface VendorInfo {
  id: string;
  name: string;
  email: string;
  tier: 'free' | 'pro' | 'premium';
  status: 'active' | 'inactive' | 'suspended';
  totalReviews: number;
  rating: number;
  leadsThisWeek: number;
  weeklyLimit: number;
  joinDate: string;
  lastActive: string;
}

interface LeadInfo {
  id: string;
  customerName: string;
  material: string;
  zipCode: string;
  budget?: number;
  status: 'new' | 'active' | 'completed' | 'expired';
  matchedVendors: number;
  createdAt: string;
  intentScore: number;
}

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [vendors, setVendors] = useState<VendorInfo[]>([]);
  const [leads, setLeads] = useState<LeadInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'vendors' | 'leads' | 'settings'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch system metrics
      const metricsResponse = await fetch('/api/admin/metrics');
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData.metrics);
      }

      // Fetch vendors
      const vendorsResponse = await fetch('/api/admin/vendors');
      if (vendorsResponse.ok) {
        const vendorsData = await vendorsResponse.json();
        setVendors(vendorsData.vendors || []);
      }

      // Fetch leads
      const leadsResponse = await fetch('/api/admin/leads');
      if (leadsResponse.ok) {
        const leadsData = await leadsResponse.json();
        setLeads(leadsData.leads || []);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load system data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetWeeklyLeads = async () => {
    try {
      const response = await fetch('/api/admin/reset-weekly-leads', {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Weekly lead counts have been reset for all vendors.",
        });
        fetchSystemData();
      }
    } catch (error) {
      console.error('Error resetting weekly leads:', error);
      toast({
        title: "Error",
        description: "Failed to reset weekly lead counts.",
        variant: "destructive",
      });
    }
  };

  const handleProcessExpiredLeads = async () => {
    try {
      const response = await fetch('/api/admin/process-expired-leads', {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Expired leads have been processed.",
        });
        fetchSystemData();
      }
    } catch (error) {
      console.error('Error processing expired leads:', error);
      toast({
        title: "Error",
        description: "Failed to process expired leads.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateVendorStatus = async (vendorId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/vendor/${vendorId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Vendor status updated to ${status}.`,
        });
        fetchSystemData();
      }
    } catch (error) {
      console.error('Error updating vendor status:', error);
      toast({
        title: "Error",
        description: "Failed to update vendor status.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'new': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.zipCode.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
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
              <Settings className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">System management and analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={fetchSystemData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'vendors', label: 'Vendors', icon: Building },
            { id: 'leads', label: 'Leads', icon: Target },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {activeTab === 'overview' && metrics && (
          <div className="space-y-6">
            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${
                    metrics.systemHealth === 'healthy' ? 'bg-green-500' :
                    metrics.systemHealth === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  System Health: {metrics.systemHealth}
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Vendors</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.totalVendors}</p>
                      <p className="text-xs text-green-600">{metrics.activeVendors} active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Customers</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.totalCustomers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Target className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Leads</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.totalLeads}</p>
                      <p className="text-xs text-blue-600">{metrics.activeLeads} active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics.conversionRate}%</p>
                      <p className="text-xs text-gray-500">Avg: {metrics.avgResponseTime}h response</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="space-y-6">
            {/* Vendor Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Vendor Management</CardTitle>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search vendors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleResetWeeklyLeads} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Weekly Leads
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredVendors.map((vendor) => (
                    <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{vendor.name}</h3>
                          <Badge className={getTierColor(vendor.tier)}>
                            {vendor.tier}
                          </Badge>
                          <Badge className={getStatusColor(vendor.status)}>
                            {vendor.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>Email: {vendor.email}</div>
                          <div>Rating: {vendor.rating}/5 ({vendor.totalReviews} reviews)</div>
                          <div>Leads: {vendor.leadsThisWeek}/{vendor.weeklyLimit}</div>
                          <div>Last Active: {new Date(vendor.lastActive).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select
                          value={vendor.status}
                          onValueChange={(status) => handleUpdateVendorStatus(vendor.id, status)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="space-y-6">
            {/* Lead Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Management</CardTitle>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search leads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleProcessExpiredLeads} variant="outline">
                    <Clock className="h-4 w-4 mr-2" />
                    Process Expired Leads
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{lead.customerName}</h3>
                          <Badge className={getStatusColor(lead.status)}>
                            {lead.status}
                          </Badge>
                          <Badge variant="outline">
                            Score: {lead.intentScore}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>Material: {lead.material}</div>
                          <div>ZIP: {lead.zipCode}</div>
                          <div>Budget: {lead.budget ? `$${lead.budget.toLocaleString()}` : 'N/A'}</div>
                          <div>Matched: {lead.matchedVendors} vendors</div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Created: {new Date(lead.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={handleResetWeeklyLeads} className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Weekly Lead Counts
                  </Button>
                  <Button onClick={handleProcessExpiredLeads} className="w-full">
                    <Clock className="h-4 w-4 mr-2" />
                    Process Expired Leads
                  </Button>
                </div>
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-4">Data Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;