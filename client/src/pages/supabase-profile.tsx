import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { useLocation } from 'wouter'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  LogOut,
  Loader2,
  Save,
  Home
} from 'lucide-react'
import { formatPhoneNumber } from '@/utils/phoneFormatter'

const SupabaseProfilePage: React.FC = () => {
  const { user, profile, loading, signOut, updateProfile } = useAuth()
  const [, navigate] = useLocation()
  const [isSaving, setIsSaving] = useState(false)
  
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    businessName: '',
    zipCode: '',
    materialSpecialties: [] as string[],
    businessDescription: '',
    serviceRadius: 50,
  })

  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || '',
        phone: profile.phone || '',
        businessName: profile.business_name || '',
        zipCode: profile.zip_code || '',
        materialSpecialties: profile.material_specialties || [],
        businessDescription: profile.business_description || '',
        serviceRadius: profile.service_radius || 50,
      })
    }
  }, [profile])

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth')
    }
  }, [user, loading, navigate])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const result = await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        business_name: profileForm.businessName,
        zip_code: profileForm.zipCode,
        material_specialties: profileForm.materialSpecialties,
        business_description: profileForm.businessDescription,
        service_radius: profileForm.serviceRadius,
      })

      if (!result.success) {
        console.error('Failed to save profile:', result.error)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    setProfileForm(prev => ({
      ...prev,
      materialSpecialties: checked 
        ? [...prev.materialSpecialties, specialty]
        : prev.materialSpecialties.filter(s => s !== specialty)
    }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setProfileForm(prev => ({ ...prev, phone: formatted }))
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  const materialOptions = [
    'Tiles', 'Stone & Slabs', 'Vinyl & LVT', 'Hardwood', 
    'Heating', 'Carpet', 'Thermostats'
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{profile?.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Account Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary">
                    {profile?.role === 'vendor' ? 'Vendor' : 
                     profile?.role === 'professional' ? 'Professional' : 'Customer'}
                  </Badge>
                </div>
                {profile?.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{profile.phone}</span>
                  </div>
                )}
                {profile?.zip_code && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{profile.zip_code}</span>
                  </div>
                )}
                {profile?.business_name && (
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{profile.business_name}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your profile information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={profileForm.phone}
                          onChange={handlePhoneChange}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Business Information (for vendors/professionals) */}
                  {(profile?.role === 'vendor' || profile?.role === 'professional') && (
                    <>
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Business Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="business-name">Business Name</Label>
                            <Input
                              id="business-name"
                              value={profileForm.businessName}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, businessName: e.target.value }))}
                              placeholder="Your business name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zip-code">Primary Zip Code</Label>
                            <Input
                              id="zip-code"
                              value={profileForm.zipCode}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, zipCode: e.target.value }))}
                              placeholder="12345"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="business-description">Business Description</Label>
                          <Textarea
                            id="business-description"
                            value={profileForm.businessDescription}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, businessDescription: e.target.value }))}
                            placeholder="Describe your business and services..."
                            rows={4}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Material Specialties */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Material Specialties</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {materialOptions.map((material) => (
                            <label key={material} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={profileForm.materialSpecialties.includes(material)}
                                onChange={(e) => handleSpecialtyChange(material, e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm">{material}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Service Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Service Information</h3>
                        <div className="space-y-2">
                          <Label htmlFor="service-radius">Service Radius (miles)</Label>
                          <Select 
                            value={profileForm.serviceRadius.toString()} 
                            onValueChange={(value) => setProfileForm(prev => ({ ...prev, serviceRadius: parseInt(value) }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="25">25 miles</SelectItem>
                              <SelectItem value="50">50 miles</SelectItem>
                              <SelectItem value="75">75 miles</SelectItem>
                              <SelectItem value="100">100 miles</SelectItem>
                              <SelectItem value="150">150 miles</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Save Button */}
                  <div className="flex justify-end pt-6">
                    <Button type="submit" disabled={isSaving} className="min-w-[120px]">
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Profile
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupabaseProfilePage