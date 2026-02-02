// API Response Types

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
}

export interface GoogleLoginData {
  googleSub: string;
  email: string;
  name: string;
  avatarUrl?: string;
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

export type MediaType = 'IMAGE' | 'AUDIO';
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface NutritionProfileDto {
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

export interface MealAnalysisResponseDto {
  id: string;
  mediaUrl: string;
  mediaType: MediaType;
  mealType?: MealType;
  nutritionProfile?: NutritionProfileDto;
  analyzedAt?: string;
}

