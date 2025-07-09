import { createContext, useContext, useEffect, useState } from 'react';
// Firebase auth temporarily disabled - using fallback system
// import { onAuthStateChanged, User } from 'firebase/auth';
// import { auth } from '@/lib/firebase';

interface User {
  uid: string;
  email: string;
}

interface CompanyUser {
  uid: string;
  email: string;
  role: 'vendor' | 'trade' | 'customer' | 'homeowner';
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
    // Check for existing user session in localStorage
    const savedUser = localStorage.getItem('comperra-user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setUserProfile(userData);
      } catch (error) {
        console.error('Error parsing saved user:', error);
      }
    }
    setLoading(false);
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