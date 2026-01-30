import { apiRequest } from './apiRequest';
import type { UpdateProfileData, UserProfile } from './types';

// API de perfil
export const profileAPI = {
  getProfile: async (): Promise<UserProfile> => {
    return apiRequest('/api/users/profile', { method: 'GET' });
  },

  updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    if (!data.displayName?.trim()) {
      throw new Error('El nombre no puede estar vacío');
    }

    // Convertir MAINTAIN antiguo a MAINTAIN_WEIGHT (el backend puede devolver MAINTAIN de datos antiguos)
    let goal: string = (data.goal as any) || 'MAINTAIN_WEIGHT';
    if (goal === 'MAINTAIN') {
      goal = 'MAINTAIN_WEIGHT';
    }

    const body = {
      displayName: data.displayName.trim(),
      avatarUrl: data.avatarUrl || '',
      weight: Math.max(0, Math.floor(Number(data.weight) || 0)),
      height: Math.max(0, Math.floor(Number(data.height) || 0)),
      age: Math.max(0, Math.floor(Number(data.age) || 0)),
      meals: Math.max(0, Math.floor(Number(data.meals) || 0)),
      preference: data.preference === 'VEGETARIANO' ? 'VEGETARIANO' : 'NORMAL',
      goal: ['LOSE_WEIGHT', 'MAINTAIN_WEIGHT', 'GAIN_MUSCLE'].includes(goal) ? goal : 'MAINTAIN_WEIGHT',
      activityLevel: ['LOW', 'MEDIUM', 'HIGH'].includes(data.activityLevel || '') ? data.activityLevel : 'LOW',
    };

    return apiRequest('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },
};
