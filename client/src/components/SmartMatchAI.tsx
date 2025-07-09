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
  Zap
} from 'lucide-react';

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

interface SmartMatchAIProps {
  userRole: 'vendor' | 'trade';
  userId: string;
}

export const SmartMatchAI: React.FC<SmartMatchAIProps> = ({ userRole, userId }) => {
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
      }
    } catch (error) {
      console.error('Error fetching smart match data:', error);
    } finally {
      setLoading(false);
    }
  };

  const optimizeMatching = async () => {
    setOptimizing(true);
    try {
      const response = await fetch('/api/smart-match/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userRole,
          userId,
          optimizationGoals: ['response_time', 'geographic_coverage', 'intent_accuracy']
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Optimization complete:', result);
        await fetchSmartMatchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error optimizing matching:', error);
    } finally {
      setOptimizing(false);
    }
  };

  const getIntentColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getOpportunityColor = (opportunity: string) => {
    switch (opportunity) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'matched': return 'bg-purple-500';
      case 'contacted': return 'bg-yellow-500';
      case 'closed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Smart Match AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                Smart Match AI
              </CardTitle>
              <CardDescription>
                AI-powered lead matching and optimization system
              </CardDescription>
            </div>
            <Button 
              onClick={optimizeMatching}
              disabled={optimizing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {optimizing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Optimizing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Optimize Matching
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Smart Match AI continuously learns from your interactions to improve lead quality and matching accuracy.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalMatches}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</div>
            <Progress value={metrics.successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgResponseTime.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Target: &lt; 4 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geographic Coverage</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.geographicCoverage.toFixed(1)}%</div>
            <Progress value={metrics.geographicCoverage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Intent Accuracy</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.intentAccuracy.toFixed(1)}%</div>
            <Progress value={metrics.intentAccuracy} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.customerSatisfaction.toFixed(1)}/5.0</div>
            <Progress value={(metrics.customerSatisfaction / 5) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Geographic Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Geographic Insights
          </CardTitle>
          <CardDescription>
            High-opportunity areas for {userRole === 'vendor' ? 'vendor' : 'trade'} expansion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">ZIP {insight.zip}</span>
                  <Badge className={getOpportunityColor(insight.opportunity)}>
                    {insight.opportunity}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Leads:</span>
                    <span>{insight.leadCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Response:</span>
                    <span>{insight.avgResponseTime.toFixed(1)}h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Matches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Smart Matches
          </CardTitle>
          <CardDescription>
            Latest AI-powered lead matches for your business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentMatches.map((match) => (
              <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(match.status)}`}></div>
                  <div>
                    <p className="font-medium">{match.customerEmail}</p>
                    <p className="text-sm text-gray-600">
                      {match.materialCategory} • ZIP {match.zipCode}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${getIntentColor(match.intentScore)}`}>
                    Intent: {match.intentScore}/10
                  </p>
                  <p className="text-xs text-gray-500">
                    {userRole === 'vendor' ? match.matchedVendors : match.matchedTrades} matches
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
          <CardDescription>
            Personalized suggestions to improve your matching performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Optimize Response Time</p>
                <p className="text-sm text-blue-700">
                  Responding within 2 hours increases conversion rate by 35%
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Expand Service Area</p>
                <p className="text-sm text-green-700">
                  3 high-opportunity ZIP codes identified within 25 miles
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Focus on High-Intent Leads</p>
                <p className="text-sm text-yellow-700">
                  Prioritize leads with intent scores above 7 for better conversion
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartMatchAI;