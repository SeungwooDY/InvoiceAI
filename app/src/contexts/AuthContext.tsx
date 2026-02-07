import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, Company, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demo
const mockUsers: Record<string, { user: User; password: string }> = {
  'fm@acme.com': {
    password: 'demo',
    user: {
      id: '1',
      email: 'fm@acme.com',
      name: 'Sarah Chen',
      role: 'finance_manager',
      companyId: 'acme-corp',
    },
  },
  'approver@acme.com': {
    password: 'demo',
    user: {
      id: '2',
      email: 'approver@acme.com',
      name: 'Michael Ross',
      role: 'approver',
      companyId: 'acme-corp',
    },
  },
  'viewer@acme.com': {
    password: 'demo',
    user: {
      id: '3',
      email: 'viewer@acme.com',
      name: 'Emily Zhang',
      role: 'viewer',
      companyId: 'acme-corp',
    },
  },
};

const mockCompany: Company = {
  id: 'acme-corp',
  name: 'Acme Corporation',
  baseCurrency: 'USD',
};

// Permission matrix
const rolePermissions: Record<UserRole, string[]> = {
  finance_manager: [
    'invoices.create',
    'invoices.edit',
    'invoices.delete',
    'invoices.view',
    'invoices.approve',
    'vendors.create',
    'vendors.edit',
    'vendors.view',
    'payables.view',
    'payables.mark_paid',
    'reconciliation.view',
    'reconciliation.match',
    'reports.view',
    'reports.export',
    'settings.view',
    'settings.edit',
    'users.manage',
  ],
  approver: [
    'invoices.view',
    'invoices.approve',
    'vendors.view',
    'payables.view',
  ],
  viewer: [
    'invoices.view',
    'vendors.view',
    'payables.view',
    'reports.view',
  ],
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const userData = mockUsers[email.toLowerCase()];
    if (!userData || userData.password !== password) {
      throw new Error('Invalid email or password');
    }

    setUser(userData.user);
    setCompany(mockCompany);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setCompany(null);
  }, []);

  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false;
      return rolePermissions[user.role]?.includes(permission) ?? false;
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
