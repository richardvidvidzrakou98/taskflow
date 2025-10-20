'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  isLoading: boolean;
  isHydrated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated
    setIsHydrated(true);
    
    // Check for existing auth token on mount
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData: AuthUser, token: string) => {
    setUser(userData);
    // The cookie is already set by the server, but we can set it client-side too for consistency
    if (typeof window !== 'undefined') {
      document.cookie = `auth-token=${token}; max-age=${7 * 24 * 60 * 60}; path=/; SameSite=Lax`;
    }
  };

  const logout = async () => {
    try {
      // Call logout API to clear server-side cookie
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    
    setUser(null);
    
    // Clear client-side cookie as backup
    if (typeof window !== 'undefined') {
      document.cookie = 'auth-token=; max-age=0; path=/';
      // Use router instead of direct window.location
      window.location.replace('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, isHydrated }}>
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