/**
 * MedTech Data Platform - AuthContext Tests
 * Umfassende Tests für den AuthContext
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { AuthProvider, useAuth } from '../../contexts/AuthContext';

// Mock der API-Funktionen
vi.mock('../../services/api', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
    getCurrentUser: vi.fn()
  }
}));

// Mock von localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Test-Komponente für useAuth Hook
const TestComponent: React.FC = () => {
  const { user, login, logout, isLoading } = useAuth();
  
  return (
    <div>
      <div data-testid="user">{user ? user.name : 'No user'}</div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not loading'}</div>
      <button onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should provide initial state correctly', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
  });

  it('should handle successful login', async () => {
    const { authApi } = await import('../../services/api');
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      permissions: ['read_approvals']
    };
    
    vi.mocked(authApi.login).mockResolvedValue({
      user: mockUser,
      token: 'test-token'
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    });

    expect(authApi.login).toHaveBeenCalledWith('test@example.com', 'password');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
  });

  it('should handle login error', async () => {
    const { authApi } = await import('../../services/api');
    const mockError = new Error('Invalid credentials');
    vi.mocked(authApi.login).mockRejectedValue(mockError);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Login error:', mockError);
    });

    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    
    consoleSpy.mockRestore();
  });

  it('should handle logout', async () => {
    const { authApi } = await import('../../services/api');
    vi.mocked(authApi.logout).mockResolvedValue(undefined);

    // Set initial user state
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      permissions: ['read_approvals']
    };
    
    mockLocalStorage.getItem.mockReturnValue('test-token');
    vi.mocked(authApi.getCurrentUser).mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial user load
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    });

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });

    expect(authApi.logout).toHaveBeenCalled();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
  });

  it('should load user from token on mount', async () => {
    const { authApi } = await import('../../services/api');
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      permissions: ['read_approvals']
    };
    
    mockLocalStorage.getItem.mockReturnValue('test-token');
    vi.mocked(authApi.getCurrentUser).mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    });

    expect(authApi.getCurrentUser).toHaveBeenCalled();
  });

  it('should handle token refresh', async () => {
    const { authApi } = await import('../../services/api');
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      permissions: ['read_approvals']
    };
    
    mockLocalStorage.getItem.mockReturnValue('test-token');
    vi.mocked(authApi.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(authApi.refreshToken).mockResolvedValue('new-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    });

    // Simulate token refresh
    await waitFor(() => {
      expect(authApi.refreshToken).toHaveBeenCalled();
    });
  });

  it('should handle token refresh error', async () => {
    const { authApi } = await import('../../services/api');
    const mockError = new Error('Token refresh failed');
    
    mockLocalStorage.getItem.mockReturnValue('test-token');
    vi.mocked(authApi.getCurrentUser).mockRejectedValue(mockError);
    vi.mocked(authApi.refreshToken).mockRejectedValue(mockError);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Token refresh error:', mockError);
    });

    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    
    consoleSpy.mockRestore();
  });

  it('should handle network errors during login', async () => {
    const { authApi } = await import('../../services/api');
    const networkError = new Error('Network error');
    vi.mocked(authApi.login).mockRejectedValue(networkError);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Login error:', networkError);
    });

    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    
    consoleSpy.mockRestore();
  });

  it('should handle server errors during login', async () => {
    const { authApi } = await import('../../services/api');
    const serverError = new Error('Internal Server Error');
    vi.mocked(authApi.login).mockRejectedValue(serverError);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Login error:', serverError);
    });

    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    
    consoleSpy.mockRestore();
  });

  it('should handle invalid token', async () => {
    const { authApi } = await import('../../services/api');
    const invalidTokenError = new Error('Invalid token');
    
    mockLocalStorage.getItem.mockReturnValue('invalid-token');
    vi.mocked(authApi.getCurrentUser).mockRejectedValue(invalidTokenError);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Invalid token:', invalidTokenError);
    });

    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    
    consoleSpy.mockRestore();
  });

  it('should handle expired token', async () => {
    const { authApi } = await import('../../services/api');
    const expiredTokenError = new Error('Token expired');
    
    mockLocalStorage.getItem.mockReturnValue('expired-token');
    vi.mocked(authApi.getCurrentUser).mockRejectedValue(expiredTokenError);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Invalid token:', expiredTokenError);
    });

    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    
    consoleSpy.mockRestore();
  });

  it('should handle concurrent login attempts', async () => {
    const { authApi } = await import('../../services/api');
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      permissions: ['read_approvals']
    };
    
    vi.mocked(authApi.login).mockResolvedValue({
      user: mockUser,
      token: 'test-token'
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    
    // Click login button multiple times rapidly
    fireEvent.click(loginButton);
    fireEvent.click(loginButton);
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    });

    // Should only call login once due to loading state
    expect(authApi.login).toHaveBeenCalledTimes(1);
  });

  it('should handle logout error', async () => {
    const { authApi } = await import('../../services/api');
    const mockError = new Error('Logout failed');
    vi.mocked(authApi.logout).mockRejectedValue(mockError);

    // Set initial user state
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      permissions: ['read_approvals']
    };
    
    mockLocalStorage.getItem.mockReturnValue('test-token');
    vi.mocked(authApi.getCurrentUser).mockResolvedValue(mockUser);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial user load
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    });

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Logout error:', mockError);
    });

    // User should still be logged out even if API call fails
    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    
    consoleSpy.mockRestore();
  });

  it('should handle missing user permissions', async () => {
    const { authApi } = await import('../../services/api');
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      permissions: []
    };
    
    mockLocalStorage.getItem.mockReturnValue('test-token');
    vi.mocked(authApi.getCurrentUser).mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    });

    expect(authApi.getCurrentUser).toHaveBeenCalled();
  });

  it('should handle user with admin permissions', async () => {
    const { authApi } = await import('../../services/api');
    const mockUser = {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      permissions: ['read_approvals', 'write_approvals', 'admin']
    };
    
    mockLocalStorage.getItem.mockReturnValue('test-token');
    vi.mocked(authApi.getCurrentUser).mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Admin User');
    });

    expect(authApi.getCurrentUser).toHaveBeenCalled();
  });

  it('should handle empty email and password', async () => {
    const { authApi } = await import('../../services/api');
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    // Should not call API with empty credentials
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('should handle malformed API response', async () => {
    const { authApi } = await import('../../services/api');
    vi.mocked(authApi.login).mockResolvedValue({
      user: null,
      token: 'test-token'
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Login error:', expect.any(Error));
    });

    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    
    consoleSpy.mockRestore();
  });
});
