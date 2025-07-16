import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/header';
import Footer from '@/components/footer';
import AdminAnalyticsDashboard from '@/components/admin-analytics-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Play,
  Settings,
  Activity,
  Database,
  Users,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemStatus {
  status: string;
  services: {
    database: string;
    leadProcessing: string;
    automation: string;
  };
  stats: {
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
  };
}

export default function EnhancedAdminDashboard() {
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [processingLeads, setProcessingLeads] = useState(false);

  // Fetch system status
  const { 
    data: systemStatus, 
    isLoading: statusLoading, 
    error: statusError,
    refetch: refetchStatus
  } = useQuery<SystemStatus>({
    queryKey: ['/api/admin/system-status'],
    refetchInterval: 15000, // Refresh every 15 seconds
    retry: 3
  });

  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchStatus();
      toast({
        title: "Refreshed",
        description: "System status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh system status",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Handle manual lead processing
  const handleProcessLeads = async () => {
    setProcessingLeads(true);
    try {
      const response = await fetch('/api/admin/process-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Lead processing completed successfully",
        });
        await refetchStatus();
      } else {
        throw new Error('Failed to process leads');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process leads",
        variant: "destructive",
      });
    } finally {
      setProcessingLeads(false);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
      case 'connected':
      case 'active':
      case 'enabled':
        return 'bg-green-500';
      case 'idle':
        return 'bg-yellow-500';
      case 'error':
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational':
        return 'Operational';
      case 'connected':
        return 'Connected';
      case 'active':
        return 'Active';
      case 'enabled':
        return 'Enabled';
      case 'idle':
        return 'Idle';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enhanced Admin Dashboard</h1>
            <p className="text-gray-600">Monitor system performance and analytics</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleProcessLeads}
              disabled={processingLeads}
            >
              <Play className="h-4 w-4 mr-2" />
              {processingLeads ? 'Processing...' : 'Process Leads'}
            </Button>
          </div>
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(systemStatus?.status || 'unknown')}`}></div>
                <span className="text-lg font-semibold">
                  {getStatusText(systemStatus?.status || 'Unknown')}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Database</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-blue-500" />
                <span className="text-lg font-semibold">
                  {getStatusText(systemStatus?.services?.database || 'Unknown')}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Lead Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-500" />
                <span className="text-lg font-semibold">
                  {getStatusText(systemStatus?.services?.leadProcessing || 'Unknown')}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Automation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-purple-500" />
                <span className="text-lg font-semibold">
                  {getStatusText(systemStatus?.services?.automation || 'Unknown')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Health Alerts */}
        {statusError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              Failed to load system status. Please check your connection and try again.
            </AlertDescription>
          </Alert>
        )}

        {systemStatus?.stats?.isProcessing && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
            <AlertDescription className="text-blue-700">
              Automated lead processing is currently running. Last processed: {
                systemStatus.stats.lastProcessed ? 
                new Date(systemStatus.stats.lastProcessed).toLocaleString() : 
                'Unknown'
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemStatus?.stats?.leads?.totalLeads || 0}
              </div>
              <div className="text-sm text-gray-500">
                {systemStatus?.stats?.leads?.newLeads || 0} new leads
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemStatus?.stats?.matches?.totalMatches || 0}
              </div>
              <div className="text-sm text-gray-500">
                {systemStatus?.stats?.matches?.pendingMatches || 0} pending
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Response Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemStatus?.stats?.matches ? 
                  Math.round((systemStatus.stats.matches.contactedMatches / systemStatus.stats.matches.totalMatches) * 100) || 0 
                  : 0}%
              </div>
              <div className="text-sm text-gray-500">
                {systemStatus?.stats?.matches?.contactedMatches || 0} contacted
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Expired Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemStatus?.stats?.leads?.expiredLeads || 0}
              </div>
              <div className="text-sm text-gray-500">
                {systemStatus?.stats?.leads?.archivedLeads || 0} archived
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Analytics Dashboard */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Detailed Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AdminAnalyticsDashboard />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={handleProcessLeads}
                disabled={processingLeads}
                className="flex items-center justify-center"
              >
                <Play className="h-4 w-4 mr-2" />
                Process Leads Now
              </Button>
              
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center justify-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.open('/admin', '_blank')}
                className="flex items-center justify-center"
              >
                <Users className="h-4 w-4 mr-2" />
                View Users
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}