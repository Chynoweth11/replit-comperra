import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';

export const ForgotPasswordTest = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleTest = async () => {
    setMessage('');
    setError('');
    
    if (!email) {
      setError('Please enter an email address');
      return;
    }
    
    console.log('Testing forgot password with email:', email);
    setLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('SUCCESS: Password reset email sent');
      setMessage(`✅ Password reset email sent to ${email}`);
    } catch (err: any) {
      console.error('ERROR sending password reset:', err);
      setError(`❌ Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>🧪 Forgot Password Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="email"
          placeholder="Enter test email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <Button 
          onClick={handleTest} 
          disabled={loading}
          className="w-full"
        >
          <Mail className="w-4 h-4 mr-2" />
          {loading ? 'Testing...' : 'Test Forgot Password'}
        </Button>
        
        {message && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700 text-sm">{message}</p>
          </div>
        )}
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Try with a real email to test delivery</p>
          <p>• Check browser console for detailed logs</p>
          <p>• Firebase config: {auth.app.options.projectId}</p>
        </div>
      </CardContent>
    </Card>
  );
};