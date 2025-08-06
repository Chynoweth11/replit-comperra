import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { ArrowLeft, User, Mail, MapPin, Briefcase, Save, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatPhoneNumber, isValidPhoneNumber } from '@/utils/phoneFormatter';

interface UserProfile {
  displayName: string;
  email: string;
  zipCode: string;
  phoneNumber: string;
  companyName: string;
  role: 'vendor' | 'trade' | 'customer' | 'homeowner';
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    newsletterSubscription: boolean;
  };
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile>({
    displayName: '',
    email: '',
    zipCode: '',
    phoneNumber: '',
    companyName: '',
    role: 'customer',
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      newsletterSubscription: true
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      // Load profile from database
      const loadProfile = async () => {
        try {
          const response = await fetch(`/api/user/profile/${user.uid}`);
          if (response.ok) {
            const result = await response.json();
            const userData = result.user;
            setProfile({
              displayName: userData.name || user.displayName || '',
              email: userData.email || user.email || '',
              zipCode: userData.zipCode || '',
              phoneNumber: formatPhoneNumber(userData.phone || ''),
              companyName: userData.companyName || '',
              role: userData.role || 'customer',
              preferences: {
                emailNotifications: userData.emailNotifications ?? true,
                smsNotifications: userData.smsNotifications ?? false,
                newsletterSubscription: userData.newsletterSubscription ?? true
              }
            });
          } else {
            // Create user profile if it doesn't exist
            const createResponse = await fetch('/api/user/profile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                uid: user.uid,
                email: user.email,
                name: user.displayName || '',
                role: 'customer', // Default role since user.role doesn't exist on Firebase User
                phone: '',
                zipCode: '',
                companyName: '',
                emailNotifications: true,
                smsNotifications: false,
                newsletterSubscription: true
              }),
            });
            
            if (createResponse.ok) {
              const createResult = await createResponse.json();
              const userData = createResult.user;
              setProfile({
                displayName: userData.name || user.displayName || '',
                email: userData.email || user.email || '',
                zipCode: userData.zipCode || '',
                phoneNumber: formatPhoneNumber(userData.phone || ''),
                companyName: userData.companyName || '',
                role: userData.role || 'customer',
                preferences: {
                  emailNotifications: userData.emailNotifications ?? true,
                  smsNotifications: userData.smsNotifications ?? false,
                  newsletterSubscription: userData.newsletterSubscription ?? true
                }
              });
            } else {
              // Fallback to user data
              setProfile(prev => ({
                ...prev,
                displayName: user.displayName || '',
                email: user.email || '',
                zipCode: '',
                phoneNumber: '',
                companyName: '',
                role: 'customer'
              }));
            }
          }
        } catch (error) {
          console.error('Error loading profile:', error);
          // Fallback to user data
          setProfile(prev => ({
            ...prev,
            displayName: user.displayName || '',
            email: user.email || '',
            zipCode: '',
            phoneNumber: '',
            companyName: '',
            role: 'customer'
          }));
        }
      };
      
      loadProfile();
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    if (field === 'phoneNumber') {
      setProfile(prev => ({
        ...prev,
        [field]: formatPhoneNumber(value)
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handlePreferenceChange = (field: string, value: boolean) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!user?.uid) {
      toast({
        title: "Error",
        description: "User not authenticated. Please sign in again.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      console.log('💾 Saving profile for user:', user.uid);
      console.log('📝 Profile data:', profile);
      
      // Validate phone number if provided
      if (profile.phoneNumber && !isValidPhoneNumber(profile.phoneNumber)) {
        toast({
          title: "Invalid phone number",
          description: "Please enter a valid 10-digit phone number.",
          variant: "destructive"
        });
        setIsSaving(false);
        return;
      }

      // Prepare the update payload
      const updatePayload = {
        name: profile.displayName || '',
        email: profile.email || user.email,
        phone: profile.phoneNumber || '',
        zipCode: profile.zipCode || '',
        companyName: profile.companyName || '',
        emailNotifications: profile.preferences.emailNotifications,
        smsNotifications: profile.preferences.smsNotifications,
        newsletterSubscription: profile.preferences.newsletterSubscription,
        role: profile.role,
        uid: user.uid
      };

      console.log('📤 Sending update payload:', updatePayload);
      console.log('🌐 Making request to:', `/api/user/profile/${user.uid}`);

      // Save to database using API (with timeout to prevent hanging)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(`/api/user/profile/${user.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('📥 API Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ API Error response:', errorData);
        console.error('❌ Response status:', response.status);
        console.error('❌ Response headers:', Object.fromEntries(response.headers.entries()));
        throw new Error(`Failed to save profile: ${response.status} ${errorData}`);
      }
      
      const result = await response.json();
      console.log('✅ Profile save successful:', result);
      
      // Show success message regardless of any background sync issues
      toast({
        title: "Successfully saved",
        description: "Your profile changes have been saved.",
        variant: "default"
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('❌ Profile save error:', error);
      
      // Check if it's an abort error from timeout
      if (error.name === 'AbortError') {
        toast({
          title: "Request timed out",
          description: "The save request took too long. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      console.log('🔄 Resetting isSaving state');
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    // Reload profile from database
    if (user) {
      try {
        const response = await fetch(`/api/user/profile/${user.uid}`);
        if (response.ok) {
          const result = await response.json();
          const userData = result.user;
          setProfile({
            displayName: userData.name || user.displayName || '',
            email: userData.email || user.email || '',
            zipCode: userData.zipCode || '',
            phoneNumber: formatPhoneNumber(userData.phone || ''),
            companyName: userData.companyName || '',
            role: userData.role || 'customer',
            preferences: {
              emailNotifications: userData.emailNotifications ?? true,
              smsNotifications: userData.smsNotifications ?? false,
              newsletterSubscription: userData.newsletterSubscription ?? true
            }
          });
        }
      } catch (error) {
        console.error('Error reloading profile:', error);
      }
    }
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Please Sign In</h2>
            <p className="text-gray-600 mb-6">You need to be signed in to view your profile.</p>
            <Link href="/login">
              <Button className="bg-royal text-white hover:bg-royal-dark">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your profile information and preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  {!isEditing ? (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={isSaving}>
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="displayName">Full Name</Label>
                    <Input
                      id="displayName"
                      value={profile.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled={true}
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={profile.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      disabled={!isEditing}
                      placeholder="(555) 123-4567"
                      maxLength={14}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={profile.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      disabled={!isEditing}
                      placeholder="90210"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name (Optional)</Label>
                    <Input
                      id="companyName"
                      value={profile.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Your company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Account Type</Label>
                    {/* Account Type Locking Logic */}
                    {(profile.role === 'vendor' || profile.role === 'trade') ? (
                      <div>
                        <Input
                          value={profile.role === 'vendor' ? 'Vendor/Supplier' : 'Trade Professional'}
                          disabled={true}
                          className="bg-gray-100"
                        />
                        <p className="text-xs text-orange-600 mt-1 font-medium">
                          🔒 Account type is locked. {profile.role === 'vendor' ? 'Vendors' : 'Trade professionals'} cannot change their account type.
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {profile.role === 'vendor' && 'Access vendor dashboard and lead management'}
                          {profile.role === 'trade' && 'Access trade professional features'}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Select 
                          value={profile.role} 
                          onValueChange={(value) => handleInputChange('role', value)}
                          disabled={!isEditing || (profile.role as string) === 'vendor' || (profile.role as string) === 'trade'}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="homeowner">Homeowner</SelectItem>
                            {/* Vendor and Trade options are hidden for customers to prevent upgrades without proper process */}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 mt-1">
                          {profile.role === 'customer' && 'Standard customer features'}
                          {profile.role === 'homeowner' && 'Homeowner-specific resources'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive updates about your quotes and comparisons</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreferenceChange('emailNotifications', !profile.preferences.emailNotifications)}
                    disabled={!isEditing}
                  >
                    {profile.preferences.emailNotifications ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">SMS Notifications</Label>
                    <p className="text-sm text-gray-600">Get text messages for urgent updates</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreferenceChange('smsNotifications', !profile.preferences.smsNotifications)}
                    disabled={!isEditing}
                  >
                    {profile.preferences.smsNotifications ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Newsletter Subscription</Label>
                    <p className="text-sm text-gray-600">Monthly digest of new products and trends</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreferenceChange('newsletterSubscription', !profile.preferences.newsletterSubscription)}
                    disabled={!isEditing}
                  >
                    {profile.preferences.newsletterSubscription ? 'Subscribed' : 'Unsubscribed'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-royal text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-10 w-10" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{profile.displayName || 'User'}</h3>
                  <p className="text-sm text-gray-600">{profile.email}</p>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {profile.zipCode || 'Location not set'}
                    </span>
                  </div>
                  {profile.companyName && (
                    <div className="flex items-center gap-3 text-sm">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{profile.companyName}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full">
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Permanently delete your account and all associated data.
                </p>
                <Button variant="destructive" disabled>
                  Delete Account
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Contact support to delete your account
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}