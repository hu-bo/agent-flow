import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { setApiKey as storeApiKey, clearApiKey, hasApiKey } from '../api/client';

interface AuthState {
  authenticated: boolean;
  isAdmin: boolean;
  login: (apiKey: string, admin?: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(hasApiKey);
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('af_gw_is_admin') === 'true');

  const login = useCallback((apiKey: string, admin = false) => {
    storeApiKey(apiKey);
    setAuthenticated(true);
    setIsAdmin(admin);
    localStorage.setItem('af_gw_is_admin', String(admin));
  }, []);

  const logout = useCallback(() => {
    clearApiKey();
    setAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('af_gw_is_admin');
  }, []);

  return (
    <AuthContext.Provider value={{ authenticated, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
