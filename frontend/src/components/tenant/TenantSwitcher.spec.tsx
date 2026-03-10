import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TenantSwitcher } from './TenantSwitcher';
import { TenantProvider, useTenant } from '../../context/TenantContext';
import { AuthProvider } from '../../context/AuthContext';
import React from 'react';

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TenantProvider>{children}</TenantProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

describe('TenantSwitcher', () => {
  it('renders nothing when tenants list is empty', () => {
    const { container } = render(
      <TestWrapper>
        <TenantSwitcher />
      </TestWrapper>
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when tenants are not loaded', () => {
    const { container } = render(
      <TestWrapper>
        <TenantSwitcher />
      </TestWrapper>
    );
    expect(container.firstChild).toBeNull();
  });
});

describe('TenantContext', () => {
  it('provides default values', () => {
    const TestConsumer = () => {
      const { currentTenant, tenants } = useTenant();
      
      expect(currentTenant).toBeNull();
      expect(tenants).toEqual([]);
      
      return null;
    };

    render(
      <TestWrapper>
        <TestConsumer />
      </TestWrapper>
    );
  });

  it('throws error when used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const TestConsumer = () => {
      useTenant();
      return null;
    };

    expect(() => render(<TestConsumer />)).toThrow('useTenant must be used within a TenantProvider');
    
    consoleError.mockRestore();
  });
});
