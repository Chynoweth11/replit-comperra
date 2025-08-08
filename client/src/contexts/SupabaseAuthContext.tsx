import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import type { Profile } from '@/lib/supabase';

interface SupabaseAuthContextType {
  user: any;
  profile: Profile | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  // Keep existing methods for backward compatibility
  signUp: (email: string, password: string, userData: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
}

export const SupabaseAuthContext = createContext<SupabaseAuthContextType | null>(null);

// Backward compatibility alias
export const useAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (!context) throw new Error('useAuth must be used within SupabaseAuthProvider');
  return context;
};

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (!context) throw new Error('useSupabaseAuth must be used within SupabaseAuthProvider');
  return context;
};

export const SupabaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
    setLocation('/');
    toast({
      title: "Signed out",
      description: "You have been successfully signed out",
    });
  };

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    };

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN') {
        setLocation('/');
        toast({
          title: "Welcome!",
          description: "Successfully signed in",
        });
      }
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    getSession();

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [setLocation, toast]);

  // Keep existing methods for backward compatibility
  const signUpWithDatabase = async (email: string, password: string, userData: Partial<Profile>) => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name: userData.name,
          role: userData.role || 'customer',
          phone: userData.phone,
          businessName: userData.business_name,
          zipCode: userData.zip_code,
          materialSpecialties: userData.material_specialties || [],
          businessDescription: userData.business_description,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.message || 'Sign up failed' }
      }

      setUser({ id: data.user.id, email: data.user.email })
      setProfile(data.profile)

      toast({
        title: "Welcome to Comperra!",
        description: "Your account has been created successfully",
      })

      return { success: true }
    } catch (error) {
      console.error('Database sign up error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        })
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData: Partial<Profile>) => {
    try {
      setLoading(true)
      
      // Sign up user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Create profile with geocoding support
        const profileData: any = {
          id: data.user.id,
          email: data.user.email!,
          name: userData.name || '',
          role: userData.role || 'customer',
          phone: userData.phone,
          // Customer fields
          customer_type: userData.customer_type,
          street_address: userData.street_address,
          city: userData.city,
          state: userData.state,
          zip_code: userData.zip_code,
          // Business fields
          business_name: userData.business_name,
          ein_number: userData.ein_number,
          licenses_certifications: userData.licenses_certifications,
          service_area_zip_codes: userData.service_area_zip_codes,
          business_street_address: userData.business_street_address,
          business_city: userData.business_city,
          business_state: userData.business_state,
          business_website: userData.business_website,
          about_business: userData.about_business,
          social_links: userData.social_links,
          material_specialties: userData.material_specialties,
          business_description: userData.business_description,
          service_radius: userData.service_radius,
          formatted_address: userData.formatted_address,
        }

        // Add PostGIS Point location if coordinates are provided
        if (userData.latitude && userData.longitude) {
          profileData.location = `SRID=4326;POINT(${userData.longitude} ${userData.latitude})`
          console.log('🌍 Adding PostGIS location:', profileData.location)
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .insert(profileData)

        if (profileError) {
          console.error('Error creating profile:', profileError)
          return { success: false, error: 'Failed to create user profile' }
        }

        toast({
          title: "Account created",
          description: "Please check your email to verify your account",
        })
      }

      return { success: true }
    } catch (error) {
      console.error('Sign up error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      toast({
        title: "Welcome back",
        description: "Successfully signed in",
      })

      return { success: true }
    } catch (error) {
      console.error('Sign in error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }


  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { success: false, error: 'Not authenticated' }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error updating profile:', error)
        return { success: false, error: error.message }
      }

      // Refresh profile data
      await fetchProfile(user.id)
      
      toast({
        title: "Successfully saved",
        description: "Your profile has been updated",
      })

      return { success: true }
    } catch (error) {
      console.error('Update profile error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const value = {
    user,
    profile,
    signInWithGoogle,
    signOut,
    loading,
    // Keep existing methods for backward compatibility
    signUp,
    signIn,
    updateProfile,
  }

  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>
}

// Backward compatibility: Export AuthProvider as alias
export const AuthProvider = SupabaseAuthProvider;