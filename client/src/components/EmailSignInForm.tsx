import { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, CheckCircle } from 'lucide-react';

interface EmailSignInFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EmailSignInForm({ onSuccess, onCancel }: EmailSignInFormProps) {
  const { sendSignInLink } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await sendSignInLink(email);
      setSuccess(true);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Failed to send sign-in link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Check Your Email
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We've sent a sign-in link to <strong>{email}</strong>. 
            Click the link in your email to complete the sign-in process.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => setSuccess(false)}
              variant="outline"
              className="w-full"
            >
              Send Another Link
            </Button>
            {onCancel && (
              <Button 
                onClick={onCancel}
                variant="ghost"
                className="w-full"
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Mail className="mx-auto h-12 w-12 text-blue-500" />
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
          Sign In with Email Link
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enter your email address and we'll send you a secure sign-in link
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !email.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Link...
              </>
            ) : (
              'Send Sign-In Link'
            )}
          </Button>

          {onCancel && (
            <Button 
              onClick={onCancel}
              variant="ghost"
              className="w-full"
            >
              Cancel
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}