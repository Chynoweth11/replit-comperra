import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  MapPin, 
  Star, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Zap,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Gauge
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

interface SmartMatchMetrics {
  totalMatches: number;
  successRate: number;
  avgResponseTime: number;
  geographicCoverage: number;
  intentAccuracy: number;
  customerSatisfaction: number;
}

interface GeographicInsight {
  zip: string;
  leadCount: number;
  avgResponseTime: number;
  opportunity: 'high' | 'medium' | 'low';
}

interface LeadMatch {
  id: string;
  customerEmail: string;
  materialCategory: string;
  intentScore: number;
  zipCode: string;
  matchedVendors: number;
  matchedTrades: number;
  status: 'new' | 'matched' | 'contacted' | 'closed';
  createdAt: string;
}

interface SmartMatchAIEnhancedProps {
  userRole: 'vendor' | 'trade';
  userId: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const SmartMatchAIEnhanced: React.FC<SmartMatchAIEnhancedProps> = ({ userRole, userId }) => {
  const [metrics, setMetrics] = useState<SmartMatchMetrics>({
    totalMatches: 0,
    successRate: 0,
    avgResponseTime: 0,
    geographicCoverage: 0,
    intentAccuracy: 0,
    customerSatisfaction: 0
  });
  
  const [insights, setInsights] = useState<GeographicInsight[]>([]);
  const [recentMatches, setRecentMatches] = useState<LeadMatch[]>([]);
  const [leadTrends, setLeadTrends] = useState<any>({});
  const [geographicInsights, setGeographicInsights] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    fetchSmartMatchData();
    const interval = setInterval(fetchSmartMatchData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [userRole, userId]);

  const fetchSmartMatchData = async () => {
    try {
      // Fetch smart matching metrics
      const response = await fetch(`/api/smart-match/metrics?role=${userRole}&userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics || {});
        setInsights(data.insights || []);
        setRecentMatches(data.recentMatches || []);
        setLeadTrends(data.leadTrends || {});
        setGeographicInsights(data.geographicInsights || {});
      }
    } catch (error) {
      console.error('Error fetching smart match data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeMatching = async () => {
    setOptimizing(true);
    try {
      const response = await fetch('/api/smart-match/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: userRole, userId })
      });
      
      if (response.ok) {
        await fetchSmartMatchData(); // Refresh data after optimization
      }
    } catch (error) {
      console.error('Error optimizing matching:', error);
    } finally {
      setOptimizing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'matched': return 'bg-green-100 text-green-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOpportunityColor = (opportunity: string) => {
    switch (opportunity) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Generate chart data
  const dailyTrendData = leadTrends.daily?.map((value: number, index: number) => ({
    day: `Day ${index + 1}`,
    leads: value
  })) || [];

  const weeklyTrendData = leadTrends.weekly?.map((value: number, index: number) => ({
    week: `Week ${index + 1}`,
    leads: value
  })) || [];

  const categoryData = recentMatches.reduce((acc: any, match) => {
    const category = match.materialCategory || 'Other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            Smart Match AI
          </h2>
          <p className="text-gray-600">AI-powered lead matching and optimization</p>
        </div>
        <Button 
          onClick={handleOptimizeMatching}
          disabled={optimizing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {optimizing ? (
            <>
              <Activity className="w-4 h-4 mr-2 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Optimize Matching
            </>
          )}
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.successRate}%</div>
            <Progress value={metrics.successRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.totalMatches > 0 ? `${metrics.totalMatches} total matches` : 'No matches yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgResponseTime}h</div>
            <Progress value={Math.max(0, 100 - (metrics.avgResponseTime * 8))} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Industry average: 6-8 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Intent Accuracy</CardTitle>
            <Brain className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.intentAccuracy}%</div>
            <Progress value={metrics.intentAccuracy} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              AI-powered lead scoring
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geographic Coverage</CardTitle>
            <MapPin className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.geographicCoverage}</div>
            <Progress value={Math.min(100, metrics.geographicCoverage * 10)} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              ZIP codes served
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            <Star className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.customerSatisfaction}%</div>
            <Progress value={metrics.customerSatisfaction} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Based on feedback
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <Users className="w-4 h-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalMatches}</div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+12%</span> from last week
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="w-5 h-5" />
              Daily Lead Trends
            </CardTitle>
            <CardDescription>Lead volume over the past 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={dailyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="leads" stroke="#8884d8" strokeWidth={2} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Material Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Material Category Distribution
            </CardTitle>
            <CardDescription>Lead distribution by material category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Weekly Performance
            </CardTitle>
            <CardDescription>Lead performance over the past 7 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="leads" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Geographic Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Geographic Insights
            </CardTitle>
            <CardDescription>Top performing ZIP codes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {geographicInsights.topZipCodes?.map((zipData: any, index: number) => (
                <div key={zipData.zip} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">ZIP {zipData.zip}</div>
                    <div className="text-sm text-gray-600">{zipData.leads} leads</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">{zipData.conversion}</div>
                    <div className="text-xs text-gray-500">conversion</div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  No geographic data available yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Matches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent AI Matches
          </CardTitle>
          <CardDescription>Latest matches processed by the AI system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentMatches.length > 0 ? (
              recentMatches.map((match) => (
                <div key={match.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{match.customerEmail}</div>
                      <div className="text-sm text-gray-600">
                        {match.materialCategory} • ZIP {match.zipCode}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm font-medium">Intent: {match.intentScore}/10</div>
                      <div className="text-xs text-gray-500">
                        {new Date(match.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge className={getStatusColor(match.status)}>
                      {match.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent matches to display
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Recommendations
          </CardTitle>
          <CardDescription>Optimization suggestions based on your performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.successRate < 50 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Improve Response Time:</strong> Your average response time is {metrics.avgResponseTime}h. 
                  Faster responses (under 4h) increase success rates by 35%.
                </AlertDescription>
              </Alert>
            )}
            
            {metrics.geographicCoverage < 5 && (
              <Alert>
                <MapPin className="h-4 w-4" />
                <AlertDescription>
                  <strong>Expand Service Area:</strong> You're only serving {metrics.geographicCoverage} ZIP codes. 
                  Consider expanding to nearby areas for more opportunities.
                </AlertDescription>
              </Alert>
            )}

            {metrics.intentAccuracy > 90 && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Great Job!</strong> Your intent accuracy is {metrics.intentAccuracy}%. 
                  You're attracting high-quality leads.
                </AlertDescription>
              </Alert>
            )}

            {metrics.totalMatches === 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Get Started:</strong> Complete your profile and service preferences to start receiving AI-matched leads.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartMatchAIEnhanced;