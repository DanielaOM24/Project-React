// Tipos para las respuestas de la API
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id?: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  age?: number;
  weight?: number;
  height?: number;
  activityLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  preference?: 'NORMAL' | 'VEGETARIANO';
  meals?: number;
  goal?: 'LOSE_WEIGHT' | 'MAINTAIN_WEIGHT' | 'GAIN_MUSCLE';
  daily_calories?: number;
}

export interface RegisterData {
  displayName: string;
  email: string;
  password: string;
  weight?: number;
  height?: number;
  age?: number;
  preference?: 'NORMAL' | 'VEGETARIANO';
  meals?: number;
  goal?: 'LOSE_WEIGHT' | 'MAINTAIN_WEIGHT' | 'GAIN_MUSCLE';
  activityLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface UpdateProfileData {
  displayName?: string;
  avatarUrl?: string;
  weight?: number;
  height?: number;
  age?: number;
  preference?: 'NORMAL' | 'VEGETARIANO';
  meals?: number;
  goal?: 'LOSE_WEIGHT' | 'MAINTAIN_WEIGHT' | 'GAIN_MUSCLE';
  activityLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface GoogleLoginData {
  googleSub: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

