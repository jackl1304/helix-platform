import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NavigationHeader } from '../navigation-header';

// Mock wouter
const mockSetLocation = jest.fn();
jest.mock('wouter', () => ({
  useLocation: () => ['/', mockSetLocation]
}));

describe('NavigationHeader', () => {
  beforeEach(() => {
    mockSetLocation.mockClear();
  });

  it('should render tenant login and customer area buttons for admin view', () => {
    render(<NavigationHeader showTenantLinks={true} currentView="admin" />);
    
    expect(screen.getByTestId('button-goto-tenant-auth')).toBeInTheDocument();
    expect(screen.getByTestId('button-goto-tenant-dashboard')).toBeInTheDocument();
    expect(screen.getByText('Tenant Login')).toBeInTheDocument();
    expect(screen.getByText('Customer Area')).toBeInTheDocument();
  });

  it('should handle tenant login button click', async () => {
    render(<NavigationHeader showTenantLinks={true} currentView="admin" />);
    
    const tenantLoginButton = screen.getByTestId('button-goto-tenant-auth');
    fireEvent.click(tenantLoginButton);
    
    // The button should be disabled during navigation
    expect(tenantLoginButton).toBeDisabled();
    
    // Wait for the navigation timeout
    await waitFor(() => {
      expect(mockSetLocation).toHaveBeenCalledWith('/tenant/auth');
    }, { timeout: 200 });
  });

  it('should handle customer area button click', async () => {
    render(<NavigationHeader showTenantLinks={true} currentView="admin" />);
    
    const customerAreaButton = screen.getByTestId('button-goto-tenant-dashboard');
    fireEvent.click(customerAreaButton);
    
    // The button should be disabled during navigation
    expect(customerAreaButton).toBeDisabled();
    
    // Wait for the navigation timeout
    await waitFor(() => {
      expect(mockSetLocation).toHaveBeenCalledWith('/tenant/dashboard');
    }, { timeout: 200 });
  });

  it('should prevent rapid clicking', async () => {
    render(<NavigationHeader showTenantLinks={true} currentView="admin" />);
    
    const tenantLoginButton = screen.getByTestId('button-goto-tenant-auth');
    
    // Click multiple times rapidly
    fireEvent.click(tenantLoginButton);
    fireEvent.click(tenantLoginButton);
    fireEvent.click(tenantLoginButton);
    
    // Should only be called once due to navigation protection
    await waitFor(() => {
      expect(mockSetLocation).toHaveBeenCalledTimes(1);
      expect(mockSetLocation).toHaveBeenCalledWith('/tenant/auth');
    }, { timeout: 200 });
  });

  it('should not render navigation links when showTenantLinks is false', () => {
    render(<NavigationHeader showTenantLinks={false} currentView="admin" />);
    
    expect(screen.queryByTestId('button-goto-tenant-auth')).not.toBeInTheDocument();
    expect(screen.queryByTestId('button-goto-tenant-dashboard')).not.toBeInTheDocument();
  });

  it('should render admin area button for tenant view', () => {
    render(<NavigationHeader showTenantLinks={true} currentView="tenant" />);
    
    expect(screen.getByTestId('button-goto-admin')).toBeInTheDocument();
    expect(screen.getByText('Admin Area')).toBeInTheDocument();
  });

  it('should render tenant login button for public view', () => {
    render(<NavigationHeader showTenantLinks={true} currentView="public" />);
    
    expect(screen.getByTestId('button-tenant-login')).toBeInTheDocument();
    expect(screen.getByText('Tenant Login')).toBeInTheDocument();
  });
});