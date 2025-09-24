import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Special handling for React error #426 (Suspense/hydration issues)
    if (error.message?.includes('426') || errorInfo.componentStack?.includes('Suspense')) {
      console.warn('Detected React error #426 - Suspense/hydration issue. This error has been handled.');
      // Could also trigger a retry or redirect here if needed
    }
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const Fallback = this.props.fallback;
        return <Fallback error={this.state.error} retry={this.retry} />;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-red-600">Unerwarteter Fehler</CardTitle>
              <CardDescription>
                Beim Laden der Komponente ist ein Fehler aufgetreten
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                {this.state.error?.message || 'Ein unbekannter Fehler ist aufgetreten'}
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={this.retry} variant="outline">
                  Erneut versuchen
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Seite neu laden
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component for easier use with startTransition
export function SuspenseErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <React.Suspense 
        fallback={
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-blue-200 h-12 w-12"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-blue-200 rounded w-3/4"></div>
                  <div className="h-4 bg-blue-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="text-center mt-4">
                <p className="text-sm text-blue-600">Lade Seite...</p>
              </div>
            </div>
          </div>
        }
      >
        {children}
      </React.Suspense>
    </ErrorBoundary>
  );
}

// Enhanced version for critical navigation routes
export function NavigationSuspenseBoundary({ children, routeName }: { children: React.ReactNode; routeName?: string }) {
  return (
    <ErrorBoundary
      fallback={({ error, retry }) => (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-red-600 mb-2">Navigation Error</h2>
              <p className="text-sm text-gray-600 mb-4">
                {routeName ? `Error loading ${routeName}` : 'Error loading page'}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                {error?.message || 'A navigation error occurred'}
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={retry} variant="outline" size="sm">
                  Try Again
                </Button>
                <Button onClick={() => window.location.href = '/'} size="sm">
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    >
      <React.Suspense 
        fallback={
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-blue-200 h-12 w-12"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-blue-200 rounded w-3/4"></div>
                  <div className="h-4 bg-blue-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="text-center mt-4">
                <p className="text-sm text-blue-600">
                  {routeName ? `Loading ${routeName}...` : 'Loading...'}
                </p>
              </div>
            </div>
          </div>
        }
      >
        {children}
      </React.Suspense>
    </ErrorBoundary>
  );
}