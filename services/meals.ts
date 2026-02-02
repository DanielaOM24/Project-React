// Meals API Service

import type { MealAnalysisResponseDto, MealType, MediaType } from '@/types';
import { Platform } from 'react-native';
import { API_BASE_URL } from './config';
import { getToken, removeToken } from './token';

const uploadFile = async (
  fileUri: string,
  mediaType: MediaType,
  mealType: MealType = 'SNACK'
): Promise<MealAnalysisResponseDto> => {
  const token = await getToken();
  if (!token) {
    throw new Error('No estás autenticado. Por favor inicia sesión.');
  }

  try {
    let fileData: any;
    let fileName: string;
    let mimeType: string;

    if (Platform.OS === 'web') {
      const response = await fetch(fileUri);
      const blob = await response.blob();
      fileData = blob;
      fileName = mediaType === 'IMAGE' ? 'image.jpg' : 'audio.m4a';
      mimeType = mediaType === 'IMAGE' ? 'image/jpeg' : 'audio/m4a';
    } else {
      fileName = mediaType === 'IMAGE' ? 'image.jpg' : 'audio.m4a';
      mimeType = mediaType === 'IMAGE' ? 'image/jpeg' : 'audio/m4a';
    }

    const formData = new FormData();
    
    if (Platform.OS === 'web') {
      formData.append('file', fileData, fileName);
    } else {
      formData.append('file', {
        uri: fileUri,
        type: mimeType,
        name: fileName,
      } as any);
    }

    const url = new URL(`${API_BASE_URL}/api/meals/analyze`);
    url.searchParams.append('type', mediaType);
    url.searchParams.append('mealType', mealType);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        ...(Platform.OS === 'web' ? {} : { 'Content-Type': 'multipart/form-data' }),
      },
      body: formData,
    });

    const responseText = await response.text();
    let responseData: any;
    
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch {
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

    return responseData as MealAnalysisResponseDto;
  } catch (error: any) {
    if (error.message) {
      throw error;
    }
    throw new Error('Error al subir el archivo. Por favor intenta nuevamente.');
  }
};
export const uploadMealImage = async (imageUri: string, mealType: MealType = 'SNACK'): Promise<MealAnalysisResponseDto> => {
  return uploadFile(imageUri, 'IMAGE', mealType);
};

// Subir audio
export const uploadMealAudio = async (audioUri: string, mealType: MealType = 'SNACK'): Promise<MealAnalysisResponseDto> => {
  return uploadFile(audioUri, 'AUDIO', mealType);
};

// Obtener todos los análisis de comidas del usuario
export const getMealAnalyses = async (): Promise<MealAnalysisResponseDto[]> => {
  const token = await getToken();
  
  if (!token) {
    // Retornar array vacío en lugar de lanzar error si no hay token
    return [];
  }

  try {
    const fullUrl = `${API_BASE_URL}/api/meals`;
    
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      return [];
    }
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
    });

    const responseText = await response.text();
    let responseData: any;
    
    try {
      responseData = responseText ? JSON.parse(responseText) : [];
    } catch {
      responseData = [];
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        await removeToken();
      }
      return [];
    }

    return Array.isArray(responseData) ? responseData : [];
  } catch {
    return [];
  }
};

export const deleteMealAnalysis = async (id: string): Promise<void> => {
  const token = await getToken();
  if (!token) {
    throw new Error('No estás autenticado. Por favor inicia sesión.');
  }

  const endpoint = `/api/meals/${encodeURIComponent(id)}`;
  const fullUrl = `${API_BASE_URL}${endpoint}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch(fullUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const responseText = await response.text();
      let responseData: any;
      
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch {
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
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('La petición tardó demasiado. Por favor intenta nuevamente.');
      }
      throw fetchError;
    }
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu conexión a internet.');
    }
    if (error.message && (error.message.includes('Error') || error.message.includes('sesión') || error.message.includes('conexión'))) {
      throw error;
    }
    throw error;
  }
};

// Meals API Exports
export const mealsAPI = {
  uploadImage: uploadMealImage,
  uploadAudio: uploadMealAudio,
  getAll: getMealAnalyses,
  delete: deleteMealAnalysis,
};

