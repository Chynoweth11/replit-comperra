import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface SampleRequestFormProps {
  productName?: string;
  onClose?: () => void;
}

const SampleRequestForm: React.FC<SampleRequestFormProps> = ({ productName = '', onClose }) => {
  const [formData, setFormData] = useState({
    product: productName,
    fullName: '',
    email: '',
    zipCode: '',
    interest: '',
    role: 'homeowner',
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const id = `${formData.email}_${Date.now()}`;
      await setDoc(doc(db, "sampleRequests", id), {
        ...formData,
        submittedAt: new Date().toISOString(),
      });
      
      toast({
        title: "Request submitted successfully!",
        description: "We'll process your sample request and get back to you soon.",
      });
      
      // Reset form
      setFormData({
        product: productName,
        fullName: '',
        email: '',
        zipCode: '',
        interest: '',
        role: 'homeowner',
      });
      
      onClose?.();
    } catch (error) {
      console.error("Error saving request:", error);
      toast({
        title: "Error submitting request",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Request a Sample</CardTitle>
        <CardDescription>
          Fill out the form below to request a sample of this product.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="product">Product</Label>
            <Input
              id="product"
              value={formData.product}
              onChange={(e) => handleChange('product', e.target.value)}
              className="bg-gray-50"
              readOnly
            />
          </div>
          
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="zipCode">ZIP Code *</Label>
            <Input
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => handleChange('zipCode', e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="interest">Product Interest *</Label>
            <Input
              id="interest"
              value={formData.interest}
              onChange={(e) => handleChange('interest', e.target.value)}
              placeholder="E.g., kitchen flooring, bathroom tile"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="role">I am a... *</Label>
            <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="homeowner">Homeowner</SelectItem>
                <SelectItem value="designer">Designer</SelectItem>
                <SelectItem value="architect">Architect</SelectItem>
                <SelectItem value="trade">Trade Professional</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SampleRequestForm;