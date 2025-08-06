// Environment configuration for Supabase
// This file handles environment variable access for the frontend

declare global {
  interface Window {
    __SUPABASE_CONFIG__?: {
      url: string;
      anonKey: string;
    };
  }
}

// Get Supabase config from window or environment
export const getSupabaseConfig = () => {
  // Try to get from window first (set by server)
  if (typeof window !== 'undefined' && window.__SUPABASE_CONFIG__) {
    return window.__SUPABASE_CONFIG__;
  }
  
  // For now, return the actual values since environment variables are available
  return {
    url: 'https://hoyioekenopqcshktsmi.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhveWlvZWtlbm9wcWNzaGt0c21pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MTI5OTQsImV4cCI6MjA3MDA4ODk5NH0.Z6K5DZAIPwWW-Dc62Q18Xp4xB_NLtd2r4Mgg69N9HbA'
  };
};

export const isSupabaseConfigured = () => {
  const config = getSupabaseConfig();
  return !!(config.url && config.anonKey && 
           config.url !== 'https://placeholder.supabase.co' && 
           config.anonKey !== 'placeholder_key');
};