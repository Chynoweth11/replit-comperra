import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

/**
 * Hook to ensure authentication sessions persist across page reloads
 * and prevent users from being logged out unexpectedly
 */
export const useSessionPersistence = () => {
  const { user, userProfile } = useAuth();
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    // Update last activity on user interaction
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      localStorage.setItem('comperra-last-activity', Date.now().toString());
    };

    // Track user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Periodic session validation
    const validateSession = async () => {
      try {
        // Skip validation if user is not authenticated
        if (!user || !userProfile) return;

        const sessionTime = localStorage.getItem('comperra-session-time');
        const lastActivity = localStorage.getItem('comperra-last-activity');
        
        if (!sessionTime) {
          console.log('⚠️ No session time found, refreshing session');
          localStorage.setItem('comperra-session-time', Date.now().toString());
          return;
        }

        const sessionAge = Date.now() - parseInt(sessionTime);
        const timeSinceActivity = lastActivity ? Date.now() - parseInt(lastActivity) : 0;

        // Refresh session if it's been more than 6 hours or 30 minutes since last activity
        if (sessionAge > 6 * 60 * 60 * 1000 || timeSinceActivity > 30 * 60 * 1000) {
          console.log('🔄 Refreshing session due to inactivity');
          
          // Try to refresh session with server
          const response = await fetch('/api/auth/refresh-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: user.uid || user.email }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              localStorage.setItem('comperra-session-time', Date.now().toString());
              localStorage.setItem('comperra-last-activity', Date.now().toString());
              console.log('✅ Session refreshed successfully');
            }
          }
        }
      } catch (error) {
        console.warn('Session validation failed:', error);
      }
    };

    // Run validation every 5 minutes
    sessionCheckIntervalRef.current = setInterval(validateSession, 5 * 60 * 1000);

    // Run initial validation
    validateSession();

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
    };
  }, [user, userProfile]);

  // Prevent navigation away from protected pages if session is invalid
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Update session timestamp before leaving
      if (user && userProfile) {
        localStorage.setItem('comperra-last-activity', Date.now().toString());
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user, userProfile]);

  return {
    sessionActive: !!user && !!userProfile,
    lastActivity: lastActivityRef.current,
  };
};