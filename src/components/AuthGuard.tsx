'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Lock, LogIn, ArrowLeft, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  pageTitle?: string;
  description?: string;
}

export default function AuthGuard({
  children,
  pageTitle = 'Member Access Required',
  description = 'Please sign in with your Google account to access this page, collaborate with squads, and utilize the Gemini AI features.',
}: AuthGuardProps) {
  const { isAuthenticated, authLoading, loginWithGoogle, isFirebaseConfigured } = useApp();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin mb-4" />
        <p className="text-xs text-muted-foreground">Checking authentication status...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    const handleSignIn = async () => {
      try {
        setError(null);
        setSigningIn(true);
        await loginWithGoogle();
      } catch (err: any) {
        console.error('Sign-in error:', err);
        setError(err.message || 'Google Sign-In was cancelled or encountered an error.');
      } finally {
        setSigningIn(false);
      }
    };

    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg p-8 sm:p-10 rounded-3xl bg-card border border-border text-center space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          {/* Centered Icon */}
          <div className="w-16 h-16 rounded-2xl bg-muted border border-border text-accent flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h1 className="text-xl sm:text-2xl font-extrabold text-heading tracking-tight">
              {pageTitle}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-2.5 text-xs text-destructive text-left">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          {/* Benefits Box */}
          <div className="p-4 rounded-2xl bg-background border border-border space-y-2 text-left text-xs">
            <div className="flex items-center gap-2.5 text-foreground font-medium">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <span>Full access to Talent Pool, Projects, and Team Workspaces</span>
            </div>
            <div className="flex items-center gap-2.5 text-foreground font-medium">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <span>Real-time cross-device synchronization with Firestore</span>
            </div>
            <div className="flex items-center gap-2.5 text-foreground font-medium">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <span>Interactive Gemini AI Pitch, Architecture & Strategy Copilot</span>
            </div>
          </div>

          {/* Google Sign-in CTA */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleSignIn}
              disabled={signingIn}
              className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm shadow-lg hover:shadow transition-all border border-slate-300 disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{signingIn ? 'Signing in with Google...' : 'Sign In with Google'}</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-heading transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Main Landing Page</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
