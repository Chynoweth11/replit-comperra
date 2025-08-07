import React, { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Mail, Phone, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

interface EnhancedAuthFormProps {
  mode: 'signin' | 'signup';
  onToggleMode: () => void;
}

export default function EnhancedAuthForm({ mode, onToggleMode }: EnhancedAuthFormProps) {
  const { signUp, signIn, resetPassword, sendSignInLink, signInWithGoogle, sendPhoneVerification, verifyPhoneCode } = useAuth();
  
  const [activeTab, setActiveTab] = useState('email');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [showPassword, setShowPassword] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    verificationCode: '',
    role: 'customer' as 'vendor' | 'trade' | 'customer' | 'homeowner',
    name: '',
    companyName: '',
    customerType: ''
  });

  // Validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  const phoneRegex = /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
  const codeRegex = /^\d{6}$/;

  const showMessage = (msg: string, type: 'success' | 'error' = 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const parseFirebaseError = (error: any): string => {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 8 characters with letters and numbers.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/operation-not-allowed':
        return 'This sign-in method is not enabled.';
      case 'auth/invalid-phone-number':
        return 'Please enter a valid phone number.';
      case 'auth/invalid-verification-code':
        return 'Invalid verification code. Please try again.';
      case 'auth/code-expired':
        return 'Verification code has expired. Please request a new one.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  };

  const handleEmailSignUp = async () => {
    if (!emailRegex.test(formData.email)) return showMessage('Please enter a valid email address.');
    if (!passwordRegex.test(formData.password)) return showMessage('Password must be at least 8 characters with letters and numbers.');
    if (formData.password !== formData.confirmPassword) return showMessage('Passwords do not match.');

    setLoading(true);
    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        role: formData.role,
        name: formData.name,
        companyName: formData.companyName,
        customerType: formData.customerType
      });
      showMessage('Account created successfully! Please verify your email.', 'success');
    } catch (error: any) {
      showMessage(parseFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!emailRegex.test(formData.email)) return showMessage('Please enter a valid email address.');
    if (!formData.password) return showMessage('Please enter your password.');

    setLoading(true);
    try {
      const userResult = await signIn(formData.email, formData.password);
      showMessage('Signed in successfully! Redirecting...', 'success');
      
      // Handle redirect based on user role
      setTimeout(() => {
        if (userResult?.role === 'vendor') {
          window.location.href = '/vendor-dashboard';
        } else if (userResult?.role === 'trade') {
          window.location.href = '/trade-dashboard';
        } else {
          window.location.href = '/dashboard';
        }
      }, 1500);
    } catch (error: any) {
      showMessage(parseFirebaseError(error));
      setLoading(false);
    }
  };

  const handleEmailLinkSignIn = async () => {
    if (!emailRegex.test(formData.email)) return showMessage('Please enter a valid email address.');

    setLoading(true);
    try {
      await sendSignInLink(formData.email);
      showMessage('Sign-in link sent! Check your email.', 'success');
    } catch (error: any) {
      showMessage(parseFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      showMessage('Google sign-in successful!', 'success');
    } catch (error: any) {
      showMessage(parseFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSignIn = async () => {
    if (!phoneRegex.test(formData.phone)) return showMessage('Please enter a valid phone number.');

    setLoading(true);
    try {
      const result = await sendPhoneVerification(formData.phone);
      setConfirmationResult(result);
      setShowCodeInput(true);
      showMessage('Verification code sent!', 'success');
    } catch (error: any) {
      showMessage(parseFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhoneCode = async () => {
    if (!codeRegex.test(formData.verificationCode)) return showMessage('Please enter the 6-digit code.');
    if (!confirmationResult) return showMessage('Please send a code first.');

    setLoading(true);
    try {
      await verifyPhoneCode(confirmationResult, formData.verificationCode);
      showMessage('Phone verification successful!', 'success');
    } catch (error: any) {
      showMessage(parseFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!emailRegex.test(formData.email)) return showMessage('Please enter a valid email address.');

    setLoading(true);
    try {
      await resetPassword(formData.email);
      showMessage('Password reset email sent!', 'success');
    } catch (error: any) {
      showMessage(parseFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            {mode === 'signin' ? 'Access your account with multiple methods' : 'Join Comperra with your preferred method'}
          </p>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert className={`mb-4 ${messageType === 'success' ? 'border-green-500' : 'border-red-500'}`}>
              {messageType === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="emailLink">Link</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
              <TabsTrigger value="google">Google</TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {mode === 'signup' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Account Type</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value as any})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                        <SelectItem value="trade">Trade Professional</SelectItem>
                        <SelectItem value="homeowner">Homeowner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>

                  {(formData.role === 'vendor' || formData.role === 'trade') && (
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        placeholder="Enter your company name"
                        value={formData.companyName}
                        onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      />
                    </div>
                  )}

                  {formData.role === 'customer' && (
                    <div className="space-y-2">
                      <Label htmlFor="customerType">Customer Type</Label>
                      <Select value={formData.customerType} onValueChange={(value) => setFormData({...formData, customerType: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="homeowner">Homeowner</SelectItem>
                          <SelectItem value="designer">Designer</SelectItem>
                          <SelectItem value="architect">Architect</SelectItem>
                          <SelectItem value="contractor">Contractor</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}

              <Button 
                onClick={mode === 'signin' ? handleEmailSignIn : handleEmailSignUp}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </Button>

              {mode === 'signin' && (
                <Button 
                  onClick={handleResetPassword}
                  variant="link"
                  className="w-full"
                >
                  Forgot Password?
                </Button>
              )}
            </TabsContent>

            <TabsContent value="emailLink" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailLink">Email</Label>
                <Input
                  id="emailLink"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <Button 
                onClick={handleEmailLinkSignIn}
                disabled={loading}
                className="w-full"
              >
                <Mail className="mr-2 h-4 w-4" />
                {loading ? 'Sending...' : 'Send Sign-in Link'}
              </Button>
            </TabsContent>

            <TabsContent value="phone" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              
              {!showCodeInput ? (
                <Button 
                  onClick={handlePhoneSignIn}
                  disabled={loading}
                  className="w-full"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </Button>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="verificationCode">Verification Code</Label>
                    <Input
                      id="verificationCode"
                      placeholder="Enter 6-digit code"
                      value={formData.verificationCode}
                      onChange={(e) => setFormData({...formData, verificationCode: e.target.value})}
                    />
                  </div>
                  <Button 
                    onClick={handleVerifyPhoneCode}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </Button>
                </>
              )}
              
            </TabsContent>

            <TabsContent value="google" className="space-y-4">
              <Button 
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? 'Signing in...' : 'Continue with Google'}
              </Button>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
              <Button 
                variant="link" 
                onClick={onToggleMode}
                className="ml-1 p-0 h-auto font-medium"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}