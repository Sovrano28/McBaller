"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { AuthSession } from "@/lib/auth-types";
import { logout as serverLogout } from "@/lib/actions/auth";

interface AuthContextType {
  user: AuthSession | null;
  login: (user: AuthSession) => void;
  logout: () => Promise<void>;
  loading: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const response = await fetch("/api/auth/session");
      const data = await response.json();
      setUser(data.session);
    } catch (error) {
      console.error("Failed to fetch session", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const login = (user: AuthSession) => {
    setUser(user);
    // Refresh to sync with server
    fetchSession();
  };

  const logout = async () => {
    try {
      await serverLogout();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
    }
  };

  const refresh = async () => {
    await fetchSession();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refresh }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
