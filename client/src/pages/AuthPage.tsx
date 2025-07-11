import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      </div>
    </div>
  );
}