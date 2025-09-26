/**
 * MedTech Data Platform - Main Application Component
 * Hauptkomponente der React-Anwendung mit Routing und Layout
 */

import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'react-hot-toast';

// Layout Components
import { Layout } from './components/layout/Layout';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LoadingFallback } from './components/common/LoadingFallback';
import { ErrorFallback } from './components/common/ErrorFallback';

// Utils
import { createLogger } from './utils/logger';

// Auth Components
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';

// Main Pages (Lazy Loaded)
const DashboardPage = React.lazy(() => import('./pages/dashboard/DashboardPage'));
const ApprovalsPage = React.lazy(() => import('./pages/approvals/ApprovalsPage'));
const ApprovalDetailPage = React.lazy(() => import('./pages/approvals/ApprovalDetailPage'));
const DataSourcesPage = React.lazy(() => import('./pages/data-sources/DataSourcesPage'));
const RegulatoryUpdatesPage = React.lazy(() => import('./pages/regulatory-updates/RegulatoryUpdatesPage'));
const AnalyticsPage = React.lazy(() => import('./pages/analytics/AnalyticsPage'));
const SettingsPage = React.lazy(() => import('./pages/settings/SettingsPage'));
const UsersPage = React.lazy(() => import('./pages/users/UsersPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

// Query Client Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

/**
 * Main App Component
 * 
 * Features:
 * - React Router für Navigation
 * - React Query für Server State Management
 * - Error Boundaries für Fehlerbehandlung
 * - Lazy Loading für Performance
 * - Authentication Context
 * - Responsive Layout mit Sidebar
 */
export default function App(): JSX.Element {
  const logger = createLogger('App');

  useEffect(() => {
    // Global error handler
    const handleGlobalError = (event: ErrorEvent) => {
      logger.error('Global error', { error: event.error?.message || String(event.error) });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error('Unhandled promise rejection', { reason: String(event.reason) });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        logger.error('Application error', { 
          error: error.message, 
          stack: error.stack,
          componentStack: errorInfo.componentStack 
        });
        // Hier könnte eine Error Reporting Service integriert werden
      }}
    >
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Router>
              <div className="min-h-screen bg-background">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  
                  {/* Protected Routes */}
                  <Route
                    path="/*"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Suspense fallback={<LoadingFallback />}>
                            <Routes>
                              {/* Dashboard */}
                              <Route path="/" element={<DashboardPage />} />
                              <Route path="/dashboard" element={<Navigate to="/" replace />} />
                              
                              {/* Approvals */}
                              <Route path="/approvals" element={<ApprovalsPage />} />
                              <Route path="/approvals/:id" element={<ApprovalDetailPage />} />
                              
                              {/* Data Sources */}
                              <Route path="/data-sources" element={<DataSourcesPage />} />
                              
                              {/* Regulatory Updates */}
                              <Route path="/regulatory-updates" element={<RegulatoryUpdatesPage />} />
                              
                              {/* Analytics */}
                              <Route path="/analytics" element={<AnalyticsPage />} />
                              
                              {/* Settings */}
                              <Route path="/settings" element={<SettingsPage />} />
                              
                              {/* Users (Admin only) */}
                              <Route path="/users" element={<UsersPage />} />
                              
                              {/* 404 */}
                              <Route path="*" element={<NotFoundPage />} />
                            </Routes>
                          </Suspense>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
                
                {/* Global Toast Notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'hsl(var(--background))',
                      color: 'hsl(var(--foreground))',
                      border: '1px solid hsl(var(--border))',
                    },
                    success: {
                      iconTheme: {
                        primary: 'hsl(var(--primary))',
                        secondary: 'hsl(var(--primary-foreground))',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: 'hsl(var(--destructive))',
                        secondary: 'hsl(var(--destructive-foreground))',
                      },
                    },
                  }}
                />
              </div>
            </Router>
          </AuthProvider>
          
          {/* React Query DevTools (nur in Development) */}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

// Layout Component für die Hauptanwendung
function Layout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
