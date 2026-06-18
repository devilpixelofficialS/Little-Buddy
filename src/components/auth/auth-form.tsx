"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/auth";

interface AuthFormProps {
  mode: "login" | "register";
  onToggle: () => void;
}

export function AuthForm({ mode, onToggle }: AuthFormProps) {
  const { login, register, error, clearError, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({ email, password, name });
      }
    } catch {
      // Error is handled by the auth context
    }
  };

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-accent-primary/20 flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 rounded-full bg-accent-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Little Buddy</h1>
          <p className="text-sm text-text-secondary mt-1">Your AI Desktop Assistant</p>
        </div>

        <div className="bg-background-secondary rounded-xl p-6 border border-background-tertiary">
          <h2 className="text-lg font-semibold text-text-primary mb-6">
            {mode === "login" ? "Sign In" : "Create Account"}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-accent-danger/10 border border-accent-danger/20 rounded-lg">
              <p className="text-sm text-accent-danger">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="text-sm font-medium text-text-secondary">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full mt-1 px-3 py-2 bg-background-tertiary border border-background-tertiary rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-text-secondary">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full mt-1 px-3 py-2 bg-background-tertiary border border-background-tertiary rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-text-secondary">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full mt-1 px-3 py-2 bg-background-tertiary border border-background-tertiary rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-accent-primary text-white font-medium rounded-lg hover:bg-accent-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              {isLoading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onToggle}
              className="text-sm text-text-secondary hover:text-accent-primary transition-colors duration-150"
            >
              {mode === "login"
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        <p className="text-xs text-text-muted text-center mt-4">
          Local-first assistant. Your data stays on your machine.
        </p>
      </div>
    </div>
  );
}
