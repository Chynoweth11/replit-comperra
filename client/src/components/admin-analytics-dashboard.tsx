import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  XCircle,
  BarChart3,
  Activity,
  Search,
  Filter,
  Calendar,
  Download
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface AnalyticsData {
  leads: {
    totalLeads: number;
    newLeads: number;
    activeLeads: number;
    expiredLeads: number;
    archivedLeads: number;
  };
  matches: {
    totalMatches: number;
    pendingMatches: number;
    contactedMatches: number;
    declinedMatches: number;
  };
  isProcessing: boolean;
  lastProcessed: string;
}

interface AdminAnalyticsDashboardProps {
  className?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdminAnalyticsDashboard({ className = "" }: AdminAnalyticsDashboardProps) {
  const [selectedDateRange, setSelectedDateRange] = useState('7d');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch analytics data
  const { data: analyticsData, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['/api/admin/analytics', selectedDateRange, selectedCategory],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Sample data for charts (in production, this would come from API)
  const leadTrendData = [
    { name: 'Mon', leads: 12, matches: 8 },
    { name: 'Tue', leads: 19, matches: 15 },
    { name: 'Wed', leads: 15, matches: 12 },
    { name: 'Thu', leads: 22, matches: 18 },
    { name: 'Fri', leads: 25, matches: 20 },
    { name: 'Sat', leads: 18, matches: 14 },
    { name: 'Sun', leads: 14, matches: 10 }
  ];

  const categoryData = [
    { name: 'Tiles', value: 35, color: '#0088FE' },
    { name: 'Slabs', value: 25, color: '#00C49F' },
    { name: 'Hardwood', value: 20, color: '#FFBB28' },
    { name: 'LVT', value: 15, color: '#FF8042' },
    { name: 'Heating', value: 5, color: '#8884D8' }
  ];

  const performanceMetrics = [
    { metric: 'Lead Response Rate', value: 85, target: 90, trend: 'up' },
    { metric: 'Vendor Match Rate', value: 92, target: 85, trend: 'up' },
    { metric: 'Customer Satisfaction', value: 78, target: 80, trend: 'down' },
    { metric: 'Lead Conversion Rate', value: 65, target: 70, trend: 'up' }
  ];

  const renderStatCard = (
    title: string,
    value: number,
    icon: React.ReactNode,
    color: string,
    change?: { value: number; trend: 'up' | 'down' }
  ) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value.toLocaleString()}</p>
            {change && (
              <div className={`flex items-center text-sm ${
                change.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {change.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {change.value}%
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Error loading analytics data</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Admin Analytics Dashboard</h2>
          <p className="text-gray-600">Real-time insights and system metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={selectedDateRange} 
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm">Lead Processing: Active</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm">Database: Connected</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm">Queue: {analyticsData?.leads?.newLeads || 0} pending</span>
              </div>
            </div>
            <Badge variant="outline">
              Last updated: {analyticsData?.lastProcessed ? new Date(analyticsData.lastProcessed).toLocaleTimeString() : 'N/A'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderStatCard(
          "Total Leads",
          analyticsData?.leads?.totalLeads || 0,
          <FileText className="h-6 w-6 text-white" />,
          "bg-blue-500",
          { value: 12, trend: 'up' }
        )}
        {renderStatCard(
          "Active Matches",
          analyticsData?.matches?.totalMatches || 0,
          <Users className="h-6 w-6 text-white" />,
          "bg-green-500",
          { value: 8, trend: 'up' }
        )}
        {renderStatCard(
          "Pending Leads",
          analyticsData?.leads?.newLeads || 0,
          <Clock className="h-6 w-6 text-white" />,
          "bg-yellow-500",
          { value: 5, trend: 'down' }
        )}
        {renderStatCard(
          "Expired Leads",
          analyticsData?.leads?.expiredLeads || 0,
          <XCircle className="h-6 w-6 text-white" />,
          "bg-red-500",
          { value: 3, trend: 'down' }
        )}
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead and Match Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={leadTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="leads" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="matches" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Distribution by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{metric.metric}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{metric.value}%</span>
                        {metric.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    <Progress value={metric.value} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Target: {metric.target}%</span>
                      <span className={metric.value >= metric.target ? 'text-green-600' : 'text-red-600'}>
                        {metric.value >= metric.target ? 'Above target' : 'Below target'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  Top performing vendors based on lead response and conversion rates
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((rank) => (
                    <div key={rank} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {rank}
                        </div>
                        <div>
                          <p className="font-medium">Vendor {rank}</p>
                          <p className="text-sm text-gray-600">Response Rate: {95 - rank * 5}%</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{120 - rank * 20} leads</p>
                        <p className="text-sm text-gray-600">This month</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}