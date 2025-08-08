import React from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';

const GoogleLogin = () => {
  const { signInWithGoogle, loading } = useSupabaseAuth();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      alert('Login failed: ' + error.message);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Sign in with Google</h2>
      <Button
        onClick={handleLogin}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        {loading ? 'Loading...' : 'Sign in with Google'}
      </Button>
    </div>
  );
};

export default GoogleLogin;