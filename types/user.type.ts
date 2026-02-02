// User Profile Types

export interface UserProfile {
  id: number;
  displayName: string;
  email: string;
  avatarUrl?: string;
  weight: number;
  height: number;
  age: number;
  preference: 'NORMAL' | 'VEGETARIANO';
  meals: number;
  goal: 'LOSE_WEIGHT' | 'MAINTAIN_WEIGHT' | 'GAIN_MUSCLE';
  activityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  daily_calories?: number;
}

