export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'banned' | 'deleted';

export interface User {
  id: number;
  username: string;
  email: string;
  nickname?: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  expPoints: number;
  level: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: number;
  username: string;
  nickname?: string;
  avatarUrl?: string;
  role: UserRole;
  expPoints: number;
  level: number;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  nickname?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
