'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/auth-api';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get tokens from URL query parameters
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          // Store tokens in localStorage
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);
          
          // Also set cookies so middleware can access them
          // Set access_token cookie (expires in 15 minutes)
          document.cookie = `access_token=${accessToken}; path=/; max-age=${15 * 60}; SameSite=Lax`;
          // Set refresh_token cookie (expires in 7 days)
          document.cookie = `refresh_token=${refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
          
          // Verify tokens work by fetching user data
          try {
            await authAPI.getCurrentUser();
            // Success - redirect to dashboard
            // Use window.location to force a full page reload so AuthProvider re-checks auth
            // Cookies are set synchronously, so we can redirect immediately
            window.location.href = '/dashboard';
          } catch (err: any) {
            console.error('Failed to verify tokens:', err);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setError('Authentication failed. Please try again.');
            setStatus('error');
            setTimeout(() => {
              router.push('/login?error=auth_failed');
            }, 2000);
          }
        } else {
          // Check for error in URL
          const errorParam = params.get('error');
          const errorMessage = params.get('message') || 'Authentication failed';
          
          if (errorParam) {
            setError(errorMessage);
            setStatus('error');
            setTimeout(() => {
              router.push(`/login?error=${errorParam}&message=${encodeURIComponent(errorMessage)}`);
            }, 2000);
          } else {
            setError('Missing authentication tokens');
            setStatus('error');
            setTimeout(() => {
              router.push('/login?error=oauth_failed');
            }, 2000);
          }
        }
      } catch (err: any) {
        console.error('Callback error:', err);
        setError('An unexpected error occurred');
        setStatus('error');
        setTimeout(() => {
          router.push('/login?error=unexpected_error');
        }, 2000);
      }
    };

    handleCallback();
  }, [router]);

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-gray-800 font-semibold mb-2">Authentication Error</p>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-4">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
        <p className="mt-2 text-sm text-gray-500">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
