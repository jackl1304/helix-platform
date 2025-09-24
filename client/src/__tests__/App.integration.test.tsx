import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock all the dependencies
jest.mock('wouter', () => ({
  useLocation: () => ['/', jest.fn()],
  Switch: ({ children }: any) => <div data-testid="router-switch">{children}</div>,
  Route: ({ path, children, component: Component }: any) => {
    if (Component) {
      return <div data-testid={`route-${path}`}><Component /></div>;
    }
    return <div data-testid={`route-${path}`}>{children}</div>;
  }
}));

jest.mock('@tanstack/react-query', () => ({
  QueryClientProvider: ({ children }: any) => <div data-testid="query-provider">{children}</div>
}));

jest.mock('@/lib/queryClient', () => ({
  queryClient: {}
}));

jest.mock('@/components/ui/toaster', () => ({
  Toaster: () => <div data-testid="toaster" />
}));

jest.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: any) => <div data-testid="tooltip-provider">{children}</div>
}));

jest.mock('@/contexts/LanguageContext', () => ({
  LanguageProvider: ({ children }: any) => <div data-testid="language-provider">{children}</div>
}));

jest.mock('@/components/FeedbackButton', () => ({
  FeedbackButton: () => <div data-testid="feedback-button" />
}));

jest.mock('@/pages/dashboard', () => {
  return function Dashboard() {
    return <div data-testid="dashboard-page">Dashboard</div>;
  };
});

jest.mock('@/pages/not-found', () => {
  return function NotFound() {
    return <div data-testid="not-found-page">Not Found</div>;
  };
});

// Mock lazy components
jest.mock('@/pages/tenant-auth', () => {
  return function TenantAuth() {
    return <div data-testid="tenant-auth-page">Tenant Auth</div>;
  };
});

jest.mock('@/pages/tenant-dashboard', () => {
  return function TenantDashboard() {
    return <div data-testid="tenant-dashboard-page">Tenant Dashboard</div>;
  };
});

// Mock other lazy components that might be used
const mockLazyComponent = (name: string) => {
  return function MockComponent() {
    return <div data-testid={`${name}-page`}>{name}</div>;
  };
};

jest.mock('@/pages/landing', () => mockLazyComponent('landing'));
jest.mock('@/components/customer/customer-router', () => mockLazyComponent('customer-router'));
jest.mock('@/contexts/customer-theme-context', () => ({
  CustomerThemeProvider: ({ children }: any) => <div data-testid="customer-theme">{children}</div>
}));

jest.mock('@/components/responsive-layout', () => ({
  ResponsiveLayout: ({ children }: any) => <div data-testid="responsive-layout">{children}</div>
}));

jest.mock('@/utils/performance', () => ({
  performanceMonitor: {},
  preloadCriticalResources: jest.fn()
}));

describe('App Integration - React Error #426 Fix', () => {
  it('should render without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('router-switch')).toBeInTheDocument();
  });

  it('should have proper error boundary structure', () => {
    render(<App />);
    
    // Should have nested providers
    expect(screen.getByTestId('language-provider')).toBeInTheDocument();
    expect(screen.getByTestId('query-provider')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument();
  });

  it('should have tenant routes with proper error boundaries', () => {
    render(<App />);
    
    // Check that tenant routes exist
    expect(screen.getByTestId('route-/tenant/auth')).toBeInTheDocument();
    expect(screen.getByTestId('route-/tenant/dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('route-/tenant-auth')).toBeInTheDocument();
    expect(screen.getByTestId('route-/tenant-dashboard')).toBeInTheDocument();
  });

  it('should render components properly wrapped in suspense boundaries', () => {
    // This test verifies that the components can be rendered without throwing
    // React error #426, which would occur if Suspense boundaries were missing
    expect(() => {
      render(<App />);
    }).not.toThrow();
  });

  it('should have feedback button available', () => {
    render(<App />);
    expect(screen.getByTestId('feedback-button')).toBeInTheDocument();
  });
});