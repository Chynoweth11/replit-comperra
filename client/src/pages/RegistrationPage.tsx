import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from '../lib/firebase';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, User, Building, Wrench } from 'lucide-react';

const RegistrationPage: React.FC = () => {
  const [userType, setUserType] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userData = {
        uid: user.uid,
        email: user.email,
        role: userType,
        zipCode: formData.zipCode,
        createdAt: new Date(),
        ...formData,
      };
      
      // Add role-specific data
      if (userType === 'vendor') {
        userData.productCategories = ['Tiles', 'Slabs', 'LVT']; // Default categories
        userData.businessName = formData.businessName;
        userData.brandAffiliation = formData.brandAffiliation || '';
      }

      if (userType === 'trade') {
        userData.licenseNumber = formData.licenseNumber;
        userData.serviceRadius = parseInt(formData.serviceRadius) || 50;
        userData.specialty = formData.specialty || 'General Contractor';
      }

      if (userType === 'customer') {
        userData.budget = formData.budget ? parseInt(formData.budget) : null;
        userData.projectDetails = formData.projectDetails || '';
        userData.customerType = formData.customerType || 'homeowner';
      }

      await setDoc(doc(db, "users", user.uid), userData);
      
      console.log('Registration successful! User data:', userData);
      
      // Redirect based on user type
      const dashboardPath = userType === 'customer' ? '/' : `/${userType}-dashboard`;
      navigate(dashboardPath);
      
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'vendor':
        return <Building className="h-5 w-5" />;
      case 'trade':
        return <Wrench className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'vendor':
        return 'Sell materials and products to customers and trade professionals';
      case 'trade':
        return 'Provide installation and construction services to customers';
      default:
        return 'Find materials and connect with professionals for your projects';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Create Your Comperra Account</CardTitle>
          <CardDescription>Join our professional network of vendors, trades, and customers</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <Label htmlFor="userType" className="text-base font-medium text-gray-700 mb-3 block">
              I am a:
            </Label>
            <Select value={userType} onValueChange={setUserType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Customer / Homeowner</span>
                  </div>
                </SelectItem>
                <SelectItem value="vendor">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>Vendor / Supplier</span>
                  </div>
                </SelectItem>
                <SelectItem value="trade">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    <span>Trade Professional</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <div className="mt-2 p-3 bg-gray-50 rounded-md">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {getRoleIcon(userType)}
                <span>{getRoleDescription(userType)}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>

            <div>
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                name="zipCode"
                type="text"
                onChange={handleInputChange}
                placeholder="Your ZIP code"
                required
              />
            </div>

            {userType === 'vendor' && (
              <>
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    type="text"
                    onChange={handleInputChange}
                    placeholder="Your business name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="brandAffiliation">Brand Affiliation (Optional)</Label>
                  <Input
                    id="brandAffiliation"
                    name="brandAffiliation"
                    type="text"
                    onChange={handleInputChange}
                    placeholder="e.g., Authorized MSI Dealer"
                  />
                </div>
              </>
            )}

            {userType === 'trade' && (
              <>
                <div>
                  <Label htmlFor="licenseNumber">Trade License Number</Label>
                  <Input
                    id="licenseNumber"
                    name="licenseNumber"
                    type="text"
                    onChange={handleInputChange}
                    placeholder="Your license number"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="specialty">Specialty</Label>
                  <Select onValueChange={(value) => handleSelectChange('specialty', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general-contractor">General Contractor</SelectItem>
                      <SelectItem value="tile-installer">Tile Installer</SelectItem>
                      <SelectItem value="flooring-installer">Flooring Installer</SelectItem>
                      <SelectItem value="countertop-installer">Countertop Installer</SelectItem>
                      <SelectItem value="electrician">Electrician</SelectItem>
                      <SelectItem value="plumber">Plumber</SelectItem>
                      <SelectItem value="hvac">HVAC Technician</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="serviceRadius">Service Radius (miles)</Label>
                  <Input
                    id="serviceRadius"
                    name="serviceRadius"
                    type="number"
                    defaultValue="50"
                    onChange={handleInputChange}
                    placeholder="Service radius in miles"
                    required
                  />
                </div>
              </>
            )}

            {userType === 'customer' && (
              <>
                <div>
                  <Label htmlFor="customerType">Customer Type</Label>
                  <Select onValueChange={(value) => handleSelectChange('customerType', value)}>
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
                  <Label htmlFor="budget">Estimated Budget (Optional)</Label>
                  <Input
                    id="budget"
                    name="budget"
                    type="number"
                    onChange={handleInputChange}
                    placeholder="e.g., 5000"
                  />
                </div>
                <div>
                  <Label htmlFor="projectDetails">Project Details (Optional)</Label>
                  <Textarea
                    id="projectDetails"
                    name="projectDetails"
                    onChange={handleInputChange}
                    placeholder="Tell us about your project..."
                    rows={3}
                  />
                </div>
              </>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-royal hover:text-royal-dark font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationPage;