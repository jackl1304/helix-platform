/**
 * MedTech Data Platform - SettingsContext Tests
 * Umfassende Tests für den SettingsContext
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { SettingsProvider, useSettings } from '../../contexts/SettingsContext';

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

// Test-Komponente für useSettings Hook
const TestComponent: React.FC = () => {
  const { settings, updateSetting, resetSettings } = useSettings();
  
  return (
    <div>
      <div data-testid="show-global-approvals">
        {settings.showGlobalApprovals ? 'true' : 'false'}
      </div>
      <div data-testid="theme">{settings.theme}</div>
      <div data-testid="language">{settings.language}</div>
      <div data-testid="items-per-page">{settings.itemsPerPage}</div>
      <div data-testid="default-view">{settings.defaultView}</div>
      <div data-testid="auto-refresh">{settings.autoRefresh ? 'true' : 'false'}</div>
      <div data-testid="notifications">{settings.notifications ? 'true' : 'false'}</div>
      
      <button onClick={() => updateSetting('showGlobalApprovals', false)}>
        Toggle Global Approvals
      </button>
      <button onClick={() => updateSetting('theme', 'dark')}>
        Change Theme
      </button>
      <button onClick={() => updateSetting('language', 'en')}>
        Change Language
      </button>
      <button onClick={() => updateSetting('itemsPerPage', 25)}>
        Change Items Per Page
      </button>
      <button onClick={() => updateSetting('defaultView', 'cards')}>
        Change Default View
      </button>
      <button onClick={() => updateSetting('autoRefresh', true)}>
        Toggle Auto Refresh
      </button>
      <button onClick={() => updateSetting('notifications', true)}>
        Toggle Notifications
      </button>
      <button onClick={resetSettings}>
        Reset Settings
      </button>
    </div>
  );
};

describe('SettingsContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should provide default settings correctly', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    expect(screen.getByTestId('show-global-approvals')).toHaveTextContent('true');
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(screen.getByTestId('language')).toHaveTextContent('de');
    expect(screen.getByTestId('items-per-page')).toHaveTextContent('10');
    expect(screen.getByTestId('default-view')).toHaveTextContent('table');
    expect(screen.getByTestId('auto-refresh')).toHaveTextContent('false');
    expect(screen.getByTestId('notifications')).toHaveTextContent('false');
  });

  it('should load settings from localStorage on mount', () => {
    const savedSettings = {
      showGlobalApprovals: false,
      theme: 'dark',
      language: 'en',
      itemsPerPage: 25,
      defaultView: 'cards',
      autoRefresh: true,
      notifications: true
    };
    
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedSettings));

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    expect(screen.getByTestId('show-global-approvals')).toHaveTextContent('false');
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('language')).toHaveTextContent('en');
    expect(screen.getByTestId('items-per-page')).toHaveTextContent('25');
    expect(screen.getByTestId('default-view')).toHaveTextContent('cards');
    expect(screen.getByTestId('auto-refresh')).toHaveTextContent('true');
    expect(screen.getByTestId('notifications')).toHaveTextContent('true');
  });

  it('should update settings and save to localStorage', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    const toggleButton = screen.getByText('Toggle Global Approvals');
    fireEvent.click(toggleButton);

    expect(screen.getByTestId('show-global-approvals')).toHaveTextContent('false');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'settings',
      expect.stringContaining('"showGlobalApprovals":false')
    );
  });

  it('should change theme setting', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    const themeButton = screen.getByText('Change Theme');
    fireEvent.click(themeButton);

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'settings',
      expect.stringContaining('"theme":"dark"')
    );
  });

  it('should change language setting', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    const languageButton = screen.getByText('Change Language');
    fireEvent.click(languageButton);

    expect(screen.getByTestId('language')).toHaveTextContent('en');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'settings',
      expect.stringContaining('"language":"en"')
    );
  });

  it('should change items per page setting', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    const itemsButton = screen.getByText('Change Items Per Page');
    fireEvent.click(itemsButton);

    expect(screen.getByTestId('items-per-page')).toHaveTextContent('25');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'settings',
      expect.stringContaining('"itemsPerPage":25')
    );
  });

  it('should change default view setting', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    const viewButton = screen.getByText('Change Default View');
    fireEvent.click(viewButton);

    expect(screen.getByTestId('default-view')).toHaveTextContent('cards');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'settings',
      expect.stringContaining('"defaultView":"cards"')
    );
  });

  it('should toggle auto refresh setting', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    const autoRefreshButton = screen.getByText('Toggle Auto Refresh');
    fireEvent.click(autoRefreshButton);

    expect(screen.getByTestId('auto-refresh')).toHaveTextContent('true');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'settings',
      expect.stringContaining('"autoRefresh":true')
    );
  });

  it('should toggle notifications setting', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    const notificationsButton = screen.getByText('Toggle Notifications');
    fireEvent.click(notificationsButton);

    expect(screen.getByTestId('notifications')).toHaveTextContent('true');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'settings',
      expect.stringContaining('"notifications":true')
    );
  });

  it('should reset settings to defaults', () => {
    // Set initial custom settings
    const savedSettings = {
      showGlobalApprovals: false,
      theme: 'dark',
      language: 'en',
      itemsPerPage: 25,
      defaultView: 'cards',
      autoRefresh: true,
      notifications: true
    };
    
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedSettings));

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Verify custom settings are loaded
    expect(screen.getByTestId('show-global-approvals')).toHaveTextContent('false');
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');

    const resetButton = screen.getByText('Reset Settings');
    fireEvent.click(resetButton);

    // Verify settings are reset to defaults
    expect(screen.getByTestId('show-global-approvals')).toHaveTextContent('true');
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(screen.getByTestId('language')).toHaveTextContent('de');
    expect(screen.getByTestId('items-per-page')).toHaveTextContent('10');
    expect(screen.getByTestId('default-view')).toHaveTextContent('table');
    expect(screen.getByTestId('auto-refresh')).toHaveTextContent('false');
    expect(screen.getByTestId('notifications')).toHaveTextContent('false');
    
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('settings');
  });

  it('should handle invalid JSON in localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid json');

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Should fall back to default settings
    expect(screen.getByTestId('show-global-approvals')).toHaveTextContent('true');
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('should handle localStorage errors gracefully', () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Should fall back to default settings
    expect(screen.getByTestId('show-global-approvals')).toHaveTextContent('true');
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    
    consoleSpy.mockRestore();
  });

  it('should handle localStorage setItem errors gracefully', () => {
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('localStorage setItem error');
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    const toggleButton = screen.getByText('Toggle Global Approvals');
    fireEvent.click(toggleButton);

    // Setting should still be updated in memory
    expect(screen.getByTestId('show-global-approvals')).toHaveTextContent('false');
    
    consoleSpy.mockRestore();
  });

  it('should handle partial settings from localStorage', () => {
    const partialSettings = {
      theme: 'dark',
      language: 'en'
    };
    
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(partialSettings));

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Should merge partial settings with defaults
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('language')).toHaveTextContent('en');
    expect(screen.getByTestId('show-global-approvals')).toHaveTextContent('true'); // default
    expect(screen.getByTestId('items-per-page')).toHaveTextContent('10'); // default
  });

  it('should handle multiple setting updates in sequence', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Update multiple settings
    fireEvent.click(screen.getByText('Change Theme'));
    fireEvent.click(screen.getByText('Change Language'));
    fireEvent.click(screen.getByText('Change Items Per Page'));

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('language')).toHaveTextContent('en');
    expect(screen.getByTestId('items-per-page')).toHaveTextContent('25');
    
    // Each update should save to localStorage
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(3);
  });

  it('should handle invalid setting values', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Try to set invalid theme value
    const themeButton = screen.getByText('Change Theme');
    fireEvent.click(themeButton);

    // Should still update to valid value
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('should handle rapid setting updates', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Rapidly click multiple buttons
    fireEvent.click(screen.getByText('Toggle Global Approvals'));
    fireEvent.click(screen.getByText('Change Theme'));
    fireEvent.click(screen.getByText('Change Language'));
    fireEvent.click(screen.getByText('Toggle Auto Refresh'));

    // All settings should be updated correctly
    expect(screen.getByTestId('show-global-approvals')).toHaveTextContent('false');
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('language')).toHaveTextContent('en');
    expect(screen.getByTestId('auto-refresh')).toHaveTextContent('true');
  });

  it('should handle setting updates with same values', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Try to set theme to 'light' (same as default)
    const themeButton = screen.getByText('Change Theme');
    fireEvent.click(themeButton);

    // Should still update and save
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
  });

  it('should maintain settings state across re-renders', () => {
    const { rerender } = render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Update a setting
    fireEvent.click(screen.getByText('Change Theme'));
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');

    // Re-render the component
    rerender(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Setting should persist
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('should handle empty localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('');

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Should use default settings
    expect(screen.getByTestId('show-global-approvals')).toHaveTextContent('true');
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('should handle null localStorage value', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Should use default settings
    expect(screen.getByTestId('show-global-approvals')).toHaveTextContent('true');
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('should handle undefined localStorage value', () => {
    mockLocalStorage.getItem.mockReturnValue(undefined);

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Should use default settings
    expect(screen.getByTestId('show-global-approvals')).toHaveTextContent('true');
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('should handle settings with extra properties', () => {
    const settingsWithExtra = {
      showGlobalApprovals: false,
      theme: 'dark',
      language: 'en',
      itemsPerPage: 25,
      defaultView: 'cards',
      autoRefresh: true,
      notifications: true,
      extraProperty: 'should be ignored'
    };
    
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(settingsWithExtra));

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Should only use valid settings properties
    expect(screen.getByTestId('show-global-approvals')).toHaveTextContent('false');
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('language')).toHaveTextContent('en');
  });
});
