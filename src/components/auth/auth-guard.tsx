"use client";

import { ReactNode } from "react";
import { useAuth } from "@/auth";
import { AuthForm } from "./auth-form";
import { useState } from "react";

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent-primary/20 flex items-center justify-center animate-pulse">
            <div className="w-6 h-6 rounded-full bg-accent-primary/50" />
          </div>
          <p className="text-sm text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthForm
        mode={mode}
        onToggle={() => setMode(mode === "login" ? "register" : "login")}
      />
    );
  }

  return <>{children}</>;
}
