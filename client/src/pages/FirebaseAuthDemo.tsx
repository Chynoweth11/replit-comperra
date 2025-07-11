import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, Phone, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function FirebaseAuthDemo() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [activeTab, setActiveTab] = useState('email');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailLinkInput, setEmailLinkInput] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<any>(null);

  // Input validation patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+[1-9]\d{1,14}$/; // E.164 format
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; // Min 8 chars, 1 letter, 1 number
  const codeRegex = /^\d{6}$/; // 6 digits

  useEffect(() => {
    // Handle email link sign-in on page load
    if (isSignInWithEmailLink(auth, window.location.href)) {
      handleEmailLinkSignIn();
    }

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(false);
      if (user) {
        await updateUserInFirestore(user);
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const showMessage = (msg: string, type: 'success' | 'error' = 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const updateUserInFirestore = async (user: User) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userData = {
        uid: user.uid,
        email: user.email,
        phoneNumber: user.phoneNumber,
        emailVerified: user.emailVerified,
        lastLogin: serverTimestamp(),
        providerId: user.providerData[0]?.providerId || 'password',
      };
      // Use setDoc with merge:true to create or update, preserving existing fields like 'role'
      await setDoc(userRef, userData, { merge: true });
    } catch (error) {
      console.error('Error updating user in Firestore:', error);
    }
  };

  const parseFirebaseError = (error: any) => {
    console.error('Detailed Firebase Error:', error);
    switch (error.code) {
      case 'auth/user-not-found': return 'No account found with this email. Please sign up.';
      case 'auth/wrong-password': return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use': return 'This email is already registered. Please sign in.';
      case 'auth/invalid-email': return 'Please enter a valid email address.';
      case 'auth/weak-password': return 'Password is too weak. Use at least 8 characters with letters and numbers.';
      case 'auth/invalid-phone-number': return 'Invalid phone number format. Please include the country code (e.g., +1).';
      case 'auth/too-many-requests': return 'Too many requests. Please try again later.';
      case 'auth/invalid-verification-code': return 'Invalid verification code. Please try again.';
      default: return 'An unknown error occurred. Please try again.';
    }
  };

  const handleEmailSignUp = async () => {
    if (!email || !password) return showMessage('Please enter both email and password.');
    if (!emailRegex.test(email)) return showMessage('Invalid email format.');
    if (!passwordRegex.test(password)) return showMessage('Password must be at least 8 characters with letters and numbers.');

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      showMessage('Account created! Please check your email to verify your account.', 'success');
    } catch (error: any) {
      showMessage(parseFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) return showMessage('Please enter both email and password.');
    if (!emailRegex.test(email)) return showMessage('Invalid email format.');

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showMessage('Successfully signed in!', 'success');
    } catch (error: any) {
      showMessage(parseFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) return showMessage('Please enter your email to reset the password.');
    if (!emailRegex.test(email)) return showMessage('Invalid email format.');

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      showMessage('Password reset link sent to your email!', 'success');
    } catch (error: any) {
      showMessage(parseFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailLink = async () => {
    if (!emailLinkInput) return showMessage('Please enter your email address.');
    if (!emailRegex.test(emailLinkInput)) return showMessage('Invalid email format.');

    setLoading(true);
    try {
      const actionCodeSettings = {
        url: window.location.href, // Redirect back to same page
        handleCodeInApp: true,
        iOS: {
          bundleId: 'com.comperra.app'
        },
        android: {
          packageName: 'com.comperra.app',
          installApp: true,
          minimumVersion: '12'
        }
      };

      await sendSignInLinkToEmail(auth, emailLinkInput, actionCodeSettings);
      localStorage.setItem('emailForSignIn', emailLinkInput);
      showMessage('Sign-in link sent to your email!', 'success');
    } catch (error: any) {
      showMessage(parseFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLinkSignIn = async () => {
    setLoading(true);
    try {
      let email = localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      }
      
      if (email) {
        await signInWithEmailLink(auth, email, window.location.href);
        localStorage.removeItem('emailForSignIn');
        // Clean the URL
        if (window.history && window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        showMessage('Successfully signed in with email link!', 'success');
      }
    } catch (error: any) {
      showMessage(parseFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showMessage('Successfully signed in with Google!', 'success');
    } catch (error: any) {
      showMessage(parseFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!recaptchaVerifier) {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => console.log('reCAPTCHA solved')
      });
      setRecaptchaVerifier(verifier);
    }
  };

  const handleSendPhoneCode = async () => {
    if (!phoneNumber) return showMessage('Please enter a phone number.');
    if (!phoneRegex.test(phoneNumber)) return showMessage('Invalid phone number format. Use +1xxxxxxxxxx.');

    if (!recaptchaVerifier) {
      setupRecaptcha();
    }

    setLoading(true);
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      setConfirmationResult(confirmationResult);
      setShowCodeInput(true);
      showMessage('Verification code sent!', 'success');
    } catch (error: any) {
      showMessage(parseFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhoneCode = async () => {
    if (!codeRegex.test(verificationCode)) return showMessage('Please enter the 6-digit code.');
    if (!confirmationResult) return showMessage('Please send a code first.');

    setLoading(true);
    try {
      await confirmationResult.confirm(verificationCode);
      showMessage('Successfully signed in with phone!', 'success');
    } catch (error: any) {
      showMessage(parseFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      showMessage('Successfully signed out!', 'success');
    } catch (error: any) {
      showMessage('Error signing out. Please try again.');
    }
  };

  if (currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Homepage
            </Button>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Welcome Back!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                <p><strong>UID:</strong> <span className="font-mono text-sm break-all">{currentUser.uid}</span></p>
                <p><strong>Email:</strong> <span className="font-mono text-sm break-all">{currentUser.email}</span> 
                  <Badge variant={currentUser.emailVerified ? "default" : "destructive"} className="ml-2">
                    {currentUser.emailVerified ? 'Verified' : 'Not Verified'}
                  </Badge>
                </p>
                <p><strong>Phone:</strong> <span className="font-mono text-sm break-all">{currentUser.phoneNumber || 'None'}</span></p>
                <p><strong>Provider:</strong> <span className="font-mono text-sm">{currentUser.providerData[0]?.providerId || 'password'}</span></p>
                <p><strong>Created:</strong> <span className="font-mono text-sm">{new Date(currentUser.metadata.creationTime || '').toLocaleDateString()}</span></p>
                <p><strong>Last Sign In:</strong> <span className="font-mono text-sm">{new Date(currentUser.metadata.lastSignInTime || '').toLocaleDateString()}</span></p>
              </div>
              <Button onClick={handleSignOut} className="w-full" variant="destructive">
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Homepage
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Firebase Complete Authentication
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in or create an account with multiple methods
            </p>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="email">Password</TabsTrigger>
                <TabsTrigger value="email-link">Email Link</TabsTrigger>
                <TabsTrigger value="phone">Phone</TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email-input">Email</Label>
                    <Input
                      id="email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password-input">Password</Label>
                    <Input
                      id="password-input"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleEmailSignIn} disabled={loading} className="flex-1">
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Sign In
                    </Button>
                    <Button onClick={handleEmailSignUp} disabled={loading} variant="outline" className="flex-1">
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Sign Up
                    </Button>
                  </div>
                  <div className="text-center">
                    <Button onClick={handlePasswordReset} disabled={loading} variant="link" className="text-sm">
                      Forgot password?
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="email-link" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email-link-input">Email Address</Label>
                    <Input
                      id="email-link-input"
                      type="email"
                      value={emailLinkInput}
                      onChange={(e) => setEmailLinkInput(e.target.value)}
                      placeholder="Enter your email"
                      disabled={loading}
                    />
                  </div>
                  <Button onClick={handleSendEmailLink} disabled={loading} className="w-full">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                    Send Magic Link
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="phone" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone-input">Phone Number</Label>
                    <Input
                      id="phone-input"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 650 555 1234"
                      disabled={loading}
                    />
                  </div>
                  <div id="recaptcha-container"></div>
                  <Button onClick={handleSendPhoneCode} disabled={loading} className="w-full">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Phone className="mr-2 h-4 w-4" />}
                    Send Verification Code
                  </Button>
                  
                  {showCodeInput && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="code-input">Verification Code</Label>
                        <Input
                          id="code-input"
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          placeholder="6-digit code"
                          disabled={loading}
                        />
                      </div>
                      <Button onClick={handleVerifyPhoneCode} disabled={loading} className="w-full">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Verify & Sign In
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="my-6 flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-400">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <Button onClick={handleGoogleSignIn} disabled={loading} variant="outline" className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Sign in with Google
            </Button>
          </CardContent>
        </Card>

        {message && (
          <div className={`p-3 rounded-md ${messageType === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center">
              {messageType === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
              )}
              <p className={`text-sm ${messageType === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {message}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}