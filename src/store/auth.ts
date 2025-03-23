import { create } from "zustand";
import { persist } from "zustand/middleware";
import { graphqlRequest } from "@/lib/graphql";
import { LOGIN_ADMIN, UPDATE_LAST_LOGIN } from "@/lib/queries";

interface User {
  id: string;
  email: string;
  isActive: boolean;
  lastLoginAt: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  setToken: (token: string | null) => void;
  loginInvitee: (invitationToken: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      setToken: (token) => set({ token }),
      loginInvitee: async (invitationToken: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/anonymous-auth", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: invitationToken }),
          });

          if (!response.ok) {
            throw new Error("Failed to fetch anonymous token");
          }

          const { token } = await response.json();
          set({ token, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch anonymous token",
            isLoading: false,
          });
        }
      },

      login: async ({ email, password }) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/auth", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            throw new Error("Invalid credentials");
          }

          const { token } = await response.json();

          // Update state
          set({ token });

          // Query admin user by email
          const { admin_users } = await graphqlRequest<{
            admin_users: Array<{
              id: string;
              email: string;
              password_hash: string;
              is_active: boolean;
              last_login_at: string | null;
            }>;
          }>(LOGIN_ADMIN, { email });

          const adminUser = admin_users[0];

          if (!adminUser) {
            throw new Error("Invalid email or password");
          }

          // Update last login TODO: move to api call
          await graphqlRequest(UPDATE_LAST_LOGIN, { id: adminUser.id });

          // Update state
          set({
            user: {
              id: adminUser.id,
              email: adminUser.email,
              isActive: adminUser.is_active,
              lastLoginAt: adminUser.last_login_at,
            },
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
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);
