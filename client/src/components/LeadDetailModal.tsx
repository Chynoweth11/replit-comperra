import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Star, Heart, Ban, Clock, CheckCircle, AlertCircle, Mail, Phone, MapPin, Calendar, User, DollarSign, Target, Activity, FileText, Users, Eye, MessageCircle } from 'lucide-react';

interface LeadDetailModalProps {
  lead: any;
  isOpen: boolean;
  onClose: () => void;
  userData: any;
  onFavorite: (vendorId: string) => void;
  onBlock: (vendorId: string) => void;
}

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  isOpen,
  onClose,
  userData,
  onFavorite,
  onBlock
}) => {
  const [matchedVendors, setMatchedVendors] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (lead && isOpen) {
      fetchMatchedVendors();
    }
  }, [lead, isOpen]);

  const fetchMatchedVendors = async () => {
    try {
      // First check if we have matchedProfessionals data directly in the lead
      if (lead.matchedProfessionals) {
        setMatchedVendors(lead.matchedProfessionals);
        setIsLoading(false);
        return;
      }
      
      // Fallback to API call
      const response = await fetch(`/api/lead/${lead.id}/vendors`);
      if (response.ok) {
        const data = await response.json();
        setMatchedVendors(data.vendors || []);
      }
    } catch (error) {
      console.error('Error fetching matched vendors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent, vendorId: string) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      const response = await fetch('/api/vendor/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorId,
          leadId: lead.id,
          rating: parseInt(formData.get('rating') as string),
          comment: formData.get('comment') as string
        })
      });

      if (response.ok) {
        setShowReviewForm(null);
        fetchMatchedVendors(); // Refresh the vendor list
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'viewed': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned': return <Clock className="h-4 w-4" />;
      case 'viewed': return <CheckCircle className="h-4 w-4" />;
      case 'contacted': return <CheckCircle className="h-4 w-4" />;
      case 'expired': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            {lead?.materialCategory} Project - ZIP {lead?.zipCode}
            <Badge className={`ml-auto ${getStatusColor(lead?.status || 'new')}`}>
              {getStatusIcon(lead?.status || 'new')}
              {(lead?.status || 'new').charAt(0).toUpperCase() + (lead?.status || 'new').slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="professionals">Professionals</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Lead Status Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Lead Status & Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {lead?.matchedProfessionals?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Professionals Contacted</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {lead?.matchedProfessionals?.filter((p: any) => p.status === 'responded' || p.status === 'interested').length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Responses Received</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {lead?.matchedProfessionals?.filter((p: any) => p.status === 'contacted').length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Awaiting Response</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {lead?.intentScore || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Intent Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  Project Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Customer Name</p>
                      <p className="text-lg font-semibold text-gray-900">{lead?.customerName || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Material Category</p>
                      <p className="text-lg font-semibold text-blue-600">{lead?.materialCategory}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Project Type</p>
                      <p className="text-lg font-semibold text-gray-900">{lead?.projectType || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Location</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <p className="text-lg font-semibold text-gray-900">ZIP {lead?.zipCode}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Budget</p>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <p className="text-lg font-semibold text-gray-900">
                          {lead?.budget ? `$${lead.budget.toLocaleString()}` : 'Not specified'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Timeline</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <p className="text-lg font-semibold text-gray-900">{lead?.timeline || 'Not specified'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Created</p>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <p className="text-lg font-semibold text-gray-900">
                          {lead?.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                      <Badge className={getStatusColor(lead?.status || 'new')}>
                        {getStatusIcon(lead?.status || 'new')}
                        {(lead?.status || 'new').charAt(0).toUpperCase() + (lead?.status || 'new').slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
                {lead?.description && (
                  <div className="mt-6">
                    <p className="text-sm font-medium text-gray-500 mb-2">Project Description</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 leading-relaxed">{lead.description}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professionals" className="space-y-6">

            {/* Professional Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Professional Matching Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {lead?.matchedProfessionals?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Contacted</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {lead?.matchedProfessionals?.filter((p: any) => p.status === 'responded' || p.status === 'interested').length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Responded</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {lead?.nonResponsiveVendors?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">No Response</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Matched Professionals Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Professional Details</h3>
            
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {matchedVendors.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Finding professionals for your project...</p>
                ) : (
                  matchedVendors.map((vendor: any, index: number) => {
                    const professional = lead?.matchedProfessionals?.find((p: any) => p.email === vendor.email);
                    return (
                    <Card key={vendor.uid || index} className={`border-l-4 ${vendor.role === 'vendor' ? 'border-blue-500' : 'border-green-500'}`}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-lg">
                                {vendor.businessName || vendor.fullName}
                              </h4>
                              <Badge className={`${vendor.role === 'vendor' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                {vendor.role}
                              </Badge>
                              {vendor.tier && (
                                <Badge variant="outline" className="text-xs">
                                  {vendor.tier}
                                </Badge>
                              )}
                            </div>
                            
                            {/* Contact Information */}
                            <div className="bg-gray-50 p-3 rounded-lg mb-3">
                              <h5 className="font-medium text-gray-900 mb-2">Contact Information</h5>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600">Email:</span>
                                  <a href={`mailto:${vendor.email}`} className="text-blue-600 hover:underline">
                                    {vendor.email}
                                  </a>
                                </div>
                                {vendor.phone && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-600">Phone:</span>
                                    <a href={`tel:${vendor.phone}`} className="text-blue-600 hover:underline">
                                      {vendor.phone}
                                    </a>
                                  </div>
                                )}
                                {vendor.zipCode && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-600">ZIP Code:</span>
                                    <span className="text-gray-900">{vendor.zipCode}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600">Distance:</span>
                                  <span className="text-gray-900">{vendor.distance} miles away</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Rating and Experience */}
                            {vendor.rating > 0 && (
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex">{renderStars(vendor.rating)}</div>
                                <span className="text-sm text-gray-600">
                                  {vendor.rating.toFixed(1)} ({vendor.totalReviews || 0} reviews)
                                </span>
                              </div>
                            )}
                            
                            <div className="text-sm text-gray-600 space-y-1">
                              {vendor.specialties && vendor.specialties.length > 0 && (
                                <p><strong>Specialties:</strong> {vendor.specialties.join(', ')}</p>
                              )}
                              {vendor.yearsExperience > 0 && (
                                <p><strong>Experience:</strong> {vendor.yearsExperience} years</p>
                              )}
                              {vendor.certifications && vendor.certifications.length > 0 && (
                                <p><strong>Certifications:</strong> {vendor.certifications.join(', ')}</p>
                              )}
                              {vendor.licenseNumber && (
                                <p><strong>License:</strong> {vendor.licenseNumber}</p>
                              )}
                              {vendor.businessDescription && (
                                <p className="mt-2"><strong>About:</strong> {vendor.businessDescription}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onFavorite(vendor.uid)}
                              className={userData?.favoriteVendors?.includes(vendor.uid) ? 'text-red-500' : ''}
                            >
                              <Heart className={`h-4 w-4 ${userData?.favoriteVendors?.includes(vendor.uid) ? 'fill-red-500' : ''}`} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onBlock(vendor.uid)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Professional Interaction Timeline */}
                        {professional && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h5 className="font-medium text-gray-900 mb-3">Interaction Timeline</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-500" />
                                <span className="text-gray-600">Contacted:</span>
                                <span className="font-medium">
                                  {professional.contactedAt ? new Date(professional.contactedAt).toLocaleString() : 'Recently'}
                                </span>
                                <Badge className={`ml-2 ${getStatusColor(professional.status)}`}>
                                  {professional.status}
                                </Badge>
                              </div>
                              {professional.respondedAt && (
                                <div className="flex items-center gap-2">
                                  <MessageCircle className="h-4 w-4 text-green-500" />
                                  <span className="text-gray-600">Responded:</span>
                                  <span className="font-medium">
                                    {new Date(professional.respondedAt).toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-4 flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            <p>Lead sent to this professional</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowReviewForm(vendor.uid)}
                          >
                            Leave Review
                          </Button>
                        </div>
                        
                        {showReviewForm === vendor.id && (
                          <div className="mt-4 p-4 border-t">
                            <h5 className="font-semibold mb-3">Review {vendor.name}</h5>
                            <form onSubmit={(e) => handleReviewSubmit(e, vendor.id)}>
                              <div className="space-y-3">
                                <div>
                                  <label className="text-sm font-medium">Rating</label>
                                  <Select name="rating" required>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select rating" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="5">5 Stars - Excellent</SelectItem>
                                      <SelectItem value="4">4 Stars - Good</SelectItem>
                                      <SelectItem value="3">3 Stars - Average</SelectItem>
                                      <SelectItem value="2">2 Stars - Poor</SelectItem>
                                      <SelectItem value="1">1 Star - Terrible</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Comment</label>
                                  <Textarea
                                    name="comment"
                                    placeholder="Share your experience..."
                                    rows={3}
                                    className="mt-1"
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowReviewForm(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button type="submit">Submit Review</Button>
                                </div>
                              </div>
                            </form>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    )
                  })
                )}
              </div>
            )}
          </div>

            {/* Non-responsive Vendors */}
            {lead?.nonResponsiveVendors && lead.nonResponsiveVendors.length > 0 && (
              <Card className="border-l-4 border-red-500">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-red-700 mb-2">Did not respond within 48 hours:</h4>
                  <ul className="space-y-1">
                    {lead.nonResponsiveVendors.map((vendor: any, index: number) => (
                      <li key={index} className="text-sm text-red-600">
                        • {vendor.vendorName}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                  Activity Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Lead Creation */}
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900">Lead Created</h4>
                      <p className="text-sm text-blue-700">
                        Project request submitted for {lead?.materialCategory} in ZIP {lead?.zipCode}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        {lead?.createdAt ? new Date(lead.createdAt).toLocaleString() : 'Recently'}
                      </p>
                    </div>
                  </div>

                  {/* Professional Contacts */}
                  {lead?.matchedProfessionals?.map((professional: any, index: number) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Users className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-green-900">
                          Professional Contacted: {professional.businessName || professional.name}
                        </h4>
                        <p className="text-sm text-green-700">
                          Lead sent to {professional.email}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {professional.contactedAt ? new Date(professional.contactedAt).toLocaleString() : 'Recently'}
                        </p>
                        {professional.respondedAt && (
                          <div className="mt-2 p-2 bg-white rounded border border-green-200">
                            <p className="text-sm font-medium text-green-800">Response Received</p>
                            <p className="text-xs text-green-600">
                              {new Date(professional.respondedAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                      <Badge className={getStatusColor(professional.status)}>
                        {professional.status}
                      </Badge>
                    </div>
                  ))}

                  {/* Status Changes */}
                  {lead?.status && lead.status !== 'new' && (
                    <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg">
                      <div className="p-2 bg-yellow-100 rounded-full">
                        <Target className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-yellow-900">
                          Status Updated to {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </h4>
                        <p className="text-sm text-yellow-700">
                          Lead status changed based on professional interactions
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Lead Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Reach Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Professionals Contacted:</span>
                          <span className="font-semibold text-blue-900">{lead?.matchedProfessionals?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Emails Sent:</span>
                          <span className="font-semibold text-blue-900">{lead?.matchedProfessionals?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Geographic Coverage:</span>
                          <span className="font-semibold text-blue-900">ZIP {lead?.zipCode}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Response Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-700">Total Responses:</span>
                          <span className="font-semibold text-green-900">
                            {lead?.matchedProfessionals?.filter((p: any) => p.status === 'responded' || p.status === 'interested').length || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Response Rate:</span>
                          <span className="font-semibold text-green-900">
                            {lead?.matchedProfessionals?.length ? 
                              Math.round((lead.matchedProfessionals.filter((p: any) => p.status === 'responded' || p.status === 'interested').length / lead.matchedProfessionals.length) * 100) + '%' 
                              : '0%'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Interested Professionals:</span>
                          <span className="font-semibold text-green-900">
                            {lead?.matchedProfessionals?.filter((p: any) => p.status === 'interested').length || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">Quality Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-purple-700">Intent Score:</span>
                          <span className="font-semibold text-purple-900">
                            {lead?.intentScore ? `${lead.intentScore}/100` : 'Not calculated'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-700">Budget Specified:</span>
                          <span className="font-semibold text-purple-900">
                            {lead?.budget ? '✓ Yes' : '✗ No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-700">Timeline Specified:</span>
                          <span className="font-semibold text-purple-900">
                            {lead?.timeline ? '✓ Yes' : '✗ No'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-red-50 rounded-lg">
                      <h4 className="font-medium text-red-900 mb-2">Follow-up Needed</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-red-700">No Response:</span>
                          <span className="font-semibold text-red-900">
                            {lead?.matchedProfessionals?.filter((p: any) => p.status === 'contacted').length || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-700">Expired Leads:</span>
                          <span className="font-semibold text-red-900">{lead?.nonResponsiveVendors?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-700">Days Since Created:</span>
                          <span className="font-semibold text-red-900">
                            {lead?.createdAt ? Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailModal;