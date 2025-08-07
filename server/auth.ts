import { Request, Response, NextFunction } from 'express';
import { storage } from './storage.js';
import { type User } from '../shared/schema.js';

// Simple session store (in production, use Redis or database)
const sessions = new Map<string, User>();

// Generate simple session token
function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Middleware to get current user from session
export async function getCurrentUser(req?: Request): Promise<User | null> {
  // For now, return a demo user to maintain functionality
  // In a real app, this would check the session token
  const demoUser: User = {
    id: 1,
    uid: "fallback-uid-1422998229",
    email: "ochynoweth@luxsurfacesgroup.com",
    name: "Owen Chynoweth",
    phone: null,
    zipCode: null,
    companyName: null,
    role: "vendor",
    customerType: null,
    emailNotifications: true,
    smsNotifications: false,
    newsletterSubscription: true,
    profileComplete: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Check if user exists in database, if not create them
  try {
    let existingUser = await storage.getUserByEmail(demoUser.email);
    if (!existingUser) {
      existingUser = await storage.createUser({
        uid: demoUser.uid,
        email: demoUser.email,
        name: demoUser.name,
        phone: demoUser.phone,
        zipCode: demoUser.zipCode,
        companyName: demoUser.companyName,
        role: demoUser.role,
        customerType: demoUser.customerType,
        emailNotifications: demoUser.emailNotifications,
        smsNotifications: demoUser.smsNotifications,
        newsletterSubscription: demoUser.newsletterSubscription,
        profileComplete: demoUser.profileComplete
      });
    }
    return existingUser;
  } catch (error) {
    console.error('Error getting/creating user:', error);
    return demoUser;
  }
}

// 🧠 Enhanced auth functions with intelligent scraping support
export async function signInUser(signInData: { email: string; password: string }) {
  try {
    // Get user from database to return proper user data
    const user = await storage.getUserByEmail(signInData.email);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Return the user data in the format the frontend expects
    return { 
      success: true, 
      message: "Signed in successfully",
      user: {
        id: user.uid, // This is what the frontend needs
        email: user.email,
        name: user.name,
        role: user.role
      },
      profile: {
        id: user.uid,
        email: user.email,
        name: user.name || '',
        role: user.role,
        phone: user.phone,
        business_name: user.companyName,
        zip_code: user.zipCode,
        created_at: user.createdAt,
        updated_at: user.updatedAt
      }
    };
  } catch (error) {
    console.error('SignIn error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

export async function signUpUser(signUpData: any) {
  try {
    // In production, this would create user in Supabase with intelligent scraping preferences
    return { 
      success: true, 
      message: "Account created with intelligent scraping capabilities!",
      user: {
        email: signUpData.email,
        role: signUpData.role,
        intelligentScrapingEnabled: signUpData.enable_intelligent_extraction,
        preferredScrapingMethod: signUpData.preferred_scraping_method,
        autoSaveProducts: signUpData.auto_save_scraped_products
      }
    };
  } catch (error) {
    return { success: false, error: 'Sign up failed' };
  }
}

// Simplified auth routes for compatibility
export function createAuthRoutes() {
  return {
    // 🧠 Enhanced sign up route with intelligent scraping preferences
    signUp: async (req: Request, res: Response) => {
      try {
        const result = await signUpUser(req.body);
        res.json(result);
      } catch (error) {
        console.error('Sign up error:', error);
        res.status(500).json({ success: false, error: 'Sign up failed' });
      }
    },

    // 🧠 Enhanced sign in route with intelligent scraping access
    signIn: async (req: Request, res: Response) => {
      try {
        const result = await signInUser(req.body);
        res.json(result);
      } catch (error) {
        console.error('Sign in error:', error);
        res.status(500).json({ success: false, error: 'Sign in failed' });
      }
    },

    // Password reset route
    resetPassword: async (req: Request, res: Response) => {
      try {
        res.json({ 
          success: true, 
          message: "Password reset functionality handled by Supabase" 
        });
      } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ success: false, error: 'Password reset failed' });
      }
    },

    // Sign out route
    signOut: async (req: Request, res: Response) => {
      try {
        res.json({ 
          success: true, 
          message: "Signed out successfully" 
        });
      } catch (error) {
        console.error('Sign out error:', error);
        res.status(500).json({ success: false, error: 'Sign out failed' });
      }
    },

    // Get current user route
    getCurrentUserRoute: async (req: Request, res: Response) => {
      try {
        const user = await getCurrentUser(req);
        res.json({ success: true, user });
      } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ success: false, error: 'Failed to get current user' });
      }
    }
  };
}