// Profile API Service

import type { UpdateProfileData, UserProfile } from '@/types';
import { Platform } from 'react-native';
import { apiRequest } from './apiRequest';
import { API_BASE_URL } from './config';
import { getToken, removeToken } from './token';

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

  /**
   * Sube una foto de perfil
   * POST /api/users/profile/photo
   * @param imageUri - URI de la imagen a subir
   * @returns URL de la foto subida
   */
  uploadProfilePhoto: async (imageUri: string): Promise<{ avatarUrl: string }> => {
    const token = await getToken();
    
    if (!token) {
      throw new Error('No estás autenticado. Por favor inicia sesión.');
    }

    try {
      // Leer el archivo como blob/base64 según la plataforma
      let fileData: any;
      let fileName: string;
      let mimeType: string;

      if (Platform.OS === 'web') {
        // En web, usar fetch para obtener el blob
        const response = await fetch(imageUri);
        const blob = await response.blob();
        fileData = blob;
        fileName = 'profile.jpg';
        mimeType = 'image/jpeg';
      } else {
        // En React Native, usar la URI directamente en FormData
        fileName = 'profile.jpg';
        mimeType = 'image/jpeg';
      }

      // Crear FormData
      const formData = new FormData();
      
      // Solo agregar el archivo al FormData
      if (Platform.OS === 'web') {
        // En web, usar File o Blob directamente
        formData.append('file', fileData, fileName);
      } else {
        // En React Native, usar el formato especial
        formData.append('file', {
          uri: imageUri,
          type: mimeType,
          name: fileName,
        } as any);
      }

      // Hacer la petición
      const response = await fetch(`${API_BASE_URL}/api/users/profile/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          // No establecer Content-Type, el navegador lo hará automáticamente con FormData
          ...(Platform.OS === 'web' ? {} : { 'Content-Type': 'multipart/form-data' }),
        },
        body: formData,
      });

      const responseText = await response.text();
      let responseData: any;
      
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        responseData = { message: responseText || 'Error desconocido' };
      }

      if (!response.ok) {
        const errorMessage = responseData.message || responseData.error || responseData.msg || `Error ${response.status}`;
        
        if (response.status === 401 || response.status === 403) {
          await removeToken();
          throw new Error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        }
        
        throw new Error(errorMessage);
      }

      return responseData as { avatarUrl: string };
    } catch (error: any) {
      console.error('[Profile API] Error al subir foto:', error);
      if (error.message) {
        throw error;
      }
      throw new Error('Error al subir la foto. Por favor intenta nuevamente.');
    }
  },
};
