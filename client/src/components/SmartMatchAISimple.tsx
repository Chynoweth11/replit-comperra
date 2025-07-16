import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  Clock, 
  MapPin, 
  Users,
  Activity,
  AlertTriangle,
  Zap
} from 'lucide-react';

interface SmartMatchAISimpleProps {
  userRole: 'vendor' | 'trade';
  userId: string;
}

export const SmartMatchAISimple: React.FC<SmartMatchAISimpleProps> = ({ userRole, userId }) => {
  const [metrics, setMetrics] = useState({
    totalMatches: 0,
    successRate: 0,
    avgResponseTime: 0,
    geographicCoverage: 0,
    intentAccuracy: 0,
    customerSatisfaction: 0
  });
  
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSmartMatchData();
  }, [userRole, userId]);

  const fetchSmartMatchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/smart-match/metrics?role=${userRole}&userId=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setMetrics(data.metrics || {});
        setRecentMatches(data.recentMatches || []);
      } else {
        setError(data.error || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching smart match data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading Smart Match AI...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Smart Match AI</h3>
              <p className="text-gray-600 mb-4">Error: {error}</p>
              <Button onClick={fetchSmartMatchData} className="bg-blue-600 hover:bg-blue-700">
                <Zap className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
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
          onClick={fetchSmartMatchData}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Zap className="w-4 h-4 mr-2" />
          Refresh Data
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
            <Users className="w-4 h-4 text-yellow-600" />
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
              recentMatches.map((match: any, index: number) => (
                <div key={match.id || index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
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
                        {match.createdAt ? new Date(match.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {match.status}
                    </div>
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

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>User Role:</strong> {userRole}</div>
            <div><strong>User ID:</strong> {userId}</div>
            <div><strong>Total Matches:</strong> {metrics.totalMatches}</div>
            <div><strong>Recent Matches Count:</strong> {recentMatches.length}</div>
            <div><strong>API Response:</strong> Success</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartMatchAISimple;