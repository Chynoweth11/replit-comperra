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

  useEffect(() => {
    // Clear localStorage and fetch fresh user data on app start
    localStorage.removeItem('comperra-user');
    
    // Check current user from server
    const checkCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/current-user');
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
          setUserProfile(data.user);
          localStorage.setItem('comperra-user', JSON.stringify(data.user));
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
      setLoading(false);
    };
    
    checkCurrentUser();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // First try to get user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as CompanyUser;
            setUserProfile(userData);
            localStorage.setItem('comperra-user', JSON.stringify(userData));
          } else {
            // Fallback to API endpoint if no Firestore data
            const response = await fetch('/api/auth/current-user');
            const data = await response.json();
            if (data.success && data.user) {
              setUserProfile(data.user);
              localStorage.setItem('comperra-user', JSON.stringify(data.user));
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
        localStorage.removeItem('comperra-user');
      }
      
      setLoading(false);
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

      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, signUpData.email, signUpData.password);
      
      // Save user profile to Firestore
      await saveUserToFirestore(userCredential.user, {
        role: signUpData.role,
        name: signUpData.name,
        phone: signUpData.phone,
        companyName: signUpData.companyName,
        customerType: signUpData.customerType,
        signInMethod: 'email',
        createdAt: serverTimestamp()
      });
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      console.log('✅ Sign up successful');
      
      // Redirect to homepage after signup
      window.location.href = '/';
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

      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update user profile in Firestore
      await saveUserToFirestore(userCredential.user, {
        signInMethod: 'email'
      });
      
      console.log('✅ Sign in successful');
      
      // Redirect to homepage after signin
      window.location.href = '/';
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async function signOut() {
    try {
      // Sign out with Firebase Auth
      await firebaseSignOut(auth);
      
      localStorage.removeItem('comperra-user');
      setUser(null);
      setUserProfile(null);
      
      console.log('✅ Sign out successful');
      window.location.href = '/';
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw error;
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
      verifyPhoneCode
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
export type { SignUpData, CompanyUser };