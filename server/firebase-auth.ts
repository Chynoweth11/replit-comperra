import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase only if all required config is present
let auth: any = null;
let db: any = null;

try {
  if (process.env.VITE_FIREBASE_API_KEY && process.env.VITE_FIREBASE_PROJECT_ID && process.env.VITE_FIREBASE_APP_ID) {
    if (!getApps().length) {
      initializeApp(firebaseConfig);
    }
    auth = getAuth();
    db = getFirestore();
    console.log('✅ Firebase auth initialized successfully');
  } else {
    console.log('⚠️ Firebase auth configuration missing, auth features disabled');
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

export async function createAccount(signUpData: SignUpData): Promise<any> {
  try {
    console.log('Creating account for:', signUpData.email, 'with role:', signUpData.role);
    
    // Create account with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, signUpData.email, signUpData.password);
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

    // Save to users collection
    await setDoc(doc(db, "users", user.uid), userData);

    // Also save to role-specific collection
    if (signUpData.role === 'vendor' && signUpData.companyName) {
      await addDoc(collection(db, "vendors"), {
        uid: user.uid,
        companyName: signUpData.companyName,
        email: signUpData.email,
        phone: signUpData.phone,
        subscriptionStatus: "Active",
        plan: "Basic",
        createdAt: new Date().toISOString()
      });
    } else if (signUpData.role === 'trade') {
      await addDoc(collection(db, "trades"), {
        uid: user.uid,
        name: signUpData.name,
        trade: signUpData.customerType || "General Contractor",
        email: signUpData.email,
        phone: signUpData.phone,
        createdAt: new Date().toISOString()
      });
    } else {
      await addDoc(collection(db, "customers"), {
        uid: user.uid,
        name: signUpData.name,
        email: signUpData.email,
        phone: signUpData.phone,
        customerType: signUpData.customerType || "homeowner",
        preferences: [],
        createdAt: new Date().toISOString()
      });
    }

    console.log(`✅ Account created successfully: ${signUpData.email} (${signUpData.role})`);
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        role: signUpData.role
      }
    };
  } catch (error: any) {
    console.error('❌ Error creating account:', error);
    throw new Error(error.message || 'Failed to create account');
  }
}

export async function signInUser(signInData: SignInData): Promise<any> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, signInData.email, signInData.password);
    const user = userCredential.user;

    // Get user role from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.exists() ? userDoc.data() : null;

    console.log(`✅ User signed in successfully: ${signInData.email}`);
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        role: userData?.role || 'customer'
      }
    };
  } catch (error: any) {
    console.error('❌ Error signing in:', error);
    throw new Error(error.message || 'Failed to sign in');
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
    console.log('✅ User signed out successfully');
  } catch (error: any) {
    console.error('❌ Error signing out:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
}

export async function getCurrentUser(): Promise<any> {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe();
      if (user) {
        // Get user role from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.exists() ? userDoc.data() : null;
        
        resolve({
          uid: user.uid,
          email: user.email,
          role: userData?.role || 'customer'
        });
      } else {
        resolve(null);
      }
    });
  });
}

export { auth, db };