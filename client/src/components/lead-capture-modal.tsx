import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { formatPhoneNumber, isValidPhoneNumber } from "@/utils/phoneFormatter";

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  requestType?: 'pricing' | 'sample';
  productSpecs?: any;
  productUrl?: string;
}

export default function LeadCaptureModal({ isOpen, onClose, productName, requestType = 'pricing', productSpecs, productUrl }: LeadCaptureModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    product: productName || "",
    customerType: "",
    projectType: "",
    timeline: "",
    budget: "",
    projectDetails: "",
    message: "",
    isLookingForPro: false,
    professionalType: "vendor",
    materialCategories: [] as string[],
    source: requestType === 'sample' ? "sample-request" : "pricing-request"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.zip || formData.materialCategories.length === 0) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all required fields marked with * and select at least one material category",
        variant: "destructive"
      });
      return;
    }

    if (!isValidPhoneNumber(formData.phone)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      
      const response = await fetch('/api/lead/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          customerEmail: formData.email,
          customerName: formData.name,
          customerPhone: formData.phone,
          zipCode: formData.zip,
          projectDetails: formData.projectDetails,
          description: formData.message,
          materialCategories: formData.materialCategories,
          materialCategory: formData.materialCategories[0] || "",
          projectType: formData.projectType,
          timeline: formData.timeline,
          budget: formData.budget,
          professionalType: formData.professionalType,
          isLookingForPro: formData.professionalType === 'trade' || formData.professionalType === 'both',
          customerType: formData.customerType,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          source: formData.source,
          requestType: requestType,
          productSpecs: productSpecs,
          productUrl: productUrl,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: requestType === 'sample' ? "Sample request submitted!" : "Request submitted successfully!",
          description: requestType === 'sample' 
            ? "We'll process your sample request and contact you with availability details soon."
            : "We'll be in touch with pricing and availability information soon.",
        });
        setFormData({ 
          name: "", 
          email: "", 
          phone: "",
          address: "",
          city: "",
          state: "",
          zip: "", 
          product: productName || "", 
          customerType: "",
          projectType: "",
          timeline: "",
          budget: "",
          projectDetails: "",
          message: "",
          isLookingForPro: false,
          professionalType: "vendor",
          materialCategories: [] as string[],
          source: "pricing-request"
        });
        onClose();
      } else {
        throw new Error(result.error || 'Failed to save lead');
      }
    } catch (error) {
      console.error('Lead submission error:', error);
      toast({
        title: "Submission failed",
        description: "Please try again or contact us directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'phone') {
      setFormData(prev => ({ ...prev, [field]: formatPhoneNumber(value) }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {requestType === 'sample' ? 'Request Product Samples' : 'Get Pricing Information'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {productName && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Product:</strong> {productName}
              </p>
            </div>
          )}
          
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="(555) 123-4567"
              maxLength={14}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="address">Street Address *</Label>
            <Input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="123 Main Street"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Denver"
                required
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                type="text"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                placeholder="CO"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="zip">ZIP Code *</Label>
            <Input
              id="zip"
              type="text"
              value={formData.zip}
              onChange={(e) => handleInputChange("zip", e.target.value)}
              placeholder="80202"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="product">Product Interest</Label>
            <Input
              id="product"
              type="text"
              value={formData.product}
              onChange={(e) => handleInputChange("product", e.target.value)}
              placeholder="Specific product or category"
            />
          </div>
          
          <div>
            <Label htmlFor="customerType">I am a</Label>
            <Select value={formData.customerType} onValueChange={(value) => handleInputChange("customerType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="homeowner">Homeowner</SelectItem>
                <SelectItem value="designer">Interior Designer</SelectItem>
                <SelectItem value="architect">Architect</SelectItem>
                <SelectItem value="contractor">Contractor</SelectItem>
                <SelectItem value="trade">Trade Professional</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="projectType">Project Type</Label>
            <Select value={formData.projectType} onValueChange={(value) => handleInputChange("projectType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select project type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new-construction">New Construction</SelectItem>
                <SelectItem value="renovation">Renovation</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="upgrade">Upgrade</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="timeline">Project Timeline</Label>
            <Select value={formData.timeline} onValueChange={(value) => handleInputChange("timeline", value)}>
              <SelectTrigger>
                <SelectValue placeholder="When do you need this completed?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediately">Immediately</SelectItem>
                <SelectItem value="within-1-month">Within 1 Month</SelectItem>
                <SelectItem value="within-3-months">Within 3 Months</SelectItem>
                <SelectItem value="within-6-months">Within 6 Months</SelectItem>
                <SelectItem value="planning-stage">Still Planning</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="budget">Estimated Budget (Optional)</Label>
            <Select value={formData.budget} onValueChange={(value) => handleInputChange("budget", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select budget range (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under-1000">Under $1,000</SelectItem>
                <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                <SelectItem value="10000-25000">$10,000 - $25,000</SelectItem>
                <SelectItem value="25000-50000">$25,000 - $50,000</SelectItem>
                <SelectItem value="over-50000">Over $50,000</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Material Categories *</Label>
            <div className="space-y-2 mt-2">
              {['tiles', 'stone-slabs', 'vinyl-lvt', 'hardwood', 'carpet', 'heating', 'thermostats'].map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={formData.materialCategories.includes(category)}
                    onCheckedChange={(checked) => {
                      const newCategories = checked
                        ? [...formData.materialCategories, category]
                        : formData.materialCategories.filter(c => c !== category);
                      setFormData(prev => ({ ...prev, materialCategories: newCategories }));
                    }}
                  />
                  <Label htmlFor={category} className="text-sm font-normal">
                    {category === 'stone-slabs' ? 'Stone & Slabs' : 
                     category === 'vinyl-lvt' ? 'Vinyl & LVT' : 
                     category.charAt(0).toUpperCase() + category.slice(1)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Request Specific Fields */}
          {requestType === 'sample' && productSpecs && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Product Specifications</h3>
              <div className="text-sm space-y-1">
                {Object.entries(productSpecs).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium">{key}:</span>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </div>
              {productUrl && (
                <div className="mt-2">
                  <a 
                    href={productUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Original Product →
                  </a>
                </div>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="projectDetails">
              {requestType === 'sample' ? 'Sample Requirements' : 'Project Details'}
            </Label>
            <Textarea
              id="projectDetails"
              value={formData.projectDetails}
              onChange={(e) => handleInputChange("projectDetails", e.target.value)}
              placeholder={requestType === 'sample' 
                ? "Please specify sample size requirements, quantity needed, or any special requests..."
                : "Describe your project requirements, measurements, specifications, or any specific needs..."
              }
              rows={4}
            />
          </div>
          
          <div>
            <Label htmlFor="message">Additional Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              placeholder="Any additional questions or comments..."
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="professionalType" className="text-sm font-medium mb-2 block">
              I'm looking for a:
            </Label>
            <Select value={formData.professionalType || 'vendor'} onValueChange={(value) => handleInputChange("professionalType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select professional type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vendor">Vendor (Material Supplier)</SelectItem>
                <SelectItem value="trade">Trade Professional (Contractor/Installer)</SelectItem>
                <SelectItem value="both">Both Vendors and Trade Professionals</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-royal text-white hover:bg-royal-dark"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : (requestType === 'sample' ? 'Request Samples' : 'Get Pricing')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}