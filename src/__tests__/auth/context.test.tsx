import { renderHook, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/auth/context";
import { ReactNode } from "react";

const mockUser = {
  id: "user_123",
  email: "test@example.com",
  name: "Test User",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSession = {
  user: mockUser,
  token: "token_123",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
};

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should start with no user", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("should register a new user", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe("test@example.com");
    expect(result.current.user?.name).toBe("Test User");
  });

  it("should login an existing user", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });
    });

    await act(async () => {
      await result.current.logout();
    });

    await act(async () => {
      await result.current.login({
        email: "test@example.com",
        password: "password123",
      });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe("test@example.com");
  });

  it("should logout", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("should show error for invalid login", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });
    });

    await act(async () => {
      try {
        await result.current.login({
          email: "test@example.com",
          password: "wrongpassword",
        });
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe("Invalid email or password");
  });

  it("should show error for duplicate email", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });
    });

    await act(async () => {
      try {
        await result.current.register({
          email: "test@example.com",
          password: "password456",
          name: "Another User",
        });
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe("Email already registered");
  });

  it("should clear error", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      try {
        await result.current.login({
          email: "test@example.com",
          password: "wrongpassword",
        });
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it("should persist session in localStorage", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });
    });

    const stored = localStorage.getItem("little-buddy-auth");
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored!);
    expect(parsed.user.email).toBe("test@example.com");
  });
});
