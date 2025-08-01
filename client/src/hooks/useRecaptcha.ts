import { useState, useCallback } from 'react';

declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
    };
  }
}

// Use Google's test key for development (works on localhost)
const RECAPTCHA_SITE_KEY = import.meta.env.DEV 
  ? '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI' // Google's test key for localhost
  : '6LcUZYIrAAAAAHwZwRABhcP_nYWzSmALqoXKXDjo'; // Production key

export function useRecaptcha() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeRecaptcha = useCallback(async (action: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!window.grecaptcha) {
        throw new Error('reCAPTCHA not loaded');
      }

      return new Promise((resolve, reject) => {
        window.grecaptcha.enterprise.ready(async () => {
          try {
            const token = await window.grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, { action });
            resolve(token);
          } catch (err) {
            reject(err);
          }
        });
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'reCAPTCHA execution failed';
      setError(errorMessage);
      console.error('❌ reCAPTCHA execution error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    executeRecaptcha,
    isLoading,
    error
  };
}