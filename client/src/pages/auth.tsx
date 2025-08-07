import React, { useState } from 'react'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { useLocation } from 'wouter'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Building2, User, ArrowLeft, Home, MapPin, Phone, FileText, Upload } from 'lucide-react'

const AuthPage: React.FC = () => {
  const { signUp, signIn, loading } = useAuth()
  const [, navigate] = useLocation()
  const [activeTab, setActiveTab] = useState('signin')
  
  // Sign in form state
  const [signInForm, setSignInForm] = useState({
    email: '',
    password: '',
  })

  // Sign up form state
  const [signUpForm, setSignUpForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'customer' as 'customer' | 'vendor' | 'professional',
    phone: '',
    // Customer fields
    customerType: 'homeowner' as 'homeowner' | 'designer' | 'contractor' | 'architect' | 'other',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    // Business fields (vendor/professional)
    businessName: '',
    einNumber: '',
    licensesCertifications: [] as string[],
    serviceAreaZipCodes: [] as string[],
    businessStreetAddress: '',
    businessCity: '',
    businessState: '',
    businessWebsite: '',
    aboutBusiness: '',
    socialLinks: [] as string[],
    materialSpecialties: [] as string[],
    businessDescription: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const result = await signIn(signInForm.email, signInForm.password)
    
    if (result.success) {
      navigate('/profile')
    }
    
    setIsSubmitting(false)
  }

  // Phone number formatting function
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '')
    
    // Apply formatting
    if (cleaned.length >= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
    } else if (cleaned.length >= 3) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
    } else {
      return cleaned
    }
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value)
    setSignUpForm(prev => ({ ...prev, phone: formatted }))
  }

  // Form validation function
  const validateForm = (): boolean => {
    // Check password confirmation
    if (signUpForm.password !== signUpForm.confirmPassword) {
      alert('Passwords do not match')
      return false
    }

    // Basic required fields for all users
    if (!signUpForm.email || !signUpForm.password || !signUpForm.name || !signUpForm.phone) {
      alert('Please fill in all required fields: Email, Password, Name, and Phone Number')
      return false
    }

    // Phone number validation - must be properly formatted
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/
    if (!phoneRegex.test(signUpForm.phone)) {
      alert('Please enter a valid phone number in format: (xxx) xxx-xxxx')
      return false
    }

    // Customer-specific validations
    if (signUpForm.role === 'customer') {
      if (!signUpForm.customerType) {
        alert('Please select a customer type')
        return false
      }
      
      // Geolocation is required for customers
      if (!signUpForm.streetAddress || !signUpForm.city || !signUpForm.state || !signUpForm.zipCode) {
        alert('Please fill in all required location fields: Street Address, City, State, and Zip Code')
        return false
      }
    }

    // Business-specific validations (vendor/professional)
    if (signUpForm.role === 'vendor' || signUpForm.role === 'professional') {
      if (!signUpForm.businessName || !signUpForm.einNumber || 
          !signUpForm.businessStreetAddress || !signUpForm.businessCity || !signUpForm.businessState) {
        alert('Please fill in all required business fields: Business Name, EIN Number, and Business Address')
        return false
      }

      // EIN format validation (xx-xxxxxxx)
      const einRegex = /^\d{2}-\d{7}$/
      if (!einRegex.test(signUpForm.einNumber)) {
        alert('Please enter EIN in format: 12-3456789')
        return false
      }

      // Service area validation - exactly 2 zip codes required for lead matching
      if (signUpForm.serviceAreaZipCodes.length !== 2) {
        alert('Please enter exactly 2 zip codes for your service area. You will receive leads from these zip codes and within 50 miles of each.')
        return false
      }

      // Validate each zip code format
      const zipCodeRegex = /^\d{5}$/
      for (const zipCode of signUpForm.serviceAreaZipCodes) {
        if (!zipCodeRegex.test(zipCode.trim())) {
          alert('Please enter valid 5-digit zip codes (example: 12345, 67890)')
          return false
        }
      }
    }

    return true
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form before submitting
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    const result = await signUp(signUpForm.email, signUpForm.password, {
      name: signUpForm.name,
      role: signUpForm.role,
      phone: signUpForm.phone,
      // Customer fields
      customer_type: signUpForm.customerType,
      street_address: signUpForm.streetAddress,
      city: signUpForm.city,
      state: signUpForm.state,
      zip_code: signUpForm.zipCode,
      // Business fields
      business_name: signUpForm.businessName,
      ein_number: signUpForm.einNumber,
      licenses_certifications: signUpForm.licensesCertifications,
      service_area_zip_codes: signUpForm.serviceAreaZipCodes,
      business_street_address: signUpForm.businessStreetAddress,
      business_city: signUpForm.businessCity,
      business_state: signUpForm.businessState,
      business_website: signUpForm.businessWebsite,
      about_business: signUpForm.aboutBusiness,
      social_links: signUpForm.socialLinks,
      material_specialties: signUpForm.materialSpecialties,
      business_description: signUpForm.businessDescription,
      service_radius: 50,
    })

    if (result.success) {
      navigate('/profile')
    }
    
    setIsSubmitting(false)
  }

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    setSignUpForm(prev => ({
      ...prev,
      materialSpecialties: checked 
        ? [...prev.materialSpecialties, specialty]
        : prev.materialSpecialties.filter(s => s !== specialty)
    }))
  }

  const handleLicenseChange = (license: string, checked: boolean) => {
    setSignUpForm(prev => ({
      ...prev,
      licensesCertifications: checked 
        ? [...prev.licensesCertifications, license]
        : prev.licensesCertifications.filter(l => l !== license)
    }))
  }

  const handleServiceAreaChange = (zipCode: string) => {
    const zipCodes = zipCode.split(',').map(z => z.trim()).filter(z => z.length > 0)
    // Limit to maximum 2 zip codes for lead matching
    const limitedZipCodes = zipCodes.slice(0, 2)
    setSignUpForm(prev => ({ ...prev, serviceAreaZipCodes: limitedZipCodes }))
  }

  const handleSocialLinksChange = (links: string) => {
    const linkArray = links.split(',').map(l => l.trim()).filter(l => l.length > 0)
    setSignUpForm(prev => ({ ...prev, socialLinks: linkArray }))
  }

  const materialOptions = [
    'Tiles', 'Stone & Slabs', 'Vinyl & LVT', 'Hardwood', 
    'Heating', 'Carpet', 'Thermostats'
  ]

  const licenseOptions = [
    'General Contractor License',
    'Specialty Contractor License', 
    'Trade License',
    'Business License',
    'Sales Tax License',
    'Professional Certification',
    'Union Certification',
    'Safety Certification',
    'Other'
  ]

  const customerTypeOptions = [
    { value: 'homeowner', label: 'Homeowner' },
    { value: 'designer', label: 'Interior Designer' },
    { value: 'contractor', label: 'Contractor' },
    { value: 'architect', label: 'Architect' },
    { value: 'other', label: 'Other' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Back to Home Navigation */}
      <div className="absolute top-4 left-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white/90"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </div>
      
      <Card className="w-full max-w-md relative">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl text-center">Comperra</CardTitle>
              <CardDescription className="text-center">
                Building Materials Comparison Platform
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="p-2 h-8 w-8"
              title="Return to Main Page"
            >
              <Home className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={signInForm.email}
                    onChange={(e) => setSignInForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={signInForm.password}
                    onChange={(e) => setSignInForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signUpForm.email}
                    onChange={(e) => setSignUpForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signUpForm.password}
                    onChange={(e) => setSignUpForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={signUpForm.confirmPassword}
                    onChange={(e) => setSignUpForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={signUpForm.name}
                    onChange={(e) => setSignUpForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Account Type</Label>
                  <Select value={signUpForm.role} onValueChange={(value: 'customer' | 'vendor' | 'professional') => 
                    setSignUpForm(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Customer
                        </div>
                      </SelectItem>
                      <SelectItem value="vendor">
                        <div className="flex items-center">
                          <Building2 className="mr-2 h-4 w-4" />
                          Vendor
                        </div>
                      </SelectItem>
                      <SelectItem value="professional">
                        <div className="flex items-center">
                          <Building2 className="mr-2 h-4 w-4" />
                          Professional
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Required Phone Number for ALL users */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={signUpForm.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    required
                    placeholder="(555) 123-4567"
                    maxLength={14}
                  />
                </div>

                {/* Customer-specific fields */}
                {signUpForm.role === 'customer' && (
                  <>
                    <div className="space-y-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2">
                        <User className="h-5 w-5 text-green-600" />
                        <Label className="text-green-800 font-semibold">Customer Information</Label>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="customer-type">Customer Type *</Label>
                        <Select value={signUpForm.customerType} onValueChange={(value: 'homeowner' | 'designer' | 'contractor' | 'architect' | 'other') => 
                          setSignUpForm(prev => ({ ...prev, customerType: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {customerTypeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-green-600" />
                          <Label className="text-green-700 font-medium">Location Information *</Label>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="street-address">Street Address *</Label>
                          <Input
                            id="street-address"
                            value={signUpForm.streetAddress}
                            onChange={(e) => setSignUpForm(prev => ({ ...prev, streetAddress: e.target.value }))}
                            placeholder="123 Main Street"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label htmlFor="city">City *</Label>
                            <Input
                              id="city"
                              value={signUpForm.city}
                              onChange={(e) => setSignUpForm(prev => ({ ...prev, city: e.target.value }))}
                              placeholder="City"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State *</Label>
                            <Input
                              id="state"
                              value={signUpForm.state}
                              onChange={(e) => setSignUpForm(prev => ({ ...prev, state: e.target.value }))}
                              placeholder="State"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="zip-code">Zip Code *</Label>
                          <Input
                            id="zip-code"
                            value={signUpForm.zipCode}
                            onChange={(e) => {
                              // Only allow numbers and limit to 5 digits
                              const value = e.target.value.replace(/\D/g, '').slice(0, 5)
                              setSignUpForm(prev => ({ ...prev, zipCode: value }))
                            }}
                            placeholder="12345"
                            required
                            maxLength={5}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Business fields for vendors and professionals */}
                {(signUpForm.role === 'vendor' || signUpForm.role === 'professional') && (
                  <>
                    <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <Label className="text-blue-800 font-semibold">Business Information</Label>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="business-name">Business Name *</Label>
                        <Input
                          id="business-name"
                          value={signUpForm.businessName}
                          onChange={(e) => setSignUpForm(prev => ({ ...prev, businessName: e.target.value }))}
                          required
                          placeholder="Your Business Name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ein-number">EIN Number *</Label>
                        <Input
                          id="ein-number"
                          value={signUpForm.einNumber}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '') // Remove non-digits
                            if (value.length >= 2) {
                              value = value.slice(0, 2) + '-' + value.slice(2, 9)
                            }
                            setSignUpForm(prev => ({ ...prev, einNumber: value }))
                          }}
                          required
                          placeholder="12-3456789"
                          maxLength={10}
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <Label className="text-blue-700 font-medium">Business Address *</Label>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="business-street-address">Street Address</Label>
                          <Input
                            id="business-street-address"
                            value={signUpForm.businessStreetAddress}
                            onChange={(e) => setSignUpForm(prev => ({ ...prev, businessStreetAddress: e.target.value }))}
                            required
                            placeholder="123 Business St"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label htmlFor="business-city">City</Label>
                            <Input
                              id="business-city"
                              value={signUpForm.businessCity}
                              onChange={(e) => setSignUpForm(prev => ({ ...prev, businessCity: e.target.value }))}
                              required
                              placeholder="City"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="business-state">State</Label>
                            <Input
                              id="business-state"
                              value={signUpForm.businessState}
                              onChange={(e) => setSignUpForm(prev => ({ ...prev, businessState: e.target.value }))}
                              required
                              placeholder="State"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <Label>License & Certifications</Label>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {licenseOptions.map((license) => (
                            <label key={license} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={signUpForm.licensesCertifications.includes(license)}
                                onChange={(e) => handleLicenseChange(license, e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-sm">{license}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="service-area">Service Area Zip Codes * (Exactly 2 Required)</Label>
                        <Input
                          id="service-area"
                          value={signUpForm.serviceAreaZipCodes.join(', ')}
                          onChange={(e) => handleServiceAreaChange(e.target.value)}
                          placeholder="12345, 67890"
                          required
                        />
                        <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                          📍 Enter exactly 2 zip codes (separated by comma). You'll receive leads from these areas and within 50 miles of each zip code.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Material Specialties</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {materialOptions.map((material) => (
                            <label key={material} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={signUpForm.materialSpecialties.includes(material)}
                                onChange={(e) => handleSpecialtyChange(material, e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-sm">{material}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-5 w-5 text-purple-600" />
                        <Label className="text-purple-800 font-semibold">Additional Business Details (Optional)</Label>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="business-website">Business Website/Portfolio</Label>
                        <Input
                          id="business-website"
                          type="url"
                          value={signUpForm.businessWebsite}
                          onChange={(e) => setSignUpForm(prev => ({ ...prev, businessWebsite: e.target.value }))}
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="about-business">About Your Business</Label>
                        <textarea
                          id="about-business"
                          value={signUpForm.aboutBusiness}
                          onChange={(e) => setSignUpForm(prev => ({ ...prev, aboutBusiness: e.target.value }))}
                          className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Tell customers about your business, experience, and services..."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="social-links">Social Media Links</Label>
                        <Input
                          id="social-links"
                          value={signUpForm.socialLinks.join(', ')}
                          onChange={(e) => handleSocialLinksChange(e.target.value)}
                          placeholder="https://facebook.com/..., https://instagram.com/..."
                        />
                        <p className="text-xs text-gray-500">Enter social media URLs separated by commas</p>
                      </div>
                    </div>
                  </>
                )}
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default AuthPage