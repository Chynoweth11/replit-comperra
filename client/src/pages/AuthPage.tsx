import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EnhancedAuthForm from '@/components/EnhancedAuthForm';

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const toggleMode = () => {
    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Homepage
          </Button>
        </div>

        <EnhancedAuthForm mode={authMode} onToggleMode={toggleMode} />
        
        {/* Professional Registration CTA */}
        <Card className="mt-4 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-lg font-semibold text-blue-800">
              Are you a Professional or Vendor?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-blue-600 mb-4">
              Join our professional network to receive qualified leads and grow your business.
            </p>
            <Button
              onClick={() => setLocation('/professional-network')}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Register as Professional/Vendor
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}