'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Player } from '@/lib/mock-data';

interface AuthContextType {
  user: Player | null;
  login: (user: Player) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('mcballer-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      localStorage.removeItem('mcballer-user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (user: Player) => {
    localStorage.setItem('mcballer-user', JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('mcballer-user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
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
