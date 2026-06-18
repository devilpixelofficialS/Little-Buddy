"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { AuthUser, AuthSession, AuthContextType, LoginCredentials, RegisterCredentials } from "./types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "little-buddy-auth";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.session && new Date(parsed.session.expiresAt) > new Date()) {
          setUser(parsed.user);
          setSession(parsed.session);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const saveAuth = useCallback((userData: AuthUser, sessionData: AuthSession) => {
    setUser(userData);
    setSession(sessionData);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user: userData, session: sessionData })
    );
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      if (typeof window !== "undefined" && window.electron) {
        const result = await window.electron.invoke("auth:login", credentials);
        const data = result as { user: AuthUser; session: AuthSession };
        saveAuth(data.user, data.session);
        return;
      }

      const stored = localStorage.getItem("little-buddy-users");
      const users = stored ? JSON.parse(stored) : [];
      const found = users.find(
        (u: { email: string; password: string }) =>
          u.email === credentials.email && u.password === credentials.password
      );

      if (!found) {
        throw new Error("Invalid email or password");
      }

      const userData: AuthUser = {
        id: found.id,
        email: found.email,
        name: found.name,
        createdAt: new Date(found.createdAt),
        updatedAt: new Date(found.updatedAt),
      };

      const sessionData: AuthSession = {
        user: userData,
        token: `token_${Date.now()}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      saveAuth(userData, sessionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [saveAuth]);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      if (typeof window !== "undefined" && window.electron) {
        const result = await window.electron.invoke("auth:register", credentials);
        const data = result as { user: AuthUser; session: AuthSession };
        saveAuth(data.user, data.session);
        return;
      }

      const stored = localStorage.getItem("little-buddy-users");
      const users = stored ? JSON.parse(stored) : [];

      if (users.some((u: { email: string }) => u.email === credentials.email)) {
        throw new Error("Email already registered");
      }

      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: credentials.email,
        name: credentials.name,
        password: credentials.password,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem("little-buddy-users", JSON.stringify(users));

      const userData: AuthUser = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        createdAt: new Date(newUser.createdAt),
        updatedAt: new Date(newUser.updatedAt),
      };

      const sessionData: AuthSession = {
        user: userData,
        token: `token_${Date.now()}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      saveAuth(userData, sessionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [saveAuth]);

  const logout = useCallback(async () => {
    setUser(null);
    setSession(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
