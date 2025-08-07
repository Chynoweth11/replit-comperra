import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, CheckCircle } from 'lucide-react';

export default function EmailSignInComplete() {
  const { isSignInLink, completeEmailSignIn } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isValidLink, setIsValidLink] = useState(false);

  useEffect(() => {
    // Check if current URL is a sign-in link
    const currentUrl = window.location.href;
    const validLink = isSignInLink(currentUrl);
    setIsValidLink(validLink);

    // Try to get email from localStorage
    const savedEmail = localStorage.getItem('emailForSignIn');
    if (savedEmail) {
      setEmail(savedEmail);
    }

    // Auto-complete sign-in if email is available
    if (validLink && savedEmail) {
      handleCompleteSignIn(savedEmail);
    }
  }, [isSignInLink]);

  const handleCompleteSignIn = async (emailToUse: string) => {
    if (!emailToUse.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await completeEmailSignIn(emailToUse);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCompleteSignIn(email);
  };

  if (!isValidLink) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Mail className="mx-auto h-12 w-12 text-red-500" />
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Invalid Sign-In Link
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This link is not valid or has expired. Please request a new sign-in link.
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Return to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Sign-In Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You have been successfully signed in. Redirecting to homepage...
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Continue to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Mail className="mx-auto h-12 w-12 text-blue-500" />
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Complete Your Sign-In
          </CardTitle>
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
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please confirm your email address to complete sign-in
              </p>
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
                  Completing Sign-In...
                </>
              ) : (
                'Complete Sign-In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}