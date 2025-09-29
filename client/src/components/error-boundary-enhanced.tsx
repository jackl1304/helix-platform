import { Component, ReactNode, ErrorInfo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bug, RefreshCw, Send } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  autoReport?: boolean;
}

export class EnhancedErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Enhanced Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Auto-report error if enabled
    if (this.props.autoReport !== false) {
      this.reportError(error, errorInfo);
    }
  }

  private async reportError(error: Error, errorInfo: ErrorInfo) {
    try {
      const errorReport = {
        page: window.location.pathname,
        type: 'runtime_error',
        title: `Runtime Error: ${error.name}`,
        message: `${error.message}\n\nStack: ${error.stack}\n\nComponent Stack: ${errorInfo.componentStack}`,
        userEmail: localStorage.getItem('user_email') || 'anonymous',
        userName: localStorage.getItem('user_name') || 'Anonymous User',
        browserInfo: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          errorId: this.state.errorId,
          tenantId: localStorage.getItem('tenant_id') || null
        }
      };

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorReport)
      });

      if (response.ok) {
        console.log('Error automatically reported to admin');
      }
    } catch (reportError) {
      console.warn('Failed to auto-report error:', reportError);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReportManually = async () => {
    if (this.state.error && this.state.errorInfo) {
      await this.reportError(this.state.error, this.state.errorInfo);
      alert('Fehler wurde an das Support-Team gesendet!');
    }
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;

      // Use custom fallback if provided
      if (this.props.fallback && error && errorInfo) {
        return this.props.fallback(error, errorInfo, this.handleRetry);
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Unerwarteter Fehler aufgetreten
              </CardTitle>
              <CardDescription>
                Die Anwendung hat einen unerwarteten Fehler festgestellt. Der Fehler wurde automatisch an unser Support-Team gemeldet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">Fehlerdetails:</h4>
                  <div className="text-sm text-red-700 font-mono break-all">
                    {error.name}: {error.message}
                  </div>
                  {this.state.errorId && (
                    <div className="text-xs text-red-600 mt-2">
                      Fehler-ID: {this.state.errorId}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Seite neu laden
                </Button>
                <Button 
                  variant="outline" 
                  onClick={this.handleReportManually}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Manuell melden
                </Button>
              </div>

              <div className="text-xs text-gray-500 text-center">
                Unser Support-Team wurde automatisch benachrichtigt und arbeitet an einer Lösung.
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Global error handler für unhandled promise rejections und errors
export function setupGlobalErrorHandling() {
  if (typeof window === 'undefined') return;

  window.addEventListener('unhandledrejection', async (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: window.location.pathname,
          type: 'unhandled_rejection',
          title: 'Unhandled Promise Rejection',
          message: `${event.reason?.message || event.reason}\n\nStack: ${event.reason?.stack || 'No stack trace'}`,
          userEmail: localStorage.getItem('user_email') || 'anonymous',
          userName: localStorage.getItem('user_name') || 'Anonymous User',
          browserInfo: {
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            tenantId: localStorage.getItem('tenant_id') || null
          }
        })
      });
    } catch (reportError) {
      console.warn('Failed to report unhandled rejection:', reportError);
    }
  });

  window.addEventListener('error', async (event) => {
    console.error('Global error:', event.error);
    
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: window.location.pathname,
          type: 'global_error',
          title: `Global Error: ${event.error?.name || 'Unknown'}`,
          message: `${event.error?.message || event.message}\n\nStack: ${event.error?.stack || 'No stack trace'}\n\nFilename: ${event.filename}\nLine: ${event.lineno}:${event.colno}`,
          userEmail: localStorage.getItem('user_email') || 'anonymous',
          userName: localStorage.getItem('user_name') || 'Anonymous User',
          browserInfo: {
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            tenantId: localStorage.getItem('tenant_id') || null
          }
        })
      });
    } catch (reportError) {
      console.warn('Failed to report global error:', reportError);
    }
  });
}

