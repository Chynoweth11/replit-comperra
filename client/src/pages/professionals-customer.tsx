import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { formatPhoneNumber, isValidPhoneNumber } from "@/utils/phoneFormatter";
import Header from "@/components/header";
import { useLocation } from "wouter";

export default function ProfessionalsCustomer() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    customerType: "",
    projectType: "",
    timeline: "",
    budget: "",
    projectDetails: "",
    isLookingForPro: true,
    professionalType: "both",
    materialCategories: [] as string[],
    source: "professionals-customer"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.zip || formData.materialCategories.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select at least one material category.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidPhoneNumber(formData.phone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      
      const leadData = {
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        zipCode: formData.zip,
        materialCategory: formData.materialCategories[0],
        materialCategories: formData.materialCategories,
        projectType: formData.projectType,
        projectDetails: formData.projectDetails,
        budget: formData.budget ? parseInt(formData.budget) : null,
        timeline: formData.timeline,
        requestType: 'professional-connection',
        customerType: formData.customerType,
        isLookingForPro: formData.isLookingForPro,
        professionalType: formData.professionalType,
      };

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      });

      if (response.ok) {
        toast({
          title: "Request Submitted!",
          description: "We're connecting you with qualified professionals in your area. You'll hear back within 24 hours.",
        });
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          state: "",
          zip: "",
          customerType: "",
          projectType: "",
          timeline: "",
          budget: "",
          projectDetails: "",
          isLookingForPro: true,
          professionalType: "both",
          materialCategories: [],
          source: "professionals-customer"
        });
        
        // Redirect to thank you or home page
        setTimeout(() => {
          setLocation('/');
        }, 2000);
      } else {
        throw new Error('Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckboxChange = (category: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      materialCategories: checked 
        ? [...prev.materialCategories, category]
        : prev.materialCategories.filter(c => c !== category)
    }));
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Find Qualified Professionals Near You
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with vetted contractors, installers, and material suppliers in your area. 
            Get matched with professionals who specialize in your specific project needs.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Smith"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="zip">ZIP Code *</Label>
                <Input
                  id="zip"
                  value={formData.zip}
                  onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
                  placeholder="12345"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main St"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Any City"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="CA"
                  maxLength={2}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Material Categories Needed *</Label>
              <p className="text-sm text-gray-600 mb-3">Select all that apply to your project</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'tiles', label: 'Tiles' },
                  { value: 'slabs', label: 'Stone & Slabs' },
                  { value: 'lvt', label: 'Vinyl & LVT' },
                  { value: 'hardwood', label: 'Hardwood' },
                  { value: 'heating', label: 'Heating Systems' },
                  { value: 'carpet', label: 'Carpet' },
                  { value: 'thermostats', label: 'Thermostats' }
                ].map((category) => (
                  <div key={category.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.value}
                      checked={formData.materialCategories.includes(category.value)}
                      onCheckedChange={(checked) => handleCheckboxChange(category.value, checked as boolean)}
                    />
                    <Label htmlFor={category.value} className="text-sm">{category.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="customerType">I am a...</Label>
                <Select value={formData.customerType} onValueChange={(value) => setFormData(prev => ({ ...prev, customerType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="homeowner">Homeowner</SelectItem>
                    <SelectItem value="designer">Interior Designer</SelectItem>
                    <SelectItem value="architect">Architect</SelectItem>
                    <SelectItem value="contractor">General Contractor</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="professionalType">Looking for...</Label>
                <Select value={formData.professionalType} onValueChange={(value) => setFormData(prev => ({ ...prev, professionalType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type of professional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendor">Material Suppliers Only</SelectItem>
                    <SelectItem value="trade">Installers/Contractors Only</SelectItem>
                    <SelectItem value="both">Both Suppliers & Installers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="projectType">Project Type</Label>
                <Select value={formData.projectType} onValueChange={(value) => setFormData(prev => ({ ...prev, projectType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kitchen-remodel">Kitchen Remodel</SelectItem>
                    <SelectItem value="bathroom-remodel">Bathroom Remodel</SelectItem>
                    <SelectItem value="flooring-replacement">Flooring Replacement</SelectItem>
                    <SelectItem value="new-construction">New Construction</SelectItem>
                    <SelectItem value="commercial-project">Commercial Project</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="timeline">Project Timeline</Label>
                <Select value={formData.timeline} onValueChange={(value) => setFormData(prev => ({ ...prev, timeline: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="When do you need this?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">ASAP</SelectItem>
                    <SelectItem value="1-month">Within 1 month</SelectItem>
                    <SelectItem value="3-months">Within 3 months</SelectItem>
                    <SelectItem value="6-months">Within 6 months</SelectItem>
                    <SelectItem value="planning">Just planning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="budget">Estimated Budget (Optional)</Label>
              <Select value={formData.budget} onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1000">Under $1,000</SelectItem>
                  <SelectItem value="5000">$1,000 - $5,000</SelectItem>
                  <SelectItem value="10000">$5,000 - $10,000</SelectItem>
                  <SelectItem value="25000">$10,000 - $25,000</SelectItem>
                  <SelectItem value="50000">$25,000 - $50,000</SelectItem>
                  <SelectItem value="100000">$50,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="projectDetails">Project Details</Label>
              <Textarea
                id="projectDetails"
                value={formData.projectDetails}
                onChange={(e) => setFormData(prev => ({ ...prev, projectDetails: e.target.value }))}
                placeholder="Tell us more about your project, specific requirements, or any questions you have..."
                rows={4}
              />
            </div>

            <div className="border-t pt-6">
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Connecting you with professionals..." : "Find My Professionals"}
              </Button>
              <p className="text-sm text-gray-500 text-center mt-4">
                By submitting this form, you agree to be contacted by qualified professionals in your area. 
                We'll never share your information with unvetted companies.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}