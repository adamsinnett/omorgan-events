export interface AdminUser {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface JWTClaims {
  sub: string; // user id
  email: string;
  role: "admin";
  iat: number;
  exp: number;
}
