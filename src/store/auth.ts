import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthState, AdminUser, LoginCredentials } from "@/types/auth";
import { generateToken, verifyToken } from "@/lib/auth";

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      login: async (credentials) => {
        try {
          set({ isLoading: true, error: null });

          // TODO: Implement actual login logic with Hasura
          // For now, we'll just simulate a successful login
          const mockUser: AdminUser = {
            id: "1",
            email: credentials.email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            isActive: true,
          };

          const token = await generateToken({
            sub: mockUser.id,
            email: mockUser.email,
            role: "admin",
          });

          localStorage.setItem("token", token);

          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Login failed",
            isLoading: false,
          });
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true, error: null });

          const token = localStorage.getItem("token");
          if (!token) {
            set({ isLoading: false });
            return;
          }

          const claims = await verifyToken(token);

          // TODO: Fetch user data from Hasura using claims.sub
          // For now, we'll just create a mock user
          const mockUser: AdminUser = {
            id: claims.sub,
            email: claims.email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            isActive: true,
          };

          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          localStorage.removeItem("token");
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
