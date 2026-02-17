import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { User, Company, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithMicrosoft: () => Promise<void>;
  loginWithPhone: (phone: string, code: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

function mapSessionToUser(session: ReturnType<typeof useSession>['data']): User | null {
  if (!session?.user) return null;
  const u = session.user as { id: string; name?: string | null; email?: string | null; role?: string; companyId?: string };
  return {
    id: u.id || 'unknown',
    email: u.email || '',
    name: u.name || 'User',
    role: (u.role as UserRole) || 'viewer',
    companyId: u.companyId || 'default',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);

  // Sync NextAuth session to local state
  useEffect(() => {
    if (status === 'authenticated' && session) {
      const mappedUser = mapSessionToUser(session);
      setUser(mappedUser);
      setCompany(mockCompany);
    } else if (status === 'unauthenticated') {
      setUser(null);
      setCompany(null);
    }
  }, [session, status]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await nextAuthSignIn('demo-login', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error('Invalid email or password');
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    await nextAuthSignIn('google', { callbackUrl: '/' });
  }, []);

  const loginWithMicrosoft = useCallback(async () => {
    await nextAuthSignIn('microsoft-entra-id', { callbackUrl: '/' });
  }, []);

  const loginWithPhone = useCallback(async (phone: string, code: string) => {
    const result = await nextAuthSignIn('phone-otp', {
      phone,
      code,
      redirect: false,
    });

    if (result?.error) {
      throw new Error('Invalid verification code');
    }
  }, []);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(() => {
    setIsLoggingOut(true);
    nextAuthSignOut({ callbackUrl: '/' });
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
        isAuthenticated: !!user || isLoggingOut,
        isLoading: status === 'loading',
        login,
        loginWithGoogle,
        loginWithMicrosoft,
        loginWithPhone,
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
