/**
 * Comprehensive session management utility
 * Handles authentication state persistence across all portals
 */

export interface SessionUser {
  uid: string;
  email: string;
  role: 'vendor' | 'trade' | 'customer' | 'homeowner';
  name?: string;
  phone?: string;
  companyName?: string;
  customerType?: string;
  subscription?: any;
}

export class SessionManager {
  private static instance: SessionManager;
  private sessionKey = 'comperra-user';
  private sessionTimeKey = 'comperra-session-time';
  private lastActivityKey = 'comperra-last-activity';
  
  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Save user session to localStorage with timestamp
   */
  public saveSession(user: SessionUser): void {
    try {
      const now = Date.now();
      localStorage.setItem(this.sessionKey, JSON.stringify(user));
      localStorage.setItem(this.sessionTimeKey, now.toString());
      localStorage.setItem(this.lastActivityKey, now.toString());
      console.log('✅ Session saved for user:', user.email);
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  /**
   * Get user session from localStorage
   */
  public getSession(): SessionUser | null {
    try {
      const userData = localStorage.getItem(this.sessionKey);
      const sessionTime = localStorage.getItem(this.sessionTimeKey);
      
      if (!userData || !sessionTime) {
        return null;
      }

      const user = JSON.parse(userData);
      const sessionAge = Date.now() - parseInt(sessionTime);
      
      // Session valid for 24 hours
      if (sessionAge < 24 * 60 * 60 * 1000) {
        this.updateLastActivity();
        return user;
      } else {
        console.log('⚠️ Session expired, clearing');
        this.clearSession();
        return null;
      }
    } catch (error) {
      console.error('Failed to get session:', error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Update last activity timestamp
   */
  public updateLastActivity(): void {
    try {
      localStorage.setItem(this.lastActivityKey, Date.now().toString());
    } catch (error) {
      console.error('Failed to update last activity:', error);
    }
  }

  /**
   * Check if session is valid
   */
  public isSessionValid(): boolean {
    const user = this.getSession();
    return user !== null;
  }

  /**
   * Clear session from localStorage
   */
  public clearSession(): void {
    try {
      localStorage.removeItem(this.sessionKey);
      localStorage.removeItem(this.sessionTimeKey);
      localStorage.removeItem(this.lastActivityKey);
      console.log('✅ Session cleared');
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  /**
   * Get session age in milliseconds
   */
  public getSessionAge(): number {
    try {
      const sessionTime = localStorage.getItem(this.sessionTimeKey);
      if (!sessionTime) return Infinity;
      return Date.now() - parseInt(sessionTime);
    } catch (error) {
      return Infinity;
    }
  }

  /**
   * Refresh session timestamp
   */
  public refreshSession(): void {
    try {
      const user = this.getSession();
      if (user) {
        this.saveSession(user);
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
  }

  /**
   * Check if user has specific role
   */
  public hasRole(role: string): boolean {
    const user = this.getSession();
    return user ? user.role === role : false;
  }

  /**
   * Get redirect URL based on user role
   */
  public getRedirectUrl(user: SessionUser): string {
    switch (user.role) {
      case 'vendor':
        return '/vendor-dashboard';
      case 'trade':
        return '/trade-dashboard';
      case 'customer':
      case 'homeowner':
        return '/dashboard';
      default:
        return '/';
    }
  }

  /**
   * Validate session and redirect if needed
   */
  public validateAndRedirect(requiredRole?: string): SessionUser | null {
    const user = this.getSession();
    
    if (!user) {
      console.log('⚠️ No valid session, redirecting to signin');
      window.location.href = '/auth?tab=signin';
      return null;
    }

    if (requiredRole && user.role !== requiredRole) {
      console.log(`⚠️ User role ${user.role} doesn't match required ${requiredRole}`);
      window.location.href = this.getRedirectUrl(user);
      return null;
    }

    return user;
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();