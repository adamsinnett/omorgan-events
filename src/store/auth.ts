import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateToken, verifyToken } from "@/lib/auth";
import { graphqlRequest } from "@/lib/graphql";
import { LOGIN_ADMIN, UPDATE_LAST_LOGIN } from "@/lib/queries";
import { comparePasswords } from "@/lib/auth";
import { JWTClaims } from "@/types/auth";

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
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      login: async ({ email, password }) => {
        set({ isLoading: true, error: null });

        try {
          // Query admin user by email
          const { data } = await graphqlRequest<{
            admin_users: Array<{
              id: string;
              email: string;
              password_hash: string;
              is_active: boolean;
              last_login_at: string | null;
            }>;
          }>(LOGIN_ADMIN, { email });

          const adminUser = data.admin_users[0];

          if (!adminUser) {
            throw new Error("Invalid email or password");
          }

          // Verify password
          const isValidPassword = await comparePasswords(
            password,
            adminUser.password_hash
          );

          if (!isValidPassword) {
            throw new Error("Invalid email or password");
          }

          if (!adminUser.is_active) {
            throw new Error("Account is deactivated");
          }

          // Update last login
          await graphqlRequest(UPDATE_LAST_LOGIN, { id: adminUser.id });

          // Generate JWT token
          const claims: Omit<JWTClaims, "iat" | "exp"> = {
            id: adminUser.id,
            email: adminUser.email,
            role: "admin",
          };
          const token = await generateToken(claims);

          // Update state
          set({
            user: {
              id: adminUser.id,
              email: adminUser.email,
              isActive: adminUser.is_active,
              lastLoginAt: adminUser.last_login_at,
            },
            token,
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

      checkAuth: async () => {
        const { token } = get();
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          const claims = await verifyToken(token);
          if (!claims) {
            set({ isAuthenticated: false, user: null });
            return;
          }

          // Query user data
          const { data } = await graphqlRequest<{
            admin_users: Array<{
              id: string;
              email: string;
              is_active: boolean;
              last_login_at: string | null;
            }>;
          }>(LOGIN_ADMIN, { email: claims.email });

          const adminUser = data.admin_users[0];

          if (!adminUser || !adminUser.is_active) {
            set({ isAuthenticated: false, user: null, token: null });
            return;
          }

          set({
            user: {
              id: adminUser.id,
              email: adminUser.email,
              isActive: adminUser.is_active,
              lastLoginAt: adminUser.last_login_at,
            },
            isAuthenticated: true,
            token,
          });
        } catch (error) {
          set({ isAuthenticated: false, user: null, token: null });
        }
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
