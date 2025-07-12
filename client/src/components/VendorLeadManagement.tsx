import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  MapPin, 
  Phone, 
  Mail, 
  User,
  AlertCircle,
  MessageSquare,
  Calendar,
  Target
} from 'lucide-react';

interface VendorLead {
  id: string;
  leadId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  material: string;
  zipCode: string;
  budget?: number;
  timeline?: string;
  description?: string;
  assignedAt: string;
  status: 'assigned' | 'viewed' | 'contacted' | 'declined' | 'expired';
  score: number;
  matchReasons: string[];
  expiresAt?: string;
  respondedAt?: string;
  notes?: string;
}

interface VendorLeadManagementProps {
  vendorId: string;
}

const VendorLeadManagement: React.FC<VendorLeadManagementProps> = ({ vendorId }) => {
  const [leads, setLeads] = useState<VendorLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<VendorLead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [responseText, setResponseText] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchVendorLeads();
  }, [vendorId]);

  const fetchVendorLeads = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/vendor/${vendorId}/leads`);
      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error('Error fetching vendor leads:', error);
      toast({
        title: "Error",
        description: "Failed to load leads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeadResponse = async (leadId: string, action: 'contacted' | 'declined') => {
    try {
      setIsResponding(true);
      const response = await fetch(`/api/vendor-lead/${leadId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: action,
          notes: responseText
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Lead ${action} successfully.`,
        });
        
        // Update local state
        setLeads(prev => prev.map(lead => 
          lead.id === leadId 
            ? { ...lead, status: action, respondedAt: new Date().toISOString(), notes: responseText }
            : lead
        ));
        
        setSelectedLead(null);
        setResponseText('');
      } else {
        throw new Error('Failed to update lead status');
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast({
        title: "Error",
        description: "Failed to update lead status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResponding(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'viewed': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned': return <Clock className="h-4 w-4" />;
      case 'viewed': return <CheckCircle className="h-4 w-4" />;
      case 'contacted': return <CheckCircle className="h-4 w-4" />;
      case 'declined': return <XCircle className="h-4 w-4" />;
      case 'expired': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (filter === 'all') return true;
    return lead.status === filter;
  });

  const leadStats = {
    total: leads.length,
    assigned: leads.filter(l => l.status === 'assigned').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    expired: leads.filter(l => l.status === 'expired').length,
    declined: leads.filter(l => l.status === 'declined').length
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Leads</p>
                <p className="text-2xl font-bold">{leadStats.total}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Assigned</p>
                <p className="text-2xl font-bold text-yellow-600">{leadStats.assigned}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Contacted</p>
                <p className="text-2xl font-bold text-green-600">{leadStats.contacted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Declined</p>
                <p className="text-2xl font-bold text-red-600">{leadStats.declined}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Expired</p>
                <p className="text-2xl font-bold text-gray-600">{leadStats.expired}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lead Management</span>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter leads" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leads</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No leads found for the selected filter.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{lead.customerName}</h3>
                        <Badge className={`${getStatusColor(lead.status)} flex items-center gap-1`}>
                          {getStatusIcon(lead.status)}
                          {lead.status}
                        </Badge>
                        {lead.status === 'assigned' && lead.expiresAt && (
                          <Badge variant="outline" className="text-red-600">
                            {getTimeRemaining(lead.expiresAt)}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-1" />
                            ZIP {lead.zipCode}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-1" />
                            {lead.customerEmail}
                          </div>
                          {lead.customerPhone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-4 w-4 mr-1" />
                              {lead.customerPhone}
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Target className="h-4 w-4 mr-1" />
                            {lead.material}
                          </div>
                          {lead.budget && (
                            <div className="flex items-center text-sm text-gray-600">
                              <DollarSign className="h-4 w-4 mr-1" />
                              ${lead.budget.toLocaleString()}
                            </div>
                          )}
                          {lead.timeline && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-1" />
                              {lead.timeline}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {lead.description && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                            {lead.description}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {lead.matchReasons.map((reason, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Match Score: {lead.score} • 
                        Assigned: {new Date(lead.assignedAt).toLocaleDateString()}
                        {lead.respondedAt && (
                          <> • Responded: {new Date(lead.respondedAt).toLocaleDateString()}</>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      {lead.status === 'assigned' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" onClick={() => setSelectedLead(lead)}>
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Respond
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Respond to Lead</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="p-4 bg-gray-50 rounded">
                                <h4 className="font-semibold mb-2">{lead.customerName}</h4>
                                <p className="text-sm text-gray-600 mb-2">
                                  {lead.material} project in ZIP {lead.zipCode}
                                </p>
                                {lead.description && (
                                  <p className="text-sm text-gray-700">"{lead.description}"</p>
                                )}
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  Response Notes (Optional)
                                </label>
                                <Textarea
                                  value={responseText}
                                  onChange={(e) => setResponseText(e.target.value)}
                                  placeholder="Add any notes about your response..."
                                  rows={3}
                                />
                              </div>
                              
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => handleLeadResponse(lead.id, 'declined')}
                                  disabled={isResponding}
                                >
                                  Decline
                                </Button>
                                <Button
                                  onClick={() => handleLeadResponse(lead.id, 'contacted')}
                                  disabled={isResponding}
                                >
                                  {isResponding ? 'Contacting...' : 'Contact Customer'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorLeadManagement;