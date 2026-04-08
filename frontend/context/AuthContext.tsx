"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api, { setAccessToken } from "@/lib/api";
import type { AuthUser, LoginResponse } from "@/types";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: try to rehydrate session from the httpOnly refresh cookie
  useEffect(() => {
    const rehydrate = async () => {
      try {
        // Attempt a token refresh first (uses the httpOnly cookie silently)
        const { data: refreshData } = await api.post("/auth/refresh");
        setAccessToken(refreshData.data.accessToken);

        // Then fetch the current user
        const { data: meData } = await api.get("/auth/me");
        setUser(meData.data);
      } catch {
        // No valid session — stay logged out
        setUser(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    rehydrate();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    const { data } = await api.post<{ success: true; data: LoginResponse }>("/auth/login", {
      email,
      password,
    });

    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
