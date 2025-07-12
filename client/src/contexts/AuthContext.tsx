import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  isSignInWithEmailLink, 
  signInWithEmailLink, 
  sendSignInLinkToEmail,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendEmailVerification
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { sessionManager } from '@/utils/sessionManager';

interface CompanyUser {
  uid: string;
  email: string;
  role: 'vendor' | 'trade' | 'customer' | 'homeowner';
  name?: string;
  phone?: string;
  companyName?: string;
  customerType?: string;
  businessName?: string;
  brandAffiliation?: string;
  licenseNumber?: string;
  serviceRadius?: number;
  specialty?: string;
  zipCode?: string;
  budget?: number;
  projectDetails?: string;
  productCategories?: string[];
}

interface AuthContextType {
  user: User | null;
  userProfile: CompanyUser | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendSignInLink: (email: string, continueUrl?: string) => Promise<void>;
  completeEmailSignIn: (email: string) => Promise<void>;
  isSignInLink: (url: string) => boolean;
  signInWithGoogle: () => Promise<void>;
  sendPhoneVerification: (phoneNumber: string) => Promise<any>;
  verifyPhoneCode: (verificationId: string, code: string) => Promise<void>;
  clearAuthCache: () => void;
}

interface SignUpData {
  email: string;
  password: string;
  role: 'vendor' | 'trade' | 'customer' | 'homeowner';
  name?: string;
  phone?: string;
  companyName?: string;
  customerType?: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  sendSignInLink: async () => {},
  completeEmailSignIn: async () => {},
  isSignInLink: () => false,
  signInWithGoogle: async () => {},
  sendPhoneVerification: async () => {},
  verifyPhoneCode: async () => {},
  clearAuthCache: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<CompanyUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Function to clear localStorage and force fresh auth
  const clearAuthCache = () => {
    sessionManager.clearSession();
    localStorage.removeItem('comperra-last-check');
    setUser(null);
    setUserProfile(null);
  };

  // Enhanced session restoration with timeout checks
  const restoreSession = () => {
    try {
      const userData = sessionManager.getSession();
      
      if (userData) {
        // Check for known accounts with correct roles
        const knownAccounts = {
          'testvendor@comperra.com': 'vendor',
          'testtrade@comperra.com': 'trade',
          'testcustomer@comperra.com': 'customer',
          'ochynoweth@luxsurfacesgroup.com': 'vendor',
          'owenchynoweth2003@gmail.com': 'vendor'
        };
        
        const expectedRole = knownAccounts[userData.email];
        if (expectedRole && userData.role !== expectedRole) {
          console.log('⚠️ Role mismatch detected, clearing cache');
          clearAuthCache();
          return false;
        }
        
        setUser(userData);
        setUserProfile(userData);
        console.log('✅ Restored user session from sessionManager:', userData);
        return true;
      }
    } catch (error) {
      console.error('Error restoring session:', error);
      clearAuthCache();
    }
    return false;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      // First try to restore from localStorage
      const hasSession = restoreSession();
      
      // Check server for current user status
      try {
        const response = await fetch('/api/auth/current-user');
        const data = await response.json();
        
        if (data.success && data.user && !isSigningOut) {
          // Server has a valid session
          setUser(data.user);
          setUserProfile(data.user);
          
          // Update localStorage with fresh data
          localStorage.setItem('comperra-user', JSON.stringify(data.user));
          localStorage.setItem('comperra-session-time', Date.now().toString());
          
          console.log('✅ Server session validated:', data.user);
        } else if (!hasSession) {
          // No session anywhere, clear everything
          clearAuthCache();
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error checking server session:', error);
        // If server check fails but we have a valid localStorage session, keep it
        if (!hasSession) {
          setUser(null);
          setUserProfile(null);
        }
      }
      setLoading(false);
    };
    
    initializeAuth();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Try to get user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as CompanyUser;
            setUserProfile(userData);
            localStorage.setItem('comperra-user', JSON.stringify(userData));
            console.log('✅ Firebase user profile loaded:', userData);
          } else {
            // Fallback to API endpoint if no Firestore data
            const response = await fetch('/api/auth/current-user');
            const data = await response.json();
            if (data.success && data.user) {
              setUserProfile(data.user);
              localStorage.setItem('comperra-user', JSON.stringify(data.user));
              console.log('✅ API user profile loaded:', data.user);
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        // Only clear state if no stored session exists
        if (!localStorage.getItem('comperra-user')) {
          setUser(null);
          setUserProfile(null);
        }
      }
    });

    return unsubscribe;
  }, []);

  async function signUp(signUpData: SignUpData) {
    try {
      // Input validation
      if (!signUpData.email || !signUpData.password) {
        throw new Error('Email and password are required');
      }
      
      if (signUpData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      if (!/(?=.*[A-Za-z])(?=.*\d)/.test(signUpData.password)) {
        throw new Error('Password must contain at least one letter and one number');
      }

      // Try Firebase Auth first
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, signUpData.email, signUpData.password);
        
        // Save user profile to Firestore (with error handling)
        try {
          await saveUserToFirestore(userCredential.user, {
            role: signUpData.role,
            name: signUpData.name,
            phone: signUpData.phone,
            companyName: signUpData.companyName,
            customerType: signUpData.customerType,
            signInMethod: 'email',
            createdAt: serverTimestamp()
          });
        } catch (firestoreError) {
          console.warn('Firestore save failed, user still created:', firestoreError);
          // Continue with signup even if Firestore fails
        }
        
        // Send email verification
        await sendEmailVerification(userCredential.user);
        
        console.log('✅ Firebase sign up successful');
        
        // Redirect to homepage after signup
        window.location.href = '/';
        return;
      } catch (firebaseError: any) {
        console.warn('Firebase signup failed, trying fallback:', firebaseError);
        
        // Fallback to API-based authentication
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(signUpData),
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Set user state from API response
          setUser(result.user);
          setUserProfile(result.user);
          localStorage.setItem('comperra-user', JSON.stringify(result.user));
          localStorage.setItem('comperra-session-time', Date.now().toString());
          
          console.log('✅ Fallback sign up successful, user:', result.user);
          
          // Small delay to ensure state is set before redirect
          setTimeout(() => {
            // Redirect based on user role
            if (result.user.role === 'vendor') {
              window.location.href = '/vendor-dashboard';
            } else if (result.user.role === 'trade') {
              window.location.href = '/trade-dashboard';
            } else {
              window.location.href = '/dashboard';
            }
          }, 100);
        } else {
          throw new Error(result.message || 'Account creation failed');
        }
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async function signIn(email: string, password: string) {
    try {
      // Input validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Try Firebase Auth first
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Update user profile in Firestore (with error handling)
        try {
          await saveUserToFirestore(userCredential.user, {
            signInMethod: 'email'
          });
        } catch (firestoreError) {
          console.warn('Firestore update failed, signin still successful:', firestoreError);
          // Continue with signin even if Firestore fails
        }
        
        console.log('✅ Firebase sign in successful');
        
        // Get user role from Firebase and redirect accordingly
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        const userData = userDoc.exists() ? userDoc.data() : null;
        const userRole = userData?.role || 'customer';
        
        // Redirect based on user role
        if (userRole === 'vendor') {
          window.location.href = '/vendor-dashboard';
        } else if (userRole === 'trade') {
          window.location.href = '/trade-dashboard';
        } else {
          window.location.href = '/dashboard';
        }
        return;
      } catch (firebaseError: any) {
        console.warn('Firebase signin failed, trying fallback:', firebaseError);
        
        // Fallback to API-based authentication
        const response = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Set user state from API response
          setUser(result.user);
          setUserProfile(result.user);
          
          // Use sessionManager for reliable session management
          sessionManager.saveSession(result.user);
          
          console.log('✅ Fallback sign in successful, user:', result.user);
          
          // Use a more reliable redirect approach
          setTimeout(() => {
            // Redirect based on user role
            if (result.user.role === 'vendor') {
              window.location.href = '/vendor-dashboard';
            } else if (result.user.role === 'trade') {
              window.location.href = '/trade-dashboard';
            } else {
              window.location.href = '/dashboard';
            }
          }, 750); // Longer delay to ensure state is fully committed
        } else {
          throw new Error(result.message || 'Authentication failed');
        }
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async function signOut() {
    try {
      setIsSigningOut(true);
      
      // Clear server session first
      try {
        await fetch('/api/auth/signout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.warn('Server signout failed:', error);
      }
      
      // Clear Firebase session
      try {
        await firebaseSignOut(auth);
      } catch (error) {
        console.warn('Firebase signout failed:', error);
      }
      
      // Clear all local storage and state
      sessionManager.clearSession();
      clearAuthCache();
      setUser(null);
      setUserProfile(null);
      
      console.log('✅ Complete signout successful');
      
      // Redirect to homepage
      window.location.href = '/';
      
    } catch (error: any) {
      console.error('Sign out error:', error);
      // Even if signout fails, clear local state
      clearAuthCache();
      setUser(null);
      setUserProfile(null);
      window.location.href = '/';
    } finally {
      setIsSigningOut(false);
    }
  }

  async function resetPassword(email: string) {
    try {
      // Input validation
      if (!email) {
        throw new Error('Email is required');
      }

      // Send password reset email with Firebase Auth
      await sendPasswordResetEmail(auth, email);
      
      console.log('✅ Password reset email sent');
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  async function sendSignInLink(email: string, continueUrl?: string) {
    try {
      // Use Firebase's own action code settings for proper email link generation
      const actionCodeSettings = {
        url: continueUrl || 'https://comperra-done.firebaseapp.com/auth/complete',
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

      // Send directly through Firebase client SDK for better handling
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      
      // Store email for completion
      localStorage.setItem('emailForSignIn', email);
      
      console.log('✅ Sign-in link sent successfully via Firebase');
    } catch (error: any) {
      console.error('Send sign-in link error:', error);
      
      // Fallback to server endpoint if direct Firebase call fails
      try {
        const response = await fetch('/api/auth/send-sign-in-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, continueUrl }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error);
        }

        // Store email for completion
        localStorage.setItem('emailForSignIn', email);
      } catch (fallbackError) {
        console.error('Fallback send sign-in link error:', fallbackError);
        throw error; // Throw original error
      }
    }
  }

  async function completeEmailSignIn(email: string) {
    try {
      // Complete email sign-in with Firebase Auth
      const userCredential = await signInWithEmailLink(auth, email, window.location.href);
      
      // Save user profile to Firestore
      await saveUserToFirestore(userCredential.user, {
        role: 'customer', // Default role, can be updated later
        signInMethod: 'emailLink'
      });
      
      // Clear stored email
      localStorage.removeItem('emailForSignIn');
      
      console.log('✅ Email link sign-in successful');
      
      // Redirect to homepage after successful sign-in
      window.location.href = '/';
    } catch (error: any) {
      console.error('Complete email sign-in error:', error);
      throw error;
    }
  }

  function isSignInLink(url: string): boolean {
    return isSignInWithEmailLink(auth, url);
  }

  // Helper function to save user profile to Firestore
  async function saveUserToFirestore(user: User, additionalData: any = {}) {
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastSignInTime: serverTimestamp(),
        ...additionalData
      }, { merge: true });
    } catch (error) {
      console.error('Error saving user to Firestore:', error);
    }
  }

  // Google Sign-In
  async function signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Save user profile to Firestore
      await saveUserToFirestore(result.user, {
        role: 'customer', // Default role, can be updated later
        signInMethod: 'google'
      });
      
      // Send email verification if not verified
      if (!result.user.emailVerified) {
        await sendEmailVerification(result.user);
      }
      
      console.log('✅ Google sign-in successful');
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

  // Phone Verification
  async function sendPhoneVerification(phoneNumber: string) {
    try {
      // Initialize reCAPTCHA verifier
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA solved');
        }
      });

      // Send verification code
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      console.log('✅ Phone verification code sent');
      return confirmationResult;
    } catch (error: any) {
      console.error('Phone verification error:', error);
      throw error;
    }
  }

  // Verify Phone Code
  async function verifyPhoneCode(verificationId: string, code: string) {
    try {
      const confirmationResult = verificationId;
      await confirmationResult.confirm(code);
      
      // Save user profile to Firestore
      if (auth.currentUser) {
        await saveUserToFirestore(auth.currentUser, {
          role: 'customer', // Default role
          signInMethod: 'phone'
        });
      }
      
      console.log('✅ Phone verification successful');
    } catch (error: any) {
      console.error('Phone verification error:', error);
      throw error;
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      signUp, 
      signIn, 
      signOut, 
      resetPassword,
      sendSignInLink,
      completeEmailSignIn,
      isSignInLink,
      signInWithGoogle,
      sendPhoneVerification,
      verifyPhoneCode,
      clearAuthCache
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
export type { SignUpData, CompanyUser };