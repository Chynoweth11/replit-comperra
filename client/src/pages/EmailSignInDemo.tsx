import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import EmailSignInForm from '@/components/EmailSignInForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail } from 'lucide-react';

export default function EmailSignInDemo() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);

  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Mail className="mx-auto h-12 w-12 text-green-500" />
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Already Signed In
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You're already signed in as <strong>{user.email}</strong>
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Homepage
          </Button>
        </div>

        {!showForm ? (
          <Card>
            <CardHeader className="text-center">
              <Mail className="mx-auto h-12 w-12 text-blue-500" />
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Passwordless Sign-In Demo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Experience secure, passwordless authentication with Firebase email links.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md mb-4">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    How it works:
                  </h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 text-left">
                    <li>• Enter your email address</li>
                    <li>• Receive a secure sign-in link</li>
                    <li>• Click the link to sign in instantly</li>
                    <li>• No password required!</li>
                  </ul>
                </div>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="w-full"
                >
                  Try Email Link Sign-In
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <EmailSignInForm 
            onSuccess={() => {
              // Form handles success state internally
            }}
            onCancel={() => setShowForm(false)}
          />
        )}
      </div>
    </div>
  );
}