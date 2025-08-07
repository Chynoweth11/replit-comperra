import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured, type Profile } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, userData: Partial<Profile>) => Promise<{ success: boolean; error?: string }>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Skip if Supabase is not configured
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Database fallback authentication functions
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

      // Set user and profile from response
      setUser({ id: data.user.id, email: data.user.email } as User)
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

  const signInWithDatabase = async (email: string, password: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.message || 'Sign in failed' }
      }

      // Set user and profile from response
      setUser({ id: data.user.id, email: data.user.email } as User)
      setProfile(data.profile)

      toast({
        title: "Welcome back",
        description: "Successfully signed in",
      })

      return { success: true }
    } catch (error) {
      console.error('Database sign in error:', error)
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
    if (!isSupabaseConfigured) {
      // Fallback to local database authentication
      return await signUpWithDatabase(email, password, userData)
    }
    
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
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name: userData.name || '',
            role: userData.role || 'customer',
            phone: userData.phone,
            business_name: userData.business_name,
            zip_code: userData.zip_code,
            material_specialties: userData.material_specialties,
            business_description: userData.business_description,
            service_radius: userData.service_radius,
          })

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
    if (!isSupabaseConfigured) {
      // Fallback to local database authentication
      return await signInWithDatabase(email, password)
    }
    
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

  const signOut = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut()
      } else {
        // Database fallback signout
        await fetch('/api/auth/signout', { method: 'POST' })
      }
      
      setUser(null)
      setProfile(null)
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      })
    } catch (error) {
      console.error('Sign out error:', error)
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      })
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
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}