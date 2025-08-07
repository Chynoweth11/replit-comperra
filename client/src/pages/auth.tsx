import React, { useState } from 'react'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { useLocation } from 'wouter'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Building2, User, ArrowLeft, Home } from 'lucide-react'

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
    businessName: '',
    zipCode: '',
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (signUpForm.password !== signUpForm.confirmPassword) {
      return
    }

    setIsSubmitting(true)

    const result = await signUp(signUpForm.email, signUpForm.password, {
      name: signUpForm.name,
      role: signUpForm.role,
      phone: signUpForm.phone,
      business_name: signUpForm.businessName,
      zip_code: signUpForm.zipCode,
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

  const materialOptions = [
    'Tiles', 'Stone & Slabs', 'Vinyl & LVT', 'Hardwood', 
    'Heating', 'Carpet', 'Thermostats'
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
                
                {(signUpForm.role === 'vendor' || signUpForm.role === 'professional') && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="business-name">Business Name</Label>
                      <Input
                        id="business-name"
                        value={signUpForm.businessName}
                        onChange={(e) => setSignUpForm(prev => ({ ...prev, businessName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={signUpForm.phone}
                        onChange={(e) => setSignUpForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip-code">Zip Code</Label>
                      <Input
                        id="zip-code"
                        value={signUpForm.zipCode}
                        onChange={(e) => setSignUpForm(prev => ({ ...prev, zipCode: e.target.value }))}
                      />
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