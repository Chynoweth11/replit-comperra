import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Heart, Ban, Clock, CheckCircle, AlertCircle, Mail, Phone, MapPin } from 'lucide-react';

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
          <DialogTitle className="text-2xl font-bold">
            {lead?.materialCategory} Project - ZIP {lead?.zipCode}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lead Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Material Category</p>
                  <p className="text-lg font-semibold">{lead?.materialCategory}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">ZIP Code</p>
                  <p className="text-lg font-semibold">{lead?.zipCode}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Budget</p>
                  <p className="text-lg font-semibold">
                    {lead?.budget ? `$${lead.budget.toLocaleString()}` : 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Timeline</p>
                  <p className="text-lg font-semibold">{lead?.timeline || 'Not specified'}</p>
                </div>
              </div>
              {lead?.description && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">Project Description</p>
                  <p className="text-gray-700 mt-1">{lead.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Matched Professionals */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Matched Professionals</h3>
            
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {matchedVendors.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Finding professionals for your project...</p>
                ) : (
                  matchedVendors.map((vendor: any, index: number) => (
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
                  ))
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailModal;