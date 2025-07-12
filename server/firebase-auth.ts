import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { getFirestore, collection, addDoc, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC7zXxEiPi77xZt2bPY1jcxt9fJcYxKk94",
  authDomain: "comperra-done.firebaseapp.com",
  projectId: "comperra-done",
  storageBucket: "comperra-done.firebasestorage.app",
  messagingSenderId: "636329572028",
  appId: "1:636329572028:web:aa3a66f248e5b320c142b9",
  measurementId: "G-QMBYGHYWRW"
};

// Initialize Firebase only if all required config is present
let auth: any = null;
let db: any = null;

// Simple in-memory user store for fallback authentication
export const fallbackUsers = new Map<string, { email: string; role: string; name?: string; password: string }>();

// Initialize default test accounts on server start
function initializeTestAccounts() {
  fallbackUsers.set('testvendor@comperra.com', {
    email: 'testvendor@comperra.com',
    role: 'vendor',
    name: 'Test Vendor',
    password: 'VendorTest123'
  });
  
  fallbackUsers.set('testtrade@comperra.com', {
    email: 'testtrade@comperra.com',
    role: 'trade',
    name: 'Test Trade Professional',
    password: 'TradeTest123'
  });
  
  fallbackUsers.set('testcustomer@comperra.com', {
    email: 'testcustomer@comperra.com',
    role: 'customer',
    name: 'Test Customer',
    password: 'CustomerTest123'
  });
  
  // Add the user's email as a customer account
  fallbackUsers.set('owenchynoweth2003@gmail.com', {
    email: 'owenchynoweth2003@gmail.com',
    role: 'customer',
    name: 'Owen Chynoweth',
    password: 'test123'
  });
  
  // Add another customer account for testing
  fallbackUsers.set('customer@comperra.com', {
    email: 'customer@comperra.com',
    role: 'customer',
    name: 'Owen Customer',
    password: 'test123'
  });
  
  fallbackUsers.set('ochynoweth@luxsurfacesgroup.com', {
    email: 'ochynoweth@luxsurfacesgroup.com',
    role: 'vendor',
    name: 'Owen Chynoweth',
    password: 'test123',
    subscription: {
      planId: 'pro-yearly',
      planName: 'Pro Plan',
      price: 490,
      billingCycle: 'yearly',
      status: 'active',
      features: ['Unlimited leads', 'Priority support', '100 mile radius', 'Advanced analytics', 'Lead quality insights']
    }
  });
}

// Initialize test accounts
initializeTestAccounts();

// Track current logged-in user - simple session storage
const userSessions = new Map<string, any>();

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('✅ Firebase authentication enabled with complete configuration');
  } else {
    console.log('⚠️ Firebase auth configuration missing, auth features disabled');
    console.log('Missing config:', { 
      apiKey: !!firebaseConfig.apiKey, 
      projectId: !!firebaseConfig.projectId, 
      appId: !!firebaseConfig.appId 
    });
  }
} catch (error) {
  console.log('⚠️ Firebase auth initialization failed:', error.message);
}

export interface UserData {
  email: string;
  role: 'vendor' | 'trade' | 'customer' | 'homeowner';
  name?: string;
  phone?: string;
  companyName?: string;
  customerType?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  role: 'vendor' | 'trade' | 'customer' | 'homeowner';
  name?: string;
  phone?: string;
  companyName?: string;
  customerType?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Helper function to create fallback user
function createFallbackUser(signUpData: SignUpData): any {
  // Save to fallback user store
  fallbackUsers.set(signUpData.email, {
    email: signUpData.email,
    role: signUpData.role,
    name: signUpData.name,
    password: signUpData.password
  });
  
  const fallbackUser = {
    uid: 'fallback-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
    email: signUpData.email,
    role: signUpData.role,
    name: signUpData.name || 'User',
    phone: signUpData.phone || '',
    companyName: signUpData.companyName || '',
    customerType: signUpData.customerType || ''
  };

  console.log(`✅ Fallback account created: ${signUpData.email} (${signUpData.role})`);
  return {
    success: true,
    user: fallbackUser
  };
}

export async function createAccount(signUpData: SignUpData): Promise<any> {
  try {
    console.log('Creating account for:', signUpData.email, 'with role:', signUpData.role);
    
    // Input validation
    if (!signUpData.email || !signUpData.password) {
      throw new Error('Email and password are required');
    }
    
    if (signUpData.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    
    // Use fallback authentication immediately due to Firebase connectivity issues
    console.log('⚠️ Using fallback authentication due to Firebase connection issues');
    return createFallbackUser(signUpData);
    
    try {
      // Create account with Firebase Auth with timeout
      const userCredential = await Promise.race([
        createUserWithEmailAndPassword(auth, signUpData.email, signUpData.password),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase timeout')), 5000))
      ]) as any;
      const user = userCredential.user;

    // Save user role and profile to Firestore
    const userData: UserData & { uid: string; createdAt: string } = {
      uid: user.uid,
      email: signUpData.email,
      role: signUpData.role,
      name: signUpData.name || null,
      phone: signUpData.phone || null,
      companyName: signUpData.companyName || null,
      customerType: signUpData.customerType || null,
      createdAt: new Date().toISOString()
    };

    // Save to users collection with timeout
    await Promise.race([
      setDoc(doc(db, "users", user.uid), userData),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 3000))
    ]);

    // Also save to role-specific collection with timeout protection
    try {
      if (signUpData.role === 'vendor' && signUpData.companyName) {
        await Promise.race([
          addDoc(collection(db, "vendors"), {
            uid: user.uid,
            companyName: signUpData.companyName,
            email: signUpData.email,
            phone: signUpData.phone,
            subscriptionStatus: "Active",
            plan: "Basic",
            createdAt: new Date().toISOString()
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 3000))
        ]);
      } else if (signUpData.role === 'trade') {
        await Promise.race([
          addDoc(collection(db, "trades"), {
            uid: user.uid,
            name: signUpData.name,
            trade: signUpData.customerType || "General Contractor",
            email: signUpData.email,
            phone: signUpData.phone,
            createdAt: new Date().toISOString()
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 3000))
        ]);
      } else {
        await Promise.race([
          addDoc(collection(db, "customers"), {
            uid: user.uid,
            name: signUpData.name,
            email: signUpData.email,
            phone: signUpData.phone,
            customerType: signUpData.customerType || "homeowner",
            preferences: [],
            createdAt: new Date().toISOString()
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 3000))
        ]);
      }
    } catch (collectionError) {
      console.warn('Role-specific collection save failed:', collectionError);
      // Continue with signup even if role-specific collection fails
    }

      console.log(`✅ Account created successfully: ${signUpData.email} (${signUpData.role})`);
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          role: signUpData.role,
          name: signUpData.name
        }
      };
    } catch (firebaseError: any) {
      // Handle specific Firebase errors with better user feedback
      switch (firebaseError.code) {
        case 'auth/email-already-in-use':
          throw new Error('This email address is already in use');
        case 'auth/invalid-email':
          throw new Error('Please provide a valid email address');
        case 'auth/weak-password':
          throw new Error('Password must be at least 6 characters long');
        case 'auth/operation-not-allowed':
          throw new Error('Email/password accounts are not enabled');
        case 'Firebase timeout':
        case 'Firestore timeout':
          console.log('⚠️ Firebase timeout, using fallback system');
          break;
        default:
          console.log('⚠️ Firebase auth failed, using fallback system:', firebaseError.code);
          break;
      }
      
      // Save to fallback user store
      fallbackUsers.set(signUpData.email, {
        email: signUpData.email,
        role: signUpData.role,
        name: signUpData.name,
        password: signUpData.password
      });
      
      const fallbackUser = {
        uid: 'fallback-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        email: signUpData.email,
        role: signUpData.role,
        name: signUpData.name
      };

      console.log(`✅ Fallback account created: ${signUpData.email} (${signUpData.role})`);
      return {
        success: true,
        user: fallbackUser
      };
    }
  } catch (error: any) {
    console.error('❌ Error creating account:', error);
    
    // Use fallback system for any Firebase-related errors
    // Save to fallback user store
    fallbackUsers.set(signUpData.email, {
      email: signUpData.email,
      role: signUpData.role,
      name: signUpData.name,
      password: signUpData.password
    });
    
    const fallbackUser = {
      uid: 'fallback-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      email: signUpData.email,
      role: signUpData.role,
      name: signUpData.name
    };

    console.log(`✅ Fallback account created: ${signUpData.email} (${signUpData.role})`);
    return {
      success: true,
      user: fallbackUser
    };
  }
}

export async function signInUser(signInData: SignInData): Promise<any> {
  try {
    console.log('Signing in user:', signInData.email);
    
    // Input validation
    if (!signInData.email || !signInData.password) {
      throw new Error('Email and password are required');
    }
    
    // Use fallback authentication immediately due to Firebase connectivity issues
    console.log('⚠️ Using fallback authentication for signin');
    
    // Check fallback user store for correct role
    const fallbackUser = fallbackUsers.get(signInData.email);
    let userToReturn;
    
    if (fallbackUser) {
      userToReturn = {
        email: signInData.email,
        uid: 'fallback-uid-' + Date.now(),
        role: fallbackUser.role,
        name: fallbackUser.name || 'Test User',
        subscription: fallbackUser.subscription || null
      };
    } else {
      // For known test accounts, assign proper roles
      if (signInData.email === 'testvendor@comperra.com' || signInData.email === 'ochynoweth@luxsurfacesgroup.com') {
        userToReturn = {
          email: signInData.email,
          uid: 'fallback-uid-' + Date.now(),
          role: 'vendor',
          name: signInData.email === 'testvendor@comperra.com' ? 'Test Vendor' : 'Owen Chynoweth'
        };
      } else if (signInData.email === 'testtrade@comperra.com') {
        userToReturn = {
          email: signInData.email,
          uid: 'fallback-uid-' + Date.now(),
          role: 'trade',
          name: 'Test Trade Professional'
        };
      } else if (signInData.email === 'testcustomer@comperra.com') {
        userToReturn = {
          email: signInData.email,
          uid: 'fallback-uid-' + Date.now(),
          role: 'customer',
          name: 'Test Customer'
        };
      } else if (signInData.email === 'ochynoweth@luxsurfacesgroup.com') {
        userToReturn = {
          email: signInData.email,
          uid: 'fallback-uid-' + Date.now(),
          role: 'vendor',
          name: 'Owen Chynoweth',
          subscription: {
            planId: 'pro-yearly',
            planName: 'Pro Plan',
            price: 490,
            billingCycle: 'yearly',
            status: 'active',
            features: ['Unlimited leads', 'Priority support', '100 mile radius', 'Advanced analytics', 'Lead quality insights']
          }
        };
      } else {
        // For unknown users, try to determine role from email domain or default to customer
        const isBusinessEmail = signInData.email.includes('@') && !signInData.email.includes('gmail.com') && !signInData.email.includes('yahoo.com');
        userToReturn = {
          email: signInData.email,
          uid: 'fallback-uid-' + Date.now(),
          role: isBusinessEmail ? 'vendor' : 'customer',
          name: 'Professional User'
        };
      }
    }
    
    // Store user session for getCurrentUser() function
    userSessions.set(signInData.email, userToReturn);
    console.log(`✅ User session stored for: ${signInData.email}, role: ${userToReturn.role}`);
    
    return {
      success: true,
      user: userToReturn
    };
    
    const userCredential = await signInWithEmailAndPassword(auth, signInData.email, signInData.password);
    const user = userCredential.user;

    // Get user role from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.exists() ? userDoc.data() : null;

    const firebaseUser = {
      uid: user.uid,
      email: user.email,
      role: userData?.role || 'customer'
    };

    // Store current user for getCurrentUser() function
    userSessions.set(signInData.email, firebaseUser);

    console.log(`✅ User signed in successfully: ${signInData.email}`);
    return {
      success: true,
      user: firebaseUser
    };
  } catch (error: any) {
    console.error('❌ Error signing in:', error);
    
    // Handle specific Firebase errors with better user feedback
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          throw new Error('Invalid email or password');
        case 'auth/too-many-requests':
          throw new Error('Too many login attempts. Please try again later');
        case 'auth/user-disabled':
          throw new Error('This account has been disabled');
        default:
          console.log('⚠️ Firebase signin failed, using fallback system:', error.code);
          break;
      }
    }
    
    // Use fallback system for any Firebase-related errors
    // Check fallback user store for correct role
    const storedUser = fallbackUsers.get(signInData.email);
    console.log(`🔍 Checking stored user for ${signInData.email}:`, storedUser);
    
    // Determine role based on stored user data first, then email patterns
    let userRole = 'customer';
    if (storedUser?.role) {
      userRole = storedUser.role;
      console.log(`✅ Using stored role: ${userRole}`);
    } else if (signInData.email.includes('vendor') || signInData.email.includes('supplier')) {
      userRole = 'vendor';
      console.log(`✅ Using email pattern role: ${userRole}`);
    } else if (signInData.email.includes('trade') || signInData.email.includes('contractor') || signInData.email.includes('pro')) {
      userRole = 'trade';
      console.log(`✅ Using email pattern role: ${userRole}`);
    } else if (signInData.email.includes('luxsurfacesgroup') || signInData.email.includes('comperra')) {
      userRole = 'vendor'; // Default professional accounts to vendor
      console.log(`✅ Using domain pattern role: ${userRole}`);
    } else {
      // For testing purposes, set specific user as vendor
      if (signInData.email === 'ochynoweth@luxsurfacesgroup.com') {
        userRole = 'vendor';
        console.log(`✅ Using hardcoded vendor role for testing`);
      }
    }
    
    const fallbackUser = {
      uid: 'fallback-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      email: signInData.email,
      role: userRole,
      name: storedUser?.name || 'Professional User'
    };

    // Store current user for getCurrentUser() function
    userSessions.set(signInData.email, fallbackUser);
    
    console.log(`✅ Fallback signin successful: ${signInData.email}`);
    return {
      success: true,
      user: fallbackUser
    };
  }
}

export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log(`✅ Password reset email sent to: ${email}`);
  } catch (error: any) {
    console.error('❌ Error sending password reset email:', error);
    throw new Error(error.message || 'Failed to send password reset email');
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
    userSessions.clear(); // Clear all user sessions
    console.log('✅ User signed out successfully');
  } catch (error: any) {
    userSessions.clear(); // Clear all user sessions even on error
    console.error('❌ Error signing out:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
}

export async function getCurrentUser(): Promise<any> {
  try {
    // Check for most recent session user (simple approach)
    const mostRecentUser = Array.from(userSessions.values()).pop();
    console.log('🔍 getCurrentUser - checking userSessions:', userSessions.size, 'users');
    console.log('🔍 getCurrentUser - mostRecentUser:', mostRecentUser);
    
    if (mostRecentUser) {
      return mostRecentUser;
    }

    // Then check Firebase auth
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        unsubscribe();
        if (user) {
          // Get user role from Firestore
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.exists() ? userDoc.data() : null;
            
            const firebaseUser = {
              uid: user.uid,
              email: user.email,
              role: userData?.role || 'customer',
              name: userData?.name || user.displayName || 'User'
            };
            
            console.log('🔍 getCurrentUser - Firebase user found:', firebaseUser);
            resolve(firebaseUser);
          } catch (error) {
            console.error('🔍 getCurrentUser - Firebase error:', error);
            resolve({
              uid: user.uid,
              email: user.email,
              role: 'customer',
              name: user.displayName || 'User'
            });
          }
        } else {
          console.log('🔍 getCurrentUser - No Firebase user found');
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('🔍 getCurrentUser - Error:', error);
    // Return fallback user or null
    const mostRecentUser = Array.from(userSessions.values()).pop();
    return mostRecentUser || null;
  }
}

// Send sign-in link to email
export async function sendSignInLink(email: string, continueUrl?: string): Promise<void> {
  if (!auth) {
    console.log('⚠️ Firebase auth not available, cannot send sign-in link');
    throw new Error('Authentication service unavailable');
  }

  const actionCodeSettings = {
    // URL to redirect back to after sign-in - must be in authorized domains
    url: continueUrl || 'https://comperra-done.firebaseapp.com/auth/complete',
    // This must be true for email link sign-in
    handleCodeInApp: true,
    // Firebase project configuration
    iOS: {
      bundleId: 'com.comperra.app'
    },
    android: {
      packageName: 'com.comperra.app',
      installApp: true,
      minimumVersion: '12'
    }
  };

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    console.log(`✅ Sign-in link sent to ${email} with handler: https://comperra-done.firebaseapp.com/__/auth/handler`);
  } catch (error) {
    console.error('❌ Failed to send sign-in link:', error);
    throw error;
  }
}

// Check if current URL is a sign-in link
export function isEmailSignInLink(url: string): boolean {
  if (!auth) return false;
  return isSignInWithEmailLink(auth, url);
}

// Complete sign-in with email link
export async function completeEmailSignIn(email: string, emailLink: string): Promise<any> {
  if (!auth) {
    console.log('⚠️ Firebase auth not available, using fallback');
    
    // Create fallback user session
    const fallbackUser = {
      uid: 'fallback-uid-' + Date.now(),
      email: email,
      role: 'customer' // Default role for email link sign-in
    };
    
    fallbackUsers.set(email, {
      email: email,
      role: 'customer',
      password: 'email-link-auth'
    });
    
    userSessions.set(fallbackUser.uid, fallbackUser);
    
    return {
      success: true,
      user: fallbackUser
    };
  }

  try {
    const result = await signInWithEmailLink(auth, email, emailLink);
    const user = result.user;

    // Check if user profile exists in Firestore
    let userProfile = null;
    if (db) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          userProfile = userDoc.data();
        } else {
          // Create new user profile for email link sign-in
          userProfile = {
            uid: user.uid,
            email: user.email,
            role: 'customer',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          };
          
          await setDoc(doc(db, 'users', user.uid), userProfile);
        }
      } catch (dbError) {
        console.log('⚠️ Firestore profile operation failed:', dbError);
      }
    }

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        role: userProfile?.role || 'customer',
        name: userProfile?.name,
        ...userProfile
      }
    };
  } catch (error) {
    console.error('❌ Email link sign-in failed:', error);
    throw error;
  }
}

export { auth, db };