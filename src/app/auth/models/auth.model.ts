export interface AuthUser {
  id?: string;
  name?: string;
  username: string;
  role?: string;
  department?: string;
  token?: string;
  accessTokenExpiresAt?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  message: string;
  user?: AuthUser;
}
