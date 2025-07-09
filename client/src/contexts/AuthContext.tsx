import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
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
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signUpData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      // Save user to localStorage and state
      const userData = {
        uid: data.user.uid,
        email: data.user.email,
        role: data.user.role,
        name: data.user.name
      };
      
      localStorage.setItem('comperra-user', JSON.stringify(userData));
      setUser(userData);
      setUserProfile(userData);

      // Always redirect to homepage after signup
      window.location.href = '/';
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      // Save user to localStorage and state
      const userData = {
        uid: data.user.uid,
        email: data.user.email,
        role: data.user.role,
        name: data.user.name
      };
      
      localStorage.setItem('comperra-user', JSON.stringify(userData));
      setUser(userData);
      setUserProfile(userData);

      // Always redirect to homepage after signin
      window.location.href = '/';
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async function signOut() {
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
      });

      localStorage.removeItem('comperra-user');
      setUser(null);
      setUserProfile(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  async function resetPassword(email: string) {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Password reset error:', error);
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
      resetPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
export type { SignUpData, CompanyUser };