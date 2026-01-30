import { apiRequest } from './apiRequest';
import type { UserProfile, UpdateProfileData } from './types';

// API de perfil
export const profileAPI = {
  // Obtener perfil
  getProfile: async (): Promise<UserProfile> => {
    return apiRequest('/api/users/profile', {
      method: 'GET',
    });
  },

  // Actualizar perfil
  updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    // Validar y preparar el cuerpo de la petición según el schema del Swagger
    // Asegurar que todos los campos requeridos estén presentes con valores válidos
    const requestBody: Record<string, any> = {
      displayName: (data.displayName && data.displayName.trim()) || '',
      avatarUrl: data.avatarUrl || '',
      weight: data.weight !== undefined && data.weight !== null ? Number(data.weight) : 0,
      height: data.height !== undefined && data.height !== null ? Number(data.height) : 0,
      age: data.age !== undefined && data.age !== null ? Number(data.age) : 0,
      preference: (data.preference === 'VEGETARIANO' || data.preference === 'NORMAL') ? data.preference : 'NORMAL',
      meals: data.meals !== undefined && data.meals !== null ? Number(data.meals) : 0,
      goal: (data.goal === 'LOSE_WEIGHT' || data.goal === 'MAINTAIN' || data.goal === 'GAIN_MUSCLE') ? data.goal : 'MAINTAIN',
      activityLevel: (data.activityLevel === 'LOW' || data.activityLevel === 'MEDIUM' || data.activityLevel === 'HIGH') ? data.activityLevel : 'LOW',
    };
    
    // Validar que los valores numéricos sean válidos (no NaN)
    requestBody.weight = isNaN(requestBody.weight) ? 0 : requestBody.weight;
    requestBody.height = isNaN(requestBody.height) ? 0 : requestBody.height;
    requestBody.age = isNaN(requestBody.age) ? 0 : requestBody.age;
    requestBody.meals = isNaN(requestBody.meals) ? 0 : requestBody.meals;
    
    console.log('[updateProfile] Enviando datos:', {
      ...requestBody,
      hasToken: true, // El token se incluirá automáticamente en apiRequest
    });
    
    return apiRequest('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(requestBody),
    });
  },
};

